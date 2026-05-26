import type {
  ActionNode,
  AssignmentNode,
  CallStatementNode,
  EnvironmentBlockNode,
  ExpressionNode,
  StatementNode,
  VariableDeclarationNode,
  DataType,
} from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors.js'
import { buildMessage } from '../../constants/errorMessages.js'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import { Environment } from '../environment/environment'
import { EnvironmentManager } from '../environment/environmentManager'
import { TypeChecker } from '../types/index'
import { CallableRegistry } from '../callables/callableRegistry'
import { CallableExecutor } from '../callables/callableExecutor'
import type { EvaluatorContext } from '../types/evaluatorContext'
import { BuiltinRegistry, initBuiltins } from '../builtins/index'
import { CallableInvoker } from '../callables/callableInvoker'
import { CallableResolver } from '../callables/callableResolver'
import { evaluateExpressionNode } from '../evaluators/expressionEvaluator'
import { isSequencePrimitive, evaluateSequenceProcedure } from '../evaluators/sequences'
import { createInitialSequence } from '../types/SequenceValue'
import { analyzeSequences } from '../../analysis/sequenceAnalyzer'
import { StatementDispatcher } from './statementDispatcher'

export interface EvaluationResult {
  output: string[]
  variables: Record<string, unknown>
}

export type InputRequestHandler = (name: string) => Promise<unknown>

export type OutputHandler = (line: string) => void

export type SequenceInfo = { name: string; elementType?: DataType | null }
export type LoadedSequenceData = { name: string; elements: unknown[] }

export class Evaluator {
  private environment: Environment
  private readonly output: string[] = []
  private readonly requestInput: InputRequestHandler
  private readonly pushOutput: OutputHandler
  private registry: CallableRegistry = new CallableRegistry()
  private readonly builtinRegistry: BuiltinRegistry
  private readonly typeChecker: TypeChecker = new TypeChecker()
  private readonly environmentManager: EnvironmentManager
  private readonly callableExecutor: CallableExecutor
  private readonly context: EvaluatorContext
  private readonly dispatcher: StatementDispatcher
  private readonly invoker: CallableInvoker
  private readonly options?: { onSequencesRequired?: (sequences: SequenceInfo[]) => Promise<LoadedSequenceData[]> }

  constructor(
    environment: Environment,
    requestInput: InputRequestHandler = async () => null,
    pushOutput?: OutputHandler,
    options?: { onSequencesRequired?: (sequences: SequenceInfo[]) => Promise<LoadedSequenceData[]> },
  ) {
    this.environment = environment
    this.requestInput = requestInput
    this.pushOutput = pushOutput ?? ((line) => this.output.push(line))
    this.options = options
    this.environmentManager = new EnvironmentManager(environment)
    this.builtinRegistry = initBuiltins()
    this.callableExecutor = new CallableExecutor(
      {
        getEnvironment: () => this.environment,
        setEnvironment: (nextEnvironment) => {
          this.environment = nextEnvironment
        },
        getRegistry: () => this.registry,
        setRegistry: (nextRegistry) => {
          this.registry = nextRegistry
        },
        evaluateBlock: (statements) => this.evaluateBlock(statements),
        initializeEnvironmentDeclarations: (ambiente) => this.initializeEnvironmentDeclarations(ambiente),
      },
      this.typeChecker,
      this.environmentManager,
    )
    const callableResolver = new CallableResolver(this.builtinRegistry, this.registry)
    this.invoker = new CallableInvoker(callableResolver, this.callableExecutor)

    const self = this
    this.context = {
      evaluateExpression: (node) => this.evaluateExpression(node),
      evaluateBlock: (nodes) => this.evaluateBlock(nodes),
      requestInput: (prompt) => this.requestInput(prompt),
      hasVariable: (name) => this.environment.has(name),
      lookupVariableType: (name) => this.environment.lookupType(name),
      assignVariable: (name, value) => this.environment.assign(name, value),
      defineVariable: (name, value, type, isConstant) => this.environment.define(name, value, type, isConstant),
      pushOutput: (line) => this.pushOutput(line),
      lookup: (name) => this.environment.lookup(name),
      invokeFunction: (name, args) => this.invoker.invokeFunction(name, args),
      get environment() {
        return self.environment
      },
      get typeChecker() {
        return self.typeChecker
      },
    }
    this.dispatcher = new StatementDispatcher(this.context, (node) => this.evaluateCoreStatement(node))
  }

