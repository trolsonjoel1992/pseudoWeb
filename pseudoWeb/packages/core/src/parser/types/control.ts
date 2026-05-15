// Control flow statement node types

import type { Node } from './core'
import type { FunctionDeclarationNode, ProcedureDeclarationNode, VariableDeclarationNode } from './declarations'
import type { ExpressionNode } from './expressions'
import type { AssignmentNode, CallStatementNode, ReadNode, WriteNode } from './statements'

export interface IfNode extends Node {
  type: 'If'
  condition: ExpressionNode
  thenBranch: StatementNode[]
  elseBranch: StatementNode[]
}

export interface WhileNode extends Node {
  type: 'While'
  condition: ExpressionNode
  body: StatementNode[]
}

export interface ForNode extends Node {
  type: 'For'
  variable: string
  start: ExpressionNode
  end: ExpressionNode
  body: StatementNode[]
  step?: ExpressionNode
}

export interface DoWhileNode extends Node {
  type: 'DoWhile'
  body: StatementNode[]
  condition: ExpressionNode
}

export type SwitchCaseCondition =
  | { type: 'Default' }
  | { type: 'ExactMatch'; value: ExpressionNode }
  | { type: 'Comparison'; operator: 'Mayor' | 'Menor' | 'MayorIgual' | 'MenorIgual'; value: ExpressionNode }

export interface SwitchCaseNode extends Node {
  type: 'SwitchCase'
  condition: SwitchCaseCondition
  body: StatementNode[]
}

export interface SwitchNode extends Node {
  type: 'Switch'
  expression: ExpressionNode
  cases: SwitchCaseNode[]
}

// StatementNode union - includes all statement types from all modules
export type StatementNode =
  | VariableDeclarationNode
  | AssignmentNode
  | CallStatementNode
  | WriteNode
  | ReadNode
  | IfNode
  | WhileNode
  | ForNode
  | DoWhileNode
  | SwitchNode
  | FunctionDeclarationNode
  | ProcedureDeclarationNode
