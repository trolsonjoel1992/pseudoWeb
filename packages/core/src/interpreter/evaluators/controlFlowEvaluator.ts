import type { Ast } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { isTruthy, toNumber } from '../utils/valueUtils'

type ControlFlowEvaluatorContext = {
  evaluateExpression: (node: Ast.ExpressionNode) => unknown
  evaluateBlock: (statements: Ast.StatementNode[]) => void
  hasVariable: (name: string) => boolean
  assignVariable: (name: string, value: unknown) => void
  defineVariable: (name: string, value: unknown) => void
}

export function evaluateIfNode(node: Ast.IfNode, context: ControlFlowEvaluatorContext): void {
  if (isTruthy(context.evaluateExpression(node.condition))) {
    context.evaluateBlock(node.thenBranch)
    return
  }

  context.evaluateBlock(node.elseBranch)
}

export function evaluateWhileNode(node: Ast.WhileNode, context: ControlFlowEvaluatorContext): void {
  let guard = 0

  while (isTruthy(context.evaluateExpression(node.condition))) {
    context.evaluateBlock(node.body)
    guard += 1

    if (guard > 10000) {
      throw new RuntimeError('Bucle Mientras excedió el límite de seguridad.')
    }
  }
}

export function evaluateForNode(node: Ast.ForNode, context: ControlFlowEvaluatorContext): void {
  const start = toNumber(context.evaluateExpression(node.start))
  const end = toNumber(context.evaluateExpression(node.end))
  const step = node.step ? toNumber(context.evaluateExpression(node.step)) : start <= end ? 1 : -1

  if (step === 0) {
    throw new RuntimeError('El paso del Para no puede ser cero.')
  }

  if (step > 0) {
    for (let value = start; value <= end; value += step) {
      bindLoopVariable(node.variable, value, context)
      context.evaluateBlock(node.body)
    }
    return
  }

  for (let value = start; value >= end; value += step) {
    bindLoopVariable(node.variable, value, context)
    context.evaluateBlock(node.body)
  }
}

function bindLoopVariable(name: string, value: number, context: ControlFlowEvaluatorContext): void {
  if (context.hasVariable(name)) {
    context.assignVariable(name, value)
    return
  }

  context.defineVariable(name, value)
}
