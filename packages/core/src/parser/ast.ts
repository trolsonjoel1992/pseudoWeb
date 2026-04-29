export namespace Ast {
  export type DataType = 'Entero' | 'Real' | 'Caracter' | 'Alfanumerico'
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

  export interface ProgramNode extends Node {
    type: 'Program';
    statements: StatementNode[];
  }

  export interface VariableDeclarationNode extends Node {
    type: 'VariableDeclaration';
    variables: string[]; // Lista de nombres de variables
    dataType: DataType;
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
    | GroupingNode;

  export type StatementNode =
    | VariableDeclarationNode
    | AssignmentNode
    | WriteNode
    | ReadNode
    | IfNode
    | WhileNode
    | ForNode;
}