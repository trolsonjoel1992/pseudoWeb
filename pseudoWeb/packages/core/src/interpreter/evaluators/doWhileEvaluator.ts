import type { DoWhileNode } from '../../parser/ast'
import { assertDefinedValue, isTruthy } from '../utils/valueUtils'
import { createLoopGuard } from './loopGuard'
import type { DoWhileEvaluatorContext } from '../types/evaluatorContextContracts'

export async function evaluateDoWhileNode(node: DoWhileNode, context: DoWhileEvaluatorContext): Promise<void> {
  const guard = createLoopGuard()

  do {
    guard.checkIteration('do-while')
    await context.evaluateBlock(node.body)
    const condition = await context.evaluateExpression(node.condition)
    assertDefinedValue(condition, 'la condición de Repetir')
    if (isTruthy(condition)) break
  } while (true)
}
