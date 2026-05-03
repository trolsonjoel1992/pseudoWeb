import type { ExpressionNode, ReadNode, WriteNode } from '../../parser/ast'
import { stringifyValue } from '../utils/valueUtils'
import { RuntimeError } from '../../errors'

type IoEvaluatorContext = {
  evaluateExpression: (node: ExpressionNode) => unknown
  requestInput: (name: string) => Promise<unknown>
  hasVariable: (name: string) => boolean
  lookupVariableType: (name: string) => string | null
  assignVariable: (name: string, value: unknown) => void
  defineVariable: (name: string, value: unknown) => void
  pushOutput: (line: string) => void
}

export function evaluateWriteNode(node: WriteNode, context: IoEvaluatorContext): void {
  const rendered = node.values.map((expression) => stringifyValue(context.evaluateExpression(expression)))
  context.pushOutput(rendered.join(' '))
}

export async function evaluateReadNode(node: ReadNode, context: IoEvaluatorContext): Promise<void> {
  for (const variable of node.variables) {
    // Validar que la variable fue declarada
    if (!context.hasVariable(variable)) {
      throw new RuntimeError(`Variable '${variable}' no está declarada en Ambiente`)
    }

    const nextValue = await context.requestInput(variable)
    const expectedType = context.lookupVariableType(variable)
    context.assignVariable(variable, coerceInputValue(variable, nextValue, expectedType))
  }
}

function coerceInputValue(name: string, value: unknown, expectedType: string | null): unknown {
  if (value === null || expectedType === null) {
    return value
  }

  switch (expectedType) {
    case 'Entero':
      if (typeof value === 'number' && Number.isInteger(value)) return value
      if (typeof value === 'string' && /^-?\d+$/.test(value.trim())) return Number.parseInt(value, 10)
      break
    case 'Real':
      if (typeof value === 'number' && Number.isFinite(value)) return value
      if (typeof value === 'string' && /^-?(?:\d+\.\d+|\d+|\.\d+)$/.test(value.trim())) return Number.parseFloat(value)
      break
    case 'Caracter':
      if (typeof value === 'string' && value.length === 1) return value
      break
    case 'Alfanumerico':
      if (typeof value === 'string') return value
      break
    case 'Logico':
      if (typeof value === 'boolean') return value
      if (typeof value === 'string') {
        const normalized = value.trim().toLowerCase()
        if (normalized === 'verdadero' || normalized === 'true') return true
        if (normalized === 'falso' || normalized === 'false') return false
      }
      break
  }

  throw new RuntimeError(`Valor incompatible para '${name}'. Se esperaba ${expectedType ?? 'un tipo válido'}.`)
}
