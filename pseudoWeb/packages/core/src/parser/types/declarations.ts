// Variable, Constant, Parameter, Function, and Procedure declarations

import type { Node } from './core'
import type { DataType, LiteralValue } from './data'
import type { EnvironmentBlockNode } from './environment'
import type { StatementNode } from './control'

export interface VariableDeclarationNode extends Node {
  type: 'VariableDeclaration'
  variables: string[]
  dataType: DataType
}

export interface ConstantDeclarationNode extends Node {
  type: 'ConstantDeclaration'
  name: string
  value: LiteralValue
  dataType: DataType
}

export interface ParameterNode extends Node {
  type: 'Parameter'
  name: string
  dataType: DataType
  byReference: boolean
}

export interface FunctionDeclarationNode extends Node {
  type: 'FunctionDeclaration'
  name: string
  parameters: ParameterNode[]
  returnType: DataType
  ambiente: EnvironmentBlockNode
  proceso: StatementNode[]
}

export interface ProcedureDeclarationNode extends Node {
  type: 'ProcedureDeclaration'
  name: string
  parameters: ParameterNode[]
  ambiente: EnvironmentBlockNode
  proceso: StatementNode[]
}
