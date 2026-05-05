// Expression node types

import type { Node } from './core'
import type { UnaryOperator, BinaryOperator } from './operations'
import type { LiteralValue } from './data'

export interface LiteralNode extends Node {
  type: 'Literal'
  value: LiteralValue
}

export interface IdentifierNode extends Node {
  type: 'Identifier'
  name: string
}

export interface BinaryExpressionNode extends Node {
  type: 'BinaryExpression'
  operator: BinaryOperator
  left: ExpressionNode
  right: ExpressionNode
}

export interface UnaryExpressionNode extends Node {
  type: 'UnaryExpression'
  operator: UnaryOperator
  right: ExpressionNode
}

export interface GroupingNode extends Node {
  type: 'Grouping'
  expression: ExpressionNode
}

export interface FunctionCallNode extends Node {
  type: 'FunctionCall'
  name: string
  arguments: ExpressionNode[]
}

export type ExpressionNode =
  | LiteralNode
  | IdentifierNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | GroupingNode
  | FunctionCallNode
