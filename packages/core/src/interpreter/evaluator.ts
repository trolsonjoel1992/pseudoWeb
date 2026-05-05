import type {
  ActionNode,
  AssignmentNode,
  CallStatementNode,
  DoWhileNode,
  EnvironmentBlockNode,
  ExpressionNode,
  ForNode,
  IfNode,
  ReadNode,
  StatementNode,
  SwitchNode,
  VariableDeclarationNode,
  WhileNode,
  WriteNode,
} from '../parser/ast'
import { RuntimeError } from '../errors'
import { Environment } from './environment'
import { TypeChecker } from './typeSystem'
import { CallableRegistry } from './callableRegistry'
import { ContextFactory } from './contextFactory'
import { CallableExecutor } from './callableExecutor'
import { EnvironmentManager } from './environmentManager'
import type { EvaluatorContext } from './types/evaluatorContext'

import { evaluateExpressionNode } from './evaluators/expressionEvaluator'
import { evaluateForNode, evaluateIfNode, evaluateWhileNode } from './evaluators/controlFlowEvaluator'
import { evaluateReadNode, evaluateWriteNode } from './evaluators/ioEvaluator'
import { evaluateSwitchNode } from './evaluators/switchEvaluator'
import { evaluateDoWhileNode } from './evaluators/doWhileEvaluator'

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
  private typeChecker: TypeChecker = new TypeChecker()
  private readonly environmentManager: EnvironmentManager
  private readonly callableExecutor: CallableExecutor
  private readonly context: EvaluatorContext

  constructor(environment: Environment, requestInput: InputRequestHandler = async () => null, pushOutput?: OutputHandler) {
    this.environment = environment
    this.requestInput = requestInput
    this.pushOutput = pushOutput ?? ((line) => this.output.push(line))
    this.environmentManager = new EnvironmentManager(environment)
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
    this.context = new ContextFactory({
      evaluateExpression: (node) => this.evaluateExpression(node),
      evaluateBlock: (nodes) => this.evaluateBlock(nodes),
      hasVariable: (name) => this.environment.has(name),
      lookupVariable: (name) => this.environment.lookup(name),
      lookupVariableType: (name) => this.environment.lookupType(name),
      assignVariable: (name, value) => this.environment.assign(name, value),
      defineVariable: (name, value, type, isConstant) => this.environment.define(name, value, type, isConstant),
      requestInput: (prompt) => this.requestInput(prompt),
      pushOutput: (line) => this.pushOutput(line),
      invokeFunction: (name, args) => this.invokeFunction(name, args),
      getEnvironment: () => this.environment,
      getTypeChecker: () => this.typeChecker,
    }).create()
  }

  public async evaluate(action: ActionNode): Promise<EvaluationResult> {
    this.registry.registerFromEnvironment(action.ambiente)
    this.initializeEnvironmentDeclarations(action.ambiente)

    for (const statement of action.proceso) {
      await this.evaluateStatement(statement)
    }

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

  private async evaluateStatement(node: StatementNode): Promise<void> {
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
      case 'Write':
        await this.evaluateWrite(node)
        return
      case 'Read':
        await this.evaluateRead(node)
        return
      case 'If':
        await this.evaluateIf(node)
        return
      case 'While':
        await this.evaluateWhile(node)
        return
      case 'For':
        await this.evaluateFor(node)
        return
      case 'Switch':
        await this.evaluateSwitch(node as SwitchNode)
        return
      case 'DoWhile':
        await this.evaluateDoWhile(node as DoWhileNode)
        return
      default:
        throw new RuntimeError(`Nodo de sentencia desconocido: ${(node as { type: string }).type}`)
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
      await this.invokeProcedure(node.call.name, args)
      return
    }

    if (this.registry.isFunction(node.call.name)) {
      await this.invokeFunction(node.call.name, args)
      return
    }

    throw new RuntimeError(`No existe una función o procedimiento llamado '${node.call.name}'.`)
  }

  private async evaluateWrite(node: WriteNode): Promise<void> {
    await evaluateWriteNode(node, this.context)
  }

  private async evaluateRead(node: ReadNode): Promise<void> {
    await evaluateReadNode(node, this.context)
  }

  private async evaluateIf(node: IfNode): Promise<void> {
    await evaluateIfNode(node, this.context)
  }

  private async evaluateWhile(node: WhileNode): Promise<void> {
    await evaluateWhileNode(node, this.context)
  }

  private async evaluateFor(node: ForNode): Promise<void> {
    await evaluateForNode(node, this.context)
  }

  private async evaluateBlock(statements: StatementNode[]): Promise<void> {
    for (const statement of statements) {
      await this.evaluateStatement(statement)
    }
  }

  private async evaluateExpression(node: ExpressionNode): Promise<unknown> {
    return await evaluateExpressionNode(node, this.context)
  }

  private async invokeFunction(name: string, args: unknown[]): Promise<unknown> {
    if (name.toLowerCase() === 'redond') {
      if (args.length !== 1) {
        throw new RuntimeError("REDOND requiere exactamente 1 argumento.")
      }
      const value = args[0]
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new RuntimeError('REDOND solo acepta un argumento numérico.')
      }
      return Math.round(value)
    }

    const declaration = this.registry.getFunction(name)
    if (!declaration) {
      if (this.registry.isProcedure(name)) {
        throw new RuntimeError(`'${name}' es un procedimiento y no puede usarse dentro de una expresión.`)
      }
      throw new RuntimeError(`No existe una función llamada '${name}'.`)
    }

    return await this.callableExecutor.executeFunction(declaration, args)
  }

  private async invokeProcedure(name: string, args: unknown[]): Promise<void> {
    const declaration = this.registry.getProcedure(name)
    if (!declaration) {
      if (this.registry.isFunction(name)) {
        throw new RuntimeError(`'${name}' es una función y debe usarse dentro de una expresión.`)
      }
      throw new RuntimeError(`No existe un procedimiento llamado '${name}'.`)
    }

    await this.callableExecutor.executeProcedure(declaration, args)
  }

  private async evaluateSwitch(node: SwitchNode): Promise<void> {
    await evaluateSwitchNode(node, this.context)
  }

  private async evaluateDoWhile(node: DoWhileNode): Promise<void> {
    await evaluateDoWhileNode(node, this.context)
  }
}

