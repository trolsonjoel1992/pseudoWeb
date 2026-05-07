import type {
  DataType,
  ExpressionNode,
  StatementNode,
} from '../../parser/ast'
import type { Environment } from '../environment/environment'
import type { TypeChecker } from '../types/index'

export interface EvaluatorContext {
  evaluateExpression: (node: ExpressionNode) => Promise<unknown>
  evaluateBlock: (statements: StatementNode[]) => Promise<void>
  requestInput: (name: string) => Promise<unknown>
  hasVariable: (name: string) => boolean
  lookupVariableType: (name: string) => DataType | null
  assignVariable: (name: string, value: unknown) => void
  defineVariable: (name: string, value: unknown, type?: DataType, isConstant?: boolean) => void
  pushOutput: (line: string) => void
  lookup: (name: string) => unknown
  invokeFunction: (name: string, args: unknown[]) => Promise<unknown>
  environment: Environment
  typeChecker: TypeChecker
}
