import type {
    ActionNode,
    AssignmentNode,
    ExpressionNode,
    ForNode,
    IfNode,
    ReadNode,
    StatementNode,
    VariableDeclarationNode,
    WhileNode,
    WriteNode,
    SwitchNode,
    DoWhileNode,
} from '../parser/ast';
import { RuntimeError } from '../errors';
import { Environment } from './environment';
import { evaluateExpressionNode } from './evaluators/expressionEvaluator';
import { evaluateIfNode, evaluateWhileNode, evaluateForNode } from './evaluators/controlFlowEvaluator';
import { evaluateWriteNode, evaluateReadNode } from './evaluators/ioEvaluator';

export interface EvaluationResult {
    output: string[];
    variables: Record<string, unknown>;
}

export type InputRequestHandler = (name: string) => Promise<unknown>;

export type OutputHandler = (line: string) => void;

export class Evaluator {
    private environment: Environment;
    private readonly output: string[] = [];
    private readonly requestInput: InputRequestHandler;
    private readonly pushOutput: OutputHandler;

    constructor(environment: Environment, requestInput: InputRequestHandler = async () => null, pushOutput?: OutputHandler) {
        this.environment = environment;
        this.requestInput = requestInput;
        this.pushOutput = pushOutput ?? ((line) => this.output.push(line));
    }

    public async evaluate(action: ActionNode): Promise<EvaluationResult> {        // Procesar declaraciones del bloque Ambiente
        // Primero: Variables
        for (const variableDecl of action.ambiente.variables) {
            for (const variable of variableDecl.variables) {
                this.environment.define(variable, null, variableDecl.dataType);
            }
        }
        // Luego: Constantes (almacenadas con valor)
        for (const constantDecl of action.ambiente.constants) {
            this.environment.define(constantDecl.name, constantDecl.value, constantDecl.dataType);
        }
        // Funciones y Procedimientos se registrarían aquí (por ahora omitimos)
                // Evaluar las sentencias del bloque Proceso
        for (const statement of action.proceso) {
            await this.evaluateStatement(statement);
        }

        return {
            output: [...this.output],
            variables: this.environment.snapshot(),
        };
    }

    private async evaluateStatement(node: StatementNode): Promise<void> {
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
                await this.evaluateRead(node);
                return;
            case 'If':
                await this.evaluateIf(node);
                return;
            case 'While':
                await this.evaluateWhile(node);
                return;
            case 'For':
                await this.evaluateFor(node);
                return;
            case 'Switch':
                await this.evaluateSwitch(node as SwitchNode);
                return;
            case 'DoWhile':
                await this.evaluateDoWhile(node as DoWhileNode);
                return;
            default:
                throw new RuntimeError(`Nodo de sentencia desconocido: ${(node as { type: string }).type}`);
        }
    }

    private evaluateVariableDeclaration(node: VariableDeclarationNode): void {
        for (const variable of node.variables) {
            this.environment.define(variable, null, node.dataType);
        }
    }

    private evaluateAssignment(node: AssignmentNode): void {
        const value = this.evaluateExpression(node.value);
        if (this.environment.has(node.variable)) {
            this.environment.assign(node.variable, value);
            return;
        }

        this.environment.define(node.variable, value);
    }

    private evaluateWrite(node: WriteNode): void {
        evaluateWriteNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            requestInput: this.requestInput,
            hasVariable: this.environment.has.bind(this.environment),
            lookupVariableType: this.environment.lookupType.bind(this.environment),
            assignVariable: this.environment.assign.bind(this.environment),
            defineVariable: this.environment.define.bind(this.environment),
            pushOutput: this.pushOutput,
        });
    }

    private async evaluateRead(node: ReadNode): Promise<void> {
        await evaluateReadNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            requestInput: this.requestInput,
            hasVariable: this.environment.has.bind(this.environment),
            lookupVariableType: this.environment.lookupType.bind(this.environment),
            assignVariable: this.environment.assign.bind(this.environment),
            defineVariable: this.environment.define.bind(this.environment),
            pushOutput: this.pushOutput,
        });
    }

    private async evaluateIf(node: IfNode): Promise<void> {
        await evaluateIfNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            evaluateBlock: this.evaluateBlock.bind(this),
            hasVariable: this.environment.has.bind(this.environment),
            lookupVariableType: this.environment.lookupType.bind(this.environment),
            assignVariable: this.environment.assign.bind(this.environment),
            defineVariable: this.environment.define.bind(this.environment),
        });
    }

    private async evaluateWhile(node: WhileNode): Promise<void> {
        await evaluateWhileNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            evaluateBlock: this.evaluateBlock.bind(this),
            hasVariable: this.environment.has.bind(this.environment),
            lookupVariableType: this.environment.lookupType.bind(this.environment),
            assignVariable: this.environment.assign.bind(this.environment),
            defineVariable: this.environment.define.bind(this.environment),
        });
    }

    private async evaluateFor(node: ForNode): Promise<void> {
        await evaluateForNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            evaluateBlock: this.evaluateBlock.bind(this),
            hasVariable: this.environment.has.bind(this.environment),
            lookupVariableType: this.environment.lookupType.bind(this.environment),
            assignVariable: this.environment.assign.bind(this.environment),
            defineVariable: this.environment.define.bind(this.environment),
        });
    }

    private async evaluateBlock(statements: StatementNode[]): Promise<void> {
        for (const statement of statements) {
            await this.evaluateStatement(statement);
        }
    }

    private evaluateExpression(node: ExpressionNode): any {
        return evaluateExpressionNode(node, {
            evaluateExpression: this.evaluateExpression.bind(this),
            lookup: this.environment.lookup.bind(this.environment),
        });
    }

    private async evaluateSwitch(node: SwitchNode): Promise<void> {
        const expressionValue = this.evaluateExpression(node.expression);

        for (const switchCase of node.cases) {
            let matches = false;

            switch (switchCase.condition.type) {
                case 'Default':
                    matches = true;
                    break;
                case 'ExactMatch': {
                    const caseValue = this.evaluateExpression(switchCase.condition.value);
                    matches = expressionValue === caseValue;
                    break;
                }
                case 'Comparison': {
                    const caseValue = this.evaluateExpression(switchCase.condition.value);
                    switch (switchCase.condition.operator) {
                        case 'Mayor':
                            matches = expressionValue > caseValue;
                            break;
                        case 'Menor':
                            matches = expressionValue < caseValue;
                            break;
                        case 'MayorIgual':
                            matches = expressionValue >= caseValue;
                            break;
                        case 'MenorIgual':
                            matches = expressionValue <= caseValue;
                            break;
                    }
                    break;
                }
            }

            if (matches) {
                await this.evaluateBlock(switchCase.body);
                break;
            }
        }
    }

    private async evaluateDoWhile(node: DoWhileNode): Promise<void> {
        const maxIterations = 1000000;
        let iterations = 0;

        do {
            iterations++;
            if (iterations > maxIterations) {
                throw new RuntimeError('Bucle Repetir excedió el límite de seguridad.');
            }

            await this.evaluateBlock(node.body);
            const condition = this.evaluateExpression(node.condition);
            if (condition) break;
        } while (true);
    }
}