import type { DoWhileNode } from '../../parser/ast'
import { assertDefinedValue, isTruthy } from '../utils/valueUtils'
import { createLoopGuard } from './loopGuard'
import type { EvaluatorContext } from '../types/evaluatorContext'

export type DoWhileEvaluatorCallbacks = Pick<EvaluatorContext, 'evaluateExpression' | 'evaluateBlock'>

export async function evaluateDoWhileNode(node: DoWhileNode, callbacks: DoWhileEvaluatorCallbacks): Promise<void> {
  const guard = createLoopGuard()

  do {
    guard.checkIteration('do-while')
    await callbacks.evaluateBlock(node.body)
    const condition = await callbacks.evaluateExpression(node.condition)
    assertDefinedValue(condition, 'la condición de Repetir')
    if (isTruthy(condition)) break
  } while (true)
}
