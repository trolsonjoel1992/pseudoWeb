import type {
  ActionNode,
  AssignmentNode,
  CallStatementNode,
  EnvironmentBlockNode,
  ExpressionNode,
  StatementNode,
  VariableDeclarationNode,
} from '../../parser/ast'
import { RuntimeError } from '../../errors'
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
import { StatementDispatcher } from './statementDispatcher'

export interface EvaluationResult {
  output: string[]
  variables: Record<string, unknown>
}

export type InputRequestHandler = (name: string) => Promise<unknown>

export type OutputHandler = (line: string) => void

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

  constructor(environment: Environment, requestInput: InputRequestHandler = async () => null, pushOutput?: OutputHandler) {
    this.environment = environment
    this.requestInput = requestInput
    this.pushOutput = pushOutput ?? ((line) => this.output.push(line))
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

    await this.dispatcher.dispatchBlock(action.proceso)

    return {
      output: [...this.output],
      variables: this.environment.snapshot(),
    }
  }

  private initializeEnvironmentDeclarations(ambiente: EnvironmentBlockNode): void {
    for (const variableDecl of ambiente.variables) {
      for (const variable of variableDecl.variables) {
        this.environment.define(variable, null, variableDecl.dataType)
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
        throw new RuntimeError(ERROR_MESSAGES.UNKNOWN_STATEMENT_NODE((node as { type: string }).type))
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

    throw new RuntimeError(ERROR_MESSAGES.NO_FUNCTION_OR_PROCEDURE(node.call.name))
  }

  private async evaluateBlock(statements: StatementNode[]): Promise<void> {
    await this.dispatcher.dispatchBlock(statements)
  }

  private async evaluateExpression(node: ExpressionNode): Promise<unknown> {
    return await evaluateExpressionNode(node, this.context)
  }
}