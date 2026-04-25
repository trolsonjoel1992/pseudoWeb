import type { Ast } from '../parser/ast';
import { RuntimeError } from '../errors';
import { Environment } from './environment';

export interface EvaluationResult {
    output: string[];
    variables: Record<string, unknown>;
}

export class Evaluator {
    private environment: Environment;
    private readonly output: string[] = [];
    private readonly inputValues: unknown[];

    constructor(environment: Environment, inputValues: unknown[] = []) {
        this.environment = environment;
        this.inputValues = [...inputValues];
    }

    public evaluate(statements: Ast.StatementNode[]): EvaluationResult {
        for (const statement of statements) {
            this.evaluateStatement(statement);
        }

        return {
            output: [...this.output],
            variables: this.environment.snapshot(),
        };
    }

    private evaluateStatement(node: Ast.StatementNode): void {
        switch (node.type) {
            case "VariableDeclaration":
                this.evaluateVariableDeclaration(node);
                return;
            case "Assignment":
                this.evaluateAssignment(node);
                return;
            case 'Write':
                this.evaluateWrite(node);
                return;
            case 'Read':
                this.evaluateRead(node);
                return;
            case 'If':
                this.evaluateIf(node);
                return;
            case 'While':
                this.evaluateWhile(node);
                return;
            case 'For':
                this.evaluateFor(node);
                return;
            case 'ExpressionStatement':
                this.evaluateExpression(node.expression);
                return;
            default:
                throw new RuntimeError(`Nodo de sentencia desconocido: ${(node as { type: string }).type}`);
        }
    }

    private evaluateVariableDeclaration(node: Ast.VariableDeclarationNode): void {
        for (const variable of node.variables) {
            this.environment.define(variable, null);
        }
    }

    private evaluateAssignment(node: Ast.AssignmentNode): void {
        const value = this.evaluateExpression(node.value);
        if (this.environment.has(node.variable)) {
            this.environment.assign(node.variable, value);
            return;
        }

        this.environment.define(node.variable, value);
    }

    private evaluateWrite(node: Ast.WriteNode): void {
        const rendered = node.values.map((expression) => this.stringify(this.evaluateExpression(expression)));
        this.output.push(rendered.join(' '));
    }

    private evaluateRead(node: Ast.ReadNode): void {
        for (const variable of node.variables) {
            const nextValue = this.inputValues.length > 0 ? this.inputValues.shift() ?? null : null;

            if (this.environment.has(variable)) {
                this.environment.assign(variable, nextValue);
            } else {
                this.environment.define(variable, nextValue);
            }
        }
    }

    private evaluateIf(node: Ast.IfNode): void {
        if (this.isTruthy(this.evaluateExpression(node.condition))) {
            this.evaluateBlock(node.thenBranch);
            return;
        }

        this.evaluateBlock(node.elseBranch);
    }

    private evaluateWhile(node: Ast.WhileNode): void {
        let guard = 0;
        while (this.isTruthy(this.evaluateExpression(node.condition))) {
            this.evaluateBlock(node.body);
            guard += 1;

            if (guard > 10000) {
                throw new RuntimeError('Bucle Mientras excedió el límite de seguridad.');
            }
        }
    }

    private evaluateFor(node: Ast.ForNode): void {
        const start = this.toNumber(this.evaluateExpression(node.start));
        const end = this.toNumber(this.evaluateExpression(node.end));
        const step = node.step ? this.toNumber(this.evaluateExpression(node.step)) : start <= end ? 1 : -1;

        if (step === 0) {
            throw new RuntimeError('El paso del Para no puede ser cero.');
        }

        if (step > 0) {
            for (let value = start; value <= end; value += step) {
                this.bindLoopVariable(node.variable, value);
                this.evaluateBlock(node.body);
            }
            return;
        }

        for (let value = start; value >= end; value += step) {
            this.bindLoopVariable(node.variable, value);
            this.evaluateBlock(node.body);
        }
    }

    private bindLoopVariable(name: string, value: number): void {
        if (this.environment.has(name)) {
            this.environment.assign(name, value);
            return;
        }

        this.environment.define(name, value);
    }

    private evaluateBlock(statements: Ast.StatementNode[]): void {
        for (const statement of statements) {
            this.evaluateStatement(statement);
        }
    }

    private evaluateExpression(node: Ast.ExpressionNode): any {
        switch (node.type) {
            case 'Literal':
                return node.value;
            case 'Identifier':
                return this.environment.lookup(node.name);
            case 'Grouping':
                return this.evaluateExpression(node.expression);
            case 'UnaryExpression':
                return this.evaluateUnary(node);
            case 'BinaryExpression':
                return this.evaluateBinary(node);
            default:
                throw new RuntimeError(`Expresión desconocida: ${(node as { type: string }).type}`);
        }
    }

    private evaluateUnary(node: Ast.UnaryExpressionNode): any {
        const right = this.evaluateExpression(node.right);

        switch (node.operator) {
            case 'Resta':
                return -this.toNumber(right);
            case 'No':
                return !this.isTruthy(right);
            default:
                throw new RuntimeError(`Operador unario no soportado: ${node.operator}`);
        }
    }

    private evaluateBinary(node: Ast.BinaryExpressionNode): any {
        const left = this.evaluateExpression(node.left);
        const right = this.evaluateExpression(node.right);

        switch (node.operator) {
            case 'Suma':
                return typeof left === 'string' || typeof right === 'string' ? `${left}${right}` : this.toNumber(left) + this.toNumber(right);
            case 'Resta':
                return this.toNumber(left) - this.toNumber(right);
            case 'Multiplicacion':
                return this.toNumber(left) * this.toNumber(right);
            case 'Division':
                if (this.toNumber(right) === 0) {
                    throw new RuntimeError('División por cero.');
                }
                return this.toNumber(left) / this.toNumber(right);
            case 'Div':
                if (this.toNumber(right) === 0) {
                    throw new RuntimeError('División entera por cero.');
                }
                return Math.trunc(this.toNumber(left) / this.toNumber(right));
            case 'Mod':
                if (this.toNumber(right) === 0) {
                    throw new RuntimeError('Módulo por cero.');
                }
                return this.toNumber(left) % this.toNumber(right);
            case 'Potencia':
                return this.toNumber(left) ** this.toNumber(right);
            case 'Igual':
                return left === right;
            case 'Distinto':
                return left !== right;
            case 'Menor':
                return this.toComparable(left) < this.toComparable(right);
            case 'MenorIgual':
                return this.toComparable(left) <= this.toComparable(right);
            case 'Mayor':
                return this.toComparable(left) > this.toComparable(right);
            case 'MayorIgual':
                return this.toComparable(left) >= this.toComparable(right);
            case 'Y':
                return this.isTruthy(left) && this.isTruthy(right);
            case 'O':
                return this.isTruthy(left) || this.isTruthy(right);
            default:
                throw new RuntimeError(`Operador binario no soportado: ${node.operator}`);
        }
    }

    private stringify(value: unknown): string {
        if (value === null || value === undefined) {
            return '';
        }

        return String(value);
    }

    private isTruthy(value: unknown): boolean {
        return Boolean(value);
    }

    private toNumber(value: unknown): number {
        const numericValue = typeof value === 'number' ? value : Number(value);

        if (Number.isNaN(numericValue)) {
            throw new RuntimeError(`No se puede convertir a número: ${String(value)}`);
        }

        return numericValue;
    }

    private toComparable(value: unknown): string | number {
        return typeof value === 'number' ? value : String(value);
    }
}