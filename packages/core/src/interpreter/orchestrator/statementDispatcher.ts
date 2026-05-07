import type {
  AssignmentNode,
  CallStatementNode,
  DoWhileNode,
  IfNode,
  ReadNode,
  StatementNode,
  SwitchNode,
  VariableDeclarationNode,
  WhileNode,
  WriteNode,
} from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import type { EvaluatorContext } from '../types/evaluatorContext'
import { evaluateDoWhileNode } from '../evaluators/doWhileEvaluator'
import { evaluateForNode, evaluateIfNode, evaluateWhileNode } from '../evaluators/controlFlowEvaluator'
import { evaluateReadNode, evaluateWriteNode } from '../evaluators/ioEvaluator'
import { evaluateSwitchNode } from '../evaluators/switchEvaluator'

export type DirectStatementHandler = (node: VariableDeclarationNode | AssignmentNode | CallStatementNode) => Promise<void>

export class StatementDispatcher {
  constructor(
    private readonly context: EvaluatorContext,
    private readonly handleDirectStatement: DirectStatementHandler,
  ) {}

  public async dispatch(node: StatementNode): Promise<void> {
    switch (node.type) {
      case 'VariableDeclaration':
      case 'Assignment':
      case 'CallStatement':
        await this.handleDirectStatement(node as VariableDeclarationNode | AssignmentNode | CallStatementNode)
        return
      case 'Write':
        await evaluateWriteNode(node as WriteNode, this.context)
        return
      case 'Read':
        await evaluateReadNode(node as ReadNode, this.context)
        return
      case 'If':
        await evaluateIfNode(node as IfNode, this.context)
        return
      case 'While':
        await evaluateWhileNode(node as WhileNode, this.context)
        return
      case 'For':
        await evaluateForNode(node, this.context)
        return
      case 'Switch':
        await evaluateSwitchNode(node as SwitchNode, this.context)
        return
      case 'DoWhile':
        await evaluateDoWhileNode(node as DoWhileNode, this.context)
        return
      default:
        throw new RuntimeError(ERROR_MESSAGES.UNKNOWN_STATEMENT_NODE((node as { type: string }).type))
    }
  }

  public async dispatchBlock(statements: StatementNode[]): Promise<void> {
    for (const statement of statements) {
      await this.dispatch(statement)
    }
  }
}