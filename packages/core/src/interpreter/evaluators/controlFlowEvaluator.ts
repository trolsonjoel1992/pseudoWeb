import type { ExpressionNode, ForNode, IfNode, StatementNode, WhileNode } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { isTruthy, toNumber } from '../utils/valueUtils'

type ControlFlowEvaluatorContext = {
  evaluateExpression: (node: ExpressionNode) => unknown
  evaluateBlock: (statements: StatementNode[]) => Promise<void>
  hasVariable: (name: string) => boolean
  lookupVariableType: (name: string) => string | null
  assignVariable: (name: string, value: unknown) => void
  defineVariable: (name: string, value: unknown) => void
}

export async function evaluateIfNode(node: IfNode, context: ControlFlowEvaluatorContext): Promise<void> {
  if (isTruthy(context.evaluateExpression(node.condition))) {
    await context.evaluateBlock(node.thenBranch)
    return
  }

  await context.evaluateBlock(node.elseBranch)
}

export async function evaluateWhileNode(node: WhileNode, context: ControlFlowEvaluatorContext): Promise<void> {
  let guard = 0

  while (isTruthy(context.evaluateExpression(node.condition))) {
    await context.evaluateBlock(node.body)
    guard += 1

    if (guard > 10000) {
      throw new RuntimeError('Bucle Mientras excedió el límite de seguridad.')
    }
  }
}

export async function evaluateForNode(node: ForNode, context: ControlFlowEvaluatorContext): Promise<void> {
  const start = toNumber(context.evaluateExpression(node.start))
  const end = toNumber(context.evaluateExpression(node.end))
  const step = node.step ? toNumber(context.evaluateExpression(node.step)) : start <= end ? 1 : -1

  if (step === 0) {
    throw new RuntimeError('El paso del Para no puede ser cero.')
  }

  if (step > 0) {
    for (let value = start; value <= end; value += step) {
      bindLoopVariable(node.variable, value, context)
      await context.evaluateBlock(node.body)
    }
    return
  }

  for (let value = start; value >= end; value += step) {
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
