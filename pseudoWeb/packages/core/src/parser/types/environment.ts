// Environment and Action node types

import type { Node } from './core'
import type { ConstantDeclarationNode, VariableDeclarationNode, FunctionDeclarationNode, ProcedureDeclarationNode } from './declarations'
import type { StatementNode } from './control'

export interface EnvironmentBlockNode extends Node {
  type: 'EnvironmentBlock'
  constants: ConstantDeclarationNode[]
  variables: VariableDeclarationNode[]
  functions: FunctionDeclarationNode[]
  procedures: ProcedureDeclarationNode[]
}

export interface ActionNode extends Node {
  type: 'Action'
  name: string
  ambiente: EnvironmentBlockNode
  proceso: StatementNode[]
}

export const EMPTY_ENVIRONMENT_BLOCK: EnvironmentBlockNode = {
  type: 'EnvironmentBlock',
  constants: [],
  variables: [],
  functions: [],
  procedures: [],
}