  public async evaluate(action: ActionNode): Promise<EvaluationResult> {
    this.registry.registerFromEnvironment(action.ambiente)
    this.initializeEnvironmentDeclarations(action.ambiente)
    // Post-Ambiente: detectar secuencias en modo 'idle' y pausar si es necesario
    try {
      const idle = this.collectIdleSequences()
      // analizar el AST para detectar qué secuencias son iniciadas con Arrancar en el Proceso
      const astSeqs = analyzeSequences(action.proceso)
      const startNames = new Set(astSeqs.filter((s) => s.kind === 'start').map((s) => s.name))
      const toRequest = idle.filter((s) => startNames.has(s.name))

      if (toRequest.length > 0 && this.options?.onSequencesRequired) {
        const loaded = await this.options.onSequencesRequired(toRequest)
        if (Array.isArray(loaded)) {
          for (const item of loaded) {
            if (!item || typeof item.name !== 'string') continue
            if (this.environment.has(item.name)) {
              try {
                const current = this.environment.lookup(item.name)
                if (current && typeof current === 'object') {
                  ;(current as any).elements = Array.isArray(item.elements) ? item.elements : []
                }
              } catch {
                // ignore lookup errors; environment might be different scope
              }
            }
          }
        }
      }
    } catch (err) {
      // If onSequencesRequired throws, forward as runtime error
      throw new RuntimeError({
        code: ErrorCode.RUN_INVALID_ARGUMENT,
        message: (err instanceof Error && err.message) ? `Error en onSequencesRequired: ${err.message}` : 'Error en onSequencesRequired',
        module: 'interpreter',
      })
    }

    await this.dispatcher.dispatchBlock(action.proceso)

    return {
      output: [...this.output],
      variables: this.environment.snapshot(),
    }
  }

  private collectIdleSequences(): SequenceInfo[] {
    const results: SequenceInfo[] = []
    const snap = this.environment.snapshot()
    for (const [name, value] of Object.entries(snap)) {
      if (!value || typeof value !== 'object') continue
      const v = value as any
      if (v.kind === 'Secuencia' && Array.isArray(v.elements) && v.mode === 'idle') {
        results.push({ name, elementType: v.elementType ?? null })
      }
    }
    return results
  }

  private initializeEnvironmentDeclarations(ambiente: EnvironmentBlockNode): void {
    for (const variableDecl of ambiente.variables) {
      for (const variable of variableDecl.variables) {
        // If the declared type is a Secuencia, initialize with a SequenceValue in 'idle' mode
        if (variableDecl.dataType && typeof variableDecl.dataType === 'object' && (variableDecl.dataType as any).kind === 'Secuencia') {
          const elementType = (variableDecl.dataType as any).elementType
          const seq = createInitialSequence(elementType)
          // keep mode 'idle' (createInitialSequence defaults to 'idle')
          this.environment.define(variable, seq, variableDecl.dataType)
        } else {
          this.environment.define(variable, null, variableDecl.dataType)
        }
      }
    }

    for (const constantDecl of ambiente.constants) {
      this.environment.define(constantDecl.name, constantDecl.value, constantDecl.dataType, true)
    }
  }

  private async evaluateCoreStatement(node: VariableDeclarationNode | AssignmentNode | CallStatementNode): Promise<void> {
    switch (node.type) {
      case 'VariableDeclaration':
        this.evaluateVariableDeclaration(node)
        return
      case 'Assignment':
        await this.evaluateAssignment(node)
        return
      case 'CallStatement':
        await this.evaluateCallStatement(node)
        return
      default:
        throw new RuntimeError({
          code: ErrorCode.GEN_UNKNOWN,
          message: ERROR_MESSAGES.UNKNOWN_STATEMENT_NODE((node as { type: string }).type),
          module: 'interpreter',
          context: { nodeType: (node as { type: string }).type },
        })
    }
  }

  private evaluateVariableDeclaration(node: VariableDeclarationNode): void {
    for (const variable of node.variables) {
      this.environment.define(variable, null, node.dataType)
    }
  }

  private async evaluateAssignment(node: AssignmentNode): Promise<void> {
    const value = await this.evaluateExpression(node.value)
    this.typeChecker.assertVariableExists(node.variable, this.environment)

    const expectedType = this.environment.lookupType(node.variable)
    if (expectedType !== null && value !== null) {
      this.typeChecker.assertValueMatchesType(value, expectedType, `la variable '${node.variable}'`)
    }

    this.environment.assign(node.variable, value)
  }

  private async evaluateCallStatement(node: CallStatementNode): Promise<void> {
    // Intercept sequence primitives and dispatch directly (they may need raw AST args)
    if (isSequencePrimitive(node.call.name)) {
      await evaluateSequenceProcedure(node.call.name, node.call.arguments, this.context as any)
      return
    }

    const args: unknown[] = []
    for (const arg of node.call.arguments) {
      args.push(await this.evaluateExpression(arg))
    }
    if (this.registry.isProcedure(node.call.name)) {
      await this.invoker.invokeProcedure(node.call.name, args)
      return
    }

    if (this.registry.isFunction(node.call.name)) {
      await this.invoker.invokeFunction(node.call.name, args)
      return
    }

    throw new RuntimeError({
      code: ErrorCode.RUN_UNDEFINED_IDENTIFIER,
      message: ERROR_MESSAGES.NO_FUNCTION_OR_PROCEDURE(node.call.name),
      module: 'interpreter',
      context: { name: node.call.name },
    })
  }

  private async evaluateBlock(statements: StatementNode[]): Promise<void> {
    await this.dispatcher.dispatchBlock(statements)
  }

  private async evaluateExpression(node: ExpressionNode): Promise<unknown> {
    return await evaluateExpressionNode(node, this.context)
  }
}