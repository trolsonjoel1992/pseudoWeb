import type { Ast } from '../../parser/ast'
import { stringifyValue } from '../utils/valueUtils'

type IoEvaluatorContext = {
  evaluateExpression: (node: Ast.ExpressionNode) => unknown
  inputValues: unknown[]
  hasVariable: (name: string) => boolean
  assignVariable: (name: string, value: unknown) => void
  defineVariable: (name: string, value: unknown) => void
  pushOutput: (line: string) => void
}

export function evaluateWriteNode(node: Ast.WriteNode, context: IoEvaluatorContext): void {
  const rendered = node.values.map((expression) => stringifyValue(context.evaluateExpression(expression)))
  context.pushOutput(rendered.join(' '))
}

export function evaluateReadNode(node: Ast.ReadNode, context: IoEvaluatorContext): void {
  for (const variable of node.variables) {
    const nextValue = context.inputValues.length > 0 ? context.inputValues.shift() ?? null : null

    if (context.hasVariable(variable)) {
      context.assignVariable(variable, nextValue)
    } else {
      context.defineVariable(variable, nextValue)
    }
  }
}
