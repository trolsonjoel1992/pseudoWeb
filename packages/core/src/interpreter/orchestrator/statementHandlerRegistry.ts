/**
 * Statement Handler Registry
 * 
 * Enables Open/Closed Principle for statement type handling.
 * New statement handlers can be registered without modifying dispatcher.
 * 
 * This is a Strategy pattern implementation that decouples handler registration
 * from statement dispatching logic.
 */

import type { StatementNode } from '../../parser/ast'
import type { EvaluatorContext } from '../types/evaluatorContext'
import { RuntimeError } from '../../errors'

/**
 * Handler function signature
 * Each handler receives a statement node and evaluator context
 */
export type StatementHandler = (node: StatementNode, context: EvaluatorContext) => Promise<void>

/**
 * Registry for statement type handlers
 * Maps statement types to their handler functions
 */
export class StatementHandlerRegistry {
  private readonly handlers = new Map<string, StatementHandler>()

  /**
   * Register a handler for a specific statement type
   * @param type The AST node type (e.g., "Write", "If", "While")
   * @param handler The handler function to invoke
   * @throws RuntimeError if handler already registered for type
   */
  public register(type: string, handler: StatementHandler): void {
    if (this.handlers.has(type)) {
      throw new RuntimeError(`Handler already registered for statement type: ${type}`)
    }
    this.handlers.set(type, handler)
  }

  /**
   * Dispatch a statement to its registered handler
   * @param node The statement node to dispatch
   * @param context The evaluator context
   * @throws RuntimeError if no handler found for statement type
   */
  public async dispatch(node: StatementNode, context: EvaluatorContext): Promise<void> {
    const handler = this.handlers.get(node.type)
    if (!handler) {
      throw new RuntimeError(`No handler registered for statement type: ${node.type}`)
    }
    await handler(node, context)
  }

  /**
   * Check if a statement type has a registered handler
   * @param type The statement type
   * @returns true if handler is registered
   */
  public supports(type: string): boolean {
    return this.handlers.has(type)
  }
}
