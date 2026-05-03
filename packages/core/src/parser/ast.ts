export type DataType = 'Entero' | 'Real' | 'Caracter' | 'Alfanumerico' | 'Logico'
export type LiteralValue = string | number | boolean | null

export type UnaryOperator = 'Resta' | 'No'

export type BinaryOperator =
  | 'Suma'
  | 'Resta'
  | 'Multiplicacion'
  | 'Division'
  | 'Div'
  | 'Mod'
  | 'Potencia'
  | 'Igual'
  | 'Distinto'
  | 'Menor'
  | 'Mayor'
  | 'MenorIgual'
  | 'MayorIgual'
  | 'Y'
  | 'O'

export interface Node {
  type: string;
  line?: number;
  column?: number;
}

export interface VariableDeclarationNode extends Node {
  type: 'VariableDeclaration';
  variables: string[]; // Lista de nombres de variables
  dataType: DataType;
}

export interface ConstantDeclarationNode extends Node {
  type: 'ConstantDeclaration';
  name: string;
  value: LiteralValue;
  dataType: DataType;
}

export interface ParameterNode extends Node {
  type: 'Parameter';
  name: string;
  dataType: DataType;
  byReference: boolean; // true si es parámetro por referencia (&)
}

export interface FunctionDeclarationNode extends Node {
  type: 'FunctionDeclaration';
  name: string;
  parameters: ParameterNode[];
  returnType: DataType;
  ambiente: EnvironmentBlockNode;
  proceso: StatementNode[];
}

export interface ProcedureDeclarationNode extends Node {
  type: 'ProcedureDeclaration';
  name: string;
  parameters: ParameterNode[];
  ambiente?: EnvironmentBlockNode;
  proceso: StatementNode[];
}

export interface EnvironmentBlockNode extends Node {
  type: 'EnvironmentBlock';
  constants: ConstantDeclarationNode[];
  variables: VariableDeclarationNode[];
  functions: FunctionDeclarationNode[];
  procedures: ProcedureDeclarationNode[];
}

export interface ActionNode extends Node {
  type: 'Action';
  name: string;
  ambiente: EnvironmentBlockNode;
  proceso: StatementNode[];
}

export interface AssignmentNode extends Node {
  type: 'Assignment';
  variable: string;
  value: ExpressionNode;
}

export interface WriteNode extends Node {
  type: 'Write';
  values: ExpressionNode[];
}

export interface ReadNode extends Node {
  type: 'Read';
  variables: string[];
}

export interface IfNode extends Node {
  type: 'If';
  condition: ExpressionNode;
  thenBranch: StatementNode[];
  elseBranch: StatementNode[];
}

export interface WhileNode extends Node {
  type: 'While';
  condition: ExpressionNode;
  body: StatementNode[];
}

export interface ForNode extends Node {
  type: 'For';
  variable: string;
  start: ExpressionNode;
  end: ExpressionNode;
  body: StatementNode[];
  step?: ExpressionNode;
}

export interface FunctionCallNode extends Node {
  type: 'FunctionCall';
  name: string;
  arguments: ExpressionNode[];
}

export interface LiteralNode extends Node {
  type: 'Literal';
  value: LiteralValue;
}

export interface IdentifierNode extends Node {
  type: 'Identifier';
  name: string;
}

export interface BinaryExpressionNode extends Node {
  type: 'BinaryExpression';
  operator: BinaryOperator;
  left: ExpressionNode;
  right: ExpressionNode;
}

export interface UnaryExpressionNode extends Node {
  type: 'UnaryExpression';
  operator: UnaryOperator;
  right: ExpressionNode;
}

export interface GroupingNode extends Node {
  type: 'Grouping';
  expression: ExpressionNode;
}

export type ExpressionNode =
  | LiteralNode
  | IdentifierNode
  | BinaryExpressionNode
  | UnaryExpressionNode
  | GroupingNode
  | FunctionCallNode;

export interface SwitchNode extends Node {
  type: 'Switch';
  expression: ExpressionNode;
  cases: SwitchCaseNode[];
}

export interface DoWhileNode extends Node {
  type: 'DoWhile';
  body: StatementNode[];
  condition: ExpressionNode;
}

export type SwitchCaseCondition =
  | { type: 'Default' }
  | { type: 'ExactMatch'; value: ExpressionNode }
  | { type: 'Comparison'; operator: 'Mayor' | 'Menor' | 'MayorIgual' | 'MenorIgual'; value: ExpressionNode };

export interface SwitchCaseNode extends Node {
  type: 'SwitchCase';
  condition: SwitchCaseCondition;
  body: StatementNode[];
}

export type StatementNode =
  | VariableDeclarationNode
  | AssignmentNode
  | WriteNode
  | ReadNode
  | IfNode
  | WhileNode
  | ForNode
  | FunctionDeclarationNode
  | ProcedureDeclarationNode
  | SwitchNode
  | DoWhileNode;