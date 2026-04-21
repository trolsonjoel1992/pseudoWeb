export namespace Ast {
  // Nodo base para el AST
  export interface Node {
    type: string;
  }

  // Nodo para declaraciones de variables
  export interface VariableDeclarationNode extends Node {
    type: "VariableDeclaration";
    variables: string[]; // Lista de nombres de variables
    dataType: string; // Tipo de dato (ej. Entero, Real)
  }

  // Nodo para asignaciones
  export interface AssignmentNode extends Node {
    type: "Assignment";
    variable: string;
    value: ExpressionNode;
  }

  // Nodo para expresiones
  export interface ExpressionNode extends Node {
    type: "Expression";
    value: any; // Puede ser un literal, operación, etc.
  }

  // Unión de nodos posibles
  export type StatementNode = VariableDeclarationNode | AssignmentNode;
}