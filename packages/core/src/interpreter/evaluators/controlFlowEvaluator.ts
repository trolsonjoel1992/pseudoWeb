import type { ForNode, IfNode, WhileNode } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { assertDefinedValue, isTruthy } from '../utils/valueUtils'
import { createLoopGuard } from './loopGuard'
import type { EvaluatorContext } from '../types/evaluatorContext'

type ControlFlowEvaluatorContext = Pick<
  EvaluatorContext,
  'evaluateExpression' | 'evaluateBlock' | 'hasVariable' | 'assignVariable' | 'defineVariable' | 'typeChecker'
>

export async function evaluateIfNode(node: IfNode, context: ControlFlowEvaluatorContext): Promise<void> {
  const condition = await context.evaluateExpression(node.condition)
  assertDefinedValue(condition, 'la condición de Si')

  if (isTruthy(condition)) {
    await context.evaluateBlock(node.thenBranch)
    return
  }

  await context.evaluateBlock(node.elseBranch)
}

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
    throw new RuntimeError('El paso del Para no puede ser cero.')
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
