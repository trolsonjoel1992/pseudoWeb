import type { ReadNode, WriteNode } from '../../parser/ast'
import { stringifyValue } from '../utils/valueUtils'
import type { IOEvaluatorContext } from '../types/evaluatorContextContracts'

export async function evaluateWriteNode(node: WriteNode, context: IOEvaluatorContext): Promise<void> {
  const rendered: string[] = []
  for (const expression of node.values) {
    rendered.push(stringifyValue(await context.evaluateExpression(expression)))
  }
  context.pushOutput(rendered.join(' '))
}

export async function evaluateReadNode(node: ReadNode, context: IOEvaluatorContext): Promise<void> {
  for (const variable of node.variables) {
    context.typeChecker.assertVariableExists(variable, context.environment)

    const nextValue = await context.requestInput(variable)
    const expectedType = context.lookupVariableType(variable)
    context.assignVariable(variable, context.typeChecker.coerceInputValue(variable, nextValue, expectedType))
  }
}
