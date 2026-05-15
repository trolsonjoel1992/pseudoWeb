/**
 * EvaluatorContext Type Contracts
 * 
 * Define specific Pick<> types for each evaluator to clarify dependencies.
 * Each evaluator should request only what it needs, not the full EvaluatorContext.
 * 
 * This improves:
 * - IDE autocomplete (shows only available methods)
 * - Testing (create minimal mocks)
 * - Documentation (clear about dependencies)
 */

import type { EvaluatorContext } from './evaluatorContext'

/**
 * ExpressionEvaluator Contract
 * Used by: expressionEvaluator.ts
 * Needs: Expression evaluation, variable lookup, function invocation, type checking
 */
export type ExpressionEvaluatorContext = Pick<EvaluatorContext,
  | 'evaluateExpression'
  | 'lookup'
  | 'invokeFunction'
  | 'typeChecker'
>

/**
 * IOEvaluator Contract
 * Used by: ioEvaluator.ts
 * Needs: Expression evaluation, input handling, variable props, output
 */
export type IOEvaluatorContext = Pick<EvaluatorContext,
  | 'evaluateExpression'
  | 'requestInput'
  | 'lookupVariableType'
  | 'assignVariable'
  | 'pushOutput'
  | 'typeChecker'
  | 'environment'
>

/**
 * ControlFlowEvaluator Contract
 * Used by: controlFlowEvaluator.ts (If, While, For)
 * Needs: Expression evaluation, block execution, variable ops, type checking
 */
export type ControlFlowEvaluatorContext = Pick<EvaluatorContext,
  | 'evaluateExpression'
  | 'evaluateBlock'
  | 'defineVariable'
  | 'assignVariable'
  | 'hasVariable'
  | 'typeChecker'
>

/**
 * SwitchEvaluator Contract
 * Used by: switchEvaluator.ts
 * Needs: Expression evaluation, block execution, type checking
 */
export type SwitchEvaluatorContext = Pick<EvaluatorContext,
  | 'evaluateExpression'
  | 'evaluateBlock'
  | 'typeChecker'
>

/**
 * DoWhileEvaluator Contract
 * Used by: doWhileEvaluator.ts
 * Needs: Expression evaluation, block execution
 */
export type DoWhileEvaluatorContext = Pick<EvaluatorContext,
  | 'evaluateExpression'
  | 'evaluateBlock'
>
