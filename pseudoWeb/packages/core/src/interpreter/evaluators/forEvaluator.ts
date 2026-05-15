import type { ForNode } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors.js'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import { createLoopGuard } from './loopGuard'
import type { ControlFlowEvaluatorContext } from '../types/evaluatorContextContracts'

export async function evaluateForNode(node: ForNode, context: ControlFlowEvaluatorContext): Promise<void> {
  const start = context.typeChecker.assertNumberType(await context.evaluateExpression(node.start), 'inicio de Para')
  const end = context.typeChecker.assertNumberType(await context.evaluateExpression(node.end), 'fin de Para')
  const step = node.step
    ? context.typeChecker.assertNumberType(await context.evaluateExpression(node.step), 'paso de Para')
    : start <= end
      ? 1
      : -1
  const guard = createLoopGuard()

  if (step === 0) {
    throw new RuntimeError({
      code: ErrorCode.RUN_INVALID_ARGUMENT,
      message: ERROR_MESSAGES.FOR_STEP_ZERO,
      module: 'interpreter',
    })
  }

  if (step > 0) {
    for (let value = start; value <= end; value += step) {
      guard.checkIteration('for')
      bindLoopVariable(node.variable, value, context)
      await context.evaluateBlock(node.body)
    }
    return
  }

  for (let value = start; value >= end; value += step) {
    guard.checkIteration('for')
    bindLoopVariable(node.variable, value, context)
    await context.evaluateBlock(node.body)
  }
}

function bindLoopVariable(name: string, value: number, context: ControlFlowEvaluatorContext): void {
  if (context.hasVariable(name)) {
    context.assignVariable(name, value)
    return
  }

  context.defineVariable(name, value)
}
