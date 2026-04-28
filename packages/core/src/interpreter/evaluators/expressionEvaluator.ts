import type { Ast } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { isTruthy, toComparable, toNumber } from '../utils/valueUtils'

type ExpressionEvaluatorContext = {
  evaluateExpression: (node: Ast.ExpressionNode) => unknown
  lookup: (name: string) => unknown
}

export function evaluateExpressionNode(node: Ast.ExpressionNode, context: ExpressionEvaluatorContext): unknown {
  switch (node.type) {
    case 'Literal':
      return node.value
    case 'Identifier':
      return context.lookup(node.name)
    case 'Grouping':
      return context.evaluateExpression(node.expression)
    case 'UnaryExpression':
      return evaluateUnaryExpression(node, context)
    case 'BinaryExpression':
      return evaluateBinaryExpression(node, context)
    default:
      throw new RuntimeError(`Expresión desconocida: ${(node as { type: string }).type}`)
  }
}

function evaluateUnaryExpression(node: Ast.UnaryExpressionNode, context: ExpressionEvaluatorContext): unknown {
  const right = context.evaluateExpression(node.right)

  switch (node.operator) {
    case 'Resta':
      return -toNumber(right)
    case 'No':
      return !isTruthy(right)
    default:
      throw new RuntimeError(`Operador unario no soportado: ${node.operator}`)
  }
}

function evaluateBinaryExpression(node: Ast.BinaryExpressionNode, context: ExpressionEvaluatorContext): unknown {
  const left = context.evaluateExpression(node.left)
  const right = context.evaluateExpression(node.right)

  switch (node.operator) {
    case 'Suma':
      return typeof left === 'string' || typeof right === 'string' ? `${left}${right}` : toNumber(left) + toNumber(right)
    case 'Resta':
      return toNumber(left) - toNumber(right)
    case 'Multiplicacion':
      return toNumber(left) * toNumber(right)
    case 'Division':
      if (toNumber(right) === 0) {
        throw new RuntimeError('División por cero.')
      }
      return toNumber(left) / toNumber(right)
    case 'Div':
      if (toNumber(right) === 0) {
        throw new RuntimeError('División entera por cero.')
      }
      return Math.trunc(toNumber(left) / toNumber(right))
    case 'Mod':
      if (toNumber(right) === 0) {
        throw new RuntimeError('Módulo por cero.')
      }
      return toNumber(left) % toNumber(right)
    case 'Potencia':
      return toNumber(left) ** toNumber(right)
    case 'Igual':
      return left === right
    case 'Distinto':
      return left !== right
    case 'Menor':
      return toComparable(left) < toComparable(right)
    case 'MenorIgual':
      return toComparable(left) <= toComparable(right)
    case 'Mayor':
      return toComparable(left) > toComparable(right)
    case 'MayorIgual':
      return toComparable(left) >= toComparable(right)
    case 'Y':
      return isTruthy(left) && isTruthy(right)
    case 'O':
      return isTruthy(left) || isTruthy(right)
    default:
      throw new RuntimeError(`Operador binario no soportado: ${node.operator}`)
  }
}
