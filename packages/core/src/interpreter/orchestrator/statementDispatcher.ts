import type {
  AssignmentNode,
  CallStatementNode,
  DoWhileNode,
  ForNode,
  IfNode,
  ReadNode,
  StatementNode,
  SwitchNode,
  VariableDeclarationNode,
  WhileNode,
  WriteNode,
} from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors.js'
import { buildMessage } from '../../constants/errorMessages.js'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import type { EvaluatorContext } from '../types/evaluatorContext'
import { evaluateDoWhileNode } from '../evaluators/doWhileEvaluator'
import { evaluateForNode } from '../evaluators/forEvaluator'
import { evaluateIfNode } from '../evaluators/ifEvaluator'
import { evaluateReadNode, evaluateWriteNode } from '../evaluators/ioEvaluator'
import { evaluateSwitchNode } from '../evaluators/switchEvaluator'
import { evaluateWhileNode } from '../evaluators/whileEvaluator'
import { StatementHandlerRegistry } from './statementHandlerRegistry'

export type DirectStatementHandler = (node: VariableDeclarationNode | AssignmentNode | CallStatementNode) => Promise<void>

/**
 * Statement Dispatcher
 * 
 * Routes statements to their specialized evaluators using a registry.
 * This improves open/closed principle - new statement types can be added
 * without modifying the dispatcher itself.
 */
export class StatementDispatcher {
  private readonly handlerRegistry: StatementHandlerRegistry

  constructor(
    private readonly context: EvaluatorContext,
    private readonly handleDirectStatement: DirectStatementHandler,
  ) {
    this.handlerRegistry = new StatementHandlerRegistry()
    this.registerAllHandlers()
  }

  /**
   * Register all built-in statement handlers
   * These represent the core statement types of the pseudocode language
   */
  private registerAllHandlers(): void {
    // IO statements
    this.handlerRegistry.register('Write', (node) =>
      evaluateWriteNode(node as WriteNode, this.context),
    )
    this.handlerRegistry.register('Read', (node) =>
      evaluateReadNode(node as ReadNode, this.context),
    )

    // Control flow statements
    this.handlerRegistry.register('If', (node) =>
      evaluateIfNode(node as IfNode, this.context),
    )
    this.handlerRegistry.register('While', (node) =>
      evaluateWhileNode(node as WhileNode, this.context),
    )
    this.handlerRegistry.register('For', (node) =>
      evaluateForNode(node as ForNode, this.context),
    )
    this.handlerRegistry.register('Switch', (node) =>
      evaluateSwitchNode(node as SwitchNode, this.context),
    )
    this.handlerRegistry.register('DoWhile', (node) =>
      evaluateDoWhileNode(node as DoWhileNode, this.context),
    )
  }

  public async dispatch(node: StatementNode): Promise<void> {
    // Handle direct statements (variable, assignment, call)
    // These are kept separate because they need direct environment access
    switch (node.type) {
      case 'VariableDeclaration':
      case 'Assignment':
      case 'CallStatement':
        await this.handleDirectStatement(node as VariableDeclarationNode | AssignmentNode | CallStatementNode)
        return
    }

    // Try to find handler in registry
    if (this.handlerRegistry.supports(node.type)) {
      await this.handlerRegistry.dispatch(node, this.context)
      return
    }

    // Unknown statement type
    throw new RuntimeError({
      code: ErrorCode.GEN_UNKNOWN,
      message: ERROR_MESSAGES.UNKNOWN_STATEMENT_NODE((node as { type: string }).type),
      module: 'interpreter',
      context: { nodeType: (node as { type: string }).type },
    })
  }

  public async dispatchBlock(statements: StatementNode[]): Promise<void> {
    for (const statement of statements) {
      await this.dispatch(statement)
    }
  }
}
