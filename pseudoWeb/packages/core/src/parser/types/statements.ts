// I/O and basic statement node types

import type { Node } from './core'
import type { ExpressionNode, FunctionCallNode } from './expressions'

export interface AssignmentNode extends Node {
  type: 'Assignment'
  variable: string
  value: ExpressionNode
}

export interface WriteNode extends Node {
  type: 'Write'
  values: ExpressionNode[]
}

export interface ReadNode extends Node {
  type: 'Read'
  variables: string[]
}

export interface CallStatementNode extends Node {
  type: 'CallStatement'
  call: FunctionCallNode
}

// StatementNode union is defined after control flow nodes
// See control.ts for full StatementNode type
export type BasicStatementNode =
  | AssignmentNode
  | CallStatementNode
  | WriteNode
  | ReadNode
