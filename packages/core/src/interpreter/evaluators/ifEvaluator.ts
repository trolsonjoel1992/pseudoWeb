import type { IfNode } from '../../parser/ast'
import { assertDefinedValue, isTruthy } from '../utils/valueUtils'
import type { ControlFlowEvaluatorContext } from '../types/evaluatorContextContracts'

export async function evaluateIfNode(node: IfNode, context: ControlFlowEvaluatorContext): Promise<void> {
  const condition = await context.evaluateExpression(node.condition)
  assertDefinedValue(condition, 'la condición de Si')

  if (isTruthy(condition)) {
    await context.evaluateBlock(node.thenBranch)
    return
  }

  await context.evaluateBlock(node.elseBranch)
}
