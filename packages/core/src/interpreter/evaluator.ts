import { Ast } from "../parser/ast";
import { Environment } from "./environment";
import { RuntimeError } from "../errors";

export class Evaluator {
    private environment: Environment;

    constructor(environment: Environment) {
        this.environment = environment;
    }

    public evaluate(statements: Ast.StatementNode[]): any {
        let lastResult: any = null;
        for (const statement of statements) {
            lastResult = this.evaluateStatement(statement);
        }
        return lastResult;
    }

    private evaluateStatement(node: Ast.StatementNode): any {
        switch (node.type) {
            case "VariableDeclaration":
                return this.evaluateVariableDeclaration(node);
            case "Assignment":
                return this.evaluateAssignment(node);
            default:
                throw new RuntimeError(`Nodo de declaración desconocido: ${node.type}`);
        }
    }

    private evaluateVariableDeclaration(node: Ast.VariableDeclarationNode): void {
        for (const variable of node.variables) {
            // Por ahora, inicializamos con null.
            // La especificación pregunta si debería ser un error o nulo.
            this.environment.define(variable, null);
        }
    }

    private evaluateAssignment(node: Ast.AssignmentNode): void {
        const value = this.evaluateExpression(node.value);
        this.environment.assign(node.variable, value);
    }

    private evaluateExpression(node: Ast.ExpressionNode): any {
        // La evaluación de expresiones se expandirá para manejar operaciones,
        // llamadas a funciones, etc.
        return node.value;
    }
}