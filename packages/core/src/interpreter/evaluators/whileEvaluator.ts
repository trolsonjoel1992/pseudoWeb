import type { WhileNode } from '../../parser/ast'
import { assertDefinedValue, isTruthy } from '../utils/valueUtils'
import { createLoopGuard } from './loopGuard'
import type { ControlFlowEvaluatorContext } from '../types/evaluatorContextContracts'

export async function evaluateWhileNode(node: WhileNode, context: ControlFlowEvaluatorContext): Promise<void> {
  const guard = createLoopGuard()

  while (true) {
    const condition = await context.evaluateExpression(node.condition)
    assertDefinedValue(condition, 'la condición de Mientras')

    if (!isTruthy(condition)) {
      return
    }

    guard.checkIteration('while')
    await context.evaluateBlock(node.body)
  }
}
