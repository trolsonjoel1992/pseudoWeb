import type { ReadNode, WriteNode } from '../../parser/ast'
import { stringifyValue } from '../utils/valueUtils'
import type { IOEvaluatorContext } from '../types/evaluatorContextContracts'
import { isSequence, asSequence } from '../types/SequenceValue'

export async function evaluateWriteNode(node: WriteNode, context: IOEvaluatorContext): Promise<void> {
  if (node.values.length === 0) return

  // Detect sequence write overload: if first evaluated value is a SequenceValue,
  // treat as sequence write: Escribir(secuencia, valor)
  const firstVal = await context.evaluateExpression(node.values[0])
  if (isSequence(firstVal)) {
    if (node.values.length < 2) {
      throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Escribir sobre Secuencia requiere un valor a escribir', module: 'interpreter' })
    }
    const seq = asSequence(firstVal)
    if (seq.mode === 'closed') {
      throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia cerrada', module: 'interpreter' })
    }
    if (seq.mode !== 'write') {
      throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia no está en modo escritura', module: 'interpreter' })
    }
    const value = await context.evaluateExpression(node.values[1])
    context.typeChecker.assertValueMatchesType(value, seq.elementType, 'Escribir en Secuencia')
    seq.elements.push(value)
    return
  }

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
