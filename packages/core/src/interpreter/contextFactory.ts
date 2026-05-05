import type { DataType, ExpressionNode, StatementNode } from '../parser/ast'
import type { Environment } from './environment'
import type { TypeChecker } from './typeSystem'
import type { EvaluatorContext } from './types/evaluatorContext'

export type ContextFactoryHost = {
  evaluateExpression: (node: ExpressionNode) => Promise<unknown>
  evaluateBlock: (nodes: StatementNode[]) => Promise<void>
  hasVariable: (name: string) => boolean
  lookupVariable: (name: string) => unknown
  lookupVariableType: (name: string) => DataType | null
  assignVariable: (name: string, value: unknown) => void
  defineVariable: (name: string, value: unknown, type?: DataType, isConstant?: boolean) => void
  requestInput: (prompt: string) => Promise<unknown>
  pushOutput: (line: string) => void
  invokeFunction: (name: string, args: unknown[]) => Promise<unknown>
  getEnvironment: () => Environment
  getTypeChecker: () => TypeChecker
}

export class ContextFactory {
  constructor(private readonly host: ContextFactoryHost) {}

  public create(): EvaluatorContext {
    const host = this.host

    return {
      evaluateExpression: (node) => host.evaluateExpression(node),
      evaluateBlock: (nodes) => host.evaluateBlock(nodes),
      requestInput: (prompt) => host.requestInput(prompt),
      hasVariable: (name) => host.hasVariable(name),
      lookupVariableType: (name) => host.lookupVariableType(name),
      assignVariable: (name, value) => host.assignVariable(name, value),
      defineVariable: (name, value, type, isConstant) => host.defineVariable(name, value, type, isConstant),
      pushOutput: (line) => host.pushOutput(line),
      lookup: (name) => host.lookupVariable(name),
      invokeFunction: (name, args) => host.invokeFunction(name, args),
      get environment() {
        return host.getEnvironment()
      },
      get typeChecker() {
        return host.getTypeChecker()
      },
    }
  }
}
