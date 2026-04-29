import type { Ast } from '../parser/ast';
import { RuntimeError } from '../errors';
import { Environment } from './environment';
import { evaluateExpressionNode } from './evaluators/expressionEvaluator';
import { evaluateIfNode, evaluateWhileNode, evaluateForNode } from './evaluators/controlFlowEvaluator';
import { evaluateWriteNode, evaluateReadNode } from './evaluators/ioEvaluator';

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
        evaluateWriteNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            inputValues: this.inputValues,
            hasVariable: this.environment.has.bind(this.environment),
            assignVariable: this.environment.assign.bind(this.environment),
            defineVariable: this.environment.define.bind(this.environment),
            pushOutput: (line) => this.output.push(line),
        });
    }

    private evaluateRead(node: Ast.ReadNode): void {
        evaluateReadNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            inputValues: this.inputValues,
            hasVariable: this.environment.has.bind(this.environment),
            assignVariable: this.environment.assign.bind(this.environment),
            defineVariable: this.environment.define.bind(this.environment),
            pushOutput: (line) => this.output.push(line),
        });
    }

    private evaluateIf(node: Ast.IfNode): void {
        evaluateIfNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            evaluateBlock: this.evaluateBlock.bind(this),
            hasVariable: this.environment.has.bind(this.environment),
            assignVariable: this.environment.assign.bind(this.environment),
            defineVariable: this.environment.define.bind(this.environment),
        });
    }

    private evaluateWhile(node: Ast.WhileNode): void {
        evaluateWhileNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            evaluateBlock: this.evaluateBlock.bind(this),
            hasVariable: this.environment.has.bind(this.environment),
            assignVariable: this.environment.assign.bind(this.environment),
            defineVariable: this.environment.define.bind(this.environment),
        });
    }

    private evaluateFor(node: Ast.ForNode): void {
        evaluateForNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            evaluateBlock: this.evaluateBlock.bind(this),
            hasVariable: this.environment.has.bind(this.environment),
            assignVariable: this.environment.assign.bind(this.environment),
            defineVariable: this.environment.define.bind(this.environment),
        });
    }

    private evaluateBlock(statements: Ast.StatementNode[]): void {
        for (const statement of statements) {
            this.evaluateStatement(statement);
        }
    }

    private evaluateExpression(node: Ast.ExpressionNode): any {
        return evaluateExpressionNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            lookup: this.environment.lookup.bind(this.environment),
        });
    }
}