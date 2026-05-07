import type { BinaryExpressionNode, ExpressionNode, FunctionCallNode, UnaryExpressionNode } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { assertDefinedValue, isTruthy, toComparable } from '../utils/valueUtils'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import type { EvaluatorContext } from '../types/evaluatorContext'

type ExpressionEvaluatorContext = Pick<EvaluatorContext, 'evaluateExpression' | 'lookup' | 'invokeFunction' | 'typeChecker'>

export async function evaluateExpressionNode(node: ExpressionNode, context: ExpressionEvaluatorContext): Promise<unknown> {
  switch (node.type) {
    case 'Literal':
      return node.value
    case 'Identifier':
      return context.lookup(node.name)
    case 'Grouping':
      return await context.evaluateExpression(node.expression)
    case 'UnaryExpression':
      return await evaluateUnaryExpression(node, context)
    case 'BinaryExpression':
      return await evaluateBinaryExpression(node, context)
    case 'FunctionCall':
      return await evaluateFunctionCallExpression(node, context)
    default:
      throw new RuntimeError(ERROR_MESSAGES.UNKNOWN_EXPRESSION((node as { type: string }).type))
  }
}

async function evaluateUnaryExpression(node: UnaryExpressionNode, context: ExpressionEvaluatorContext): Promise<unknown> {
  const right = await context.evaluateExpression(node.right)
  assertDefinedValue(right, `la operación unaria ${node.operator}`)

  switch (node.operator) {
    case 'Resta':
      return -context.typeChecker.assertNumberType(right, 'operando derecho de Resta unaria')
    case 'No':
      return !isTruthy(right)
    default:
      throw new RuntimeError(ERROR_MESSAGES.UNKNOWN_UNARY_OPERATOR(node.operator))
  }
}

async function evaluateBinaryExpression(node: BinaryExpressionNode, context: ExpressionEvaluatorContext): Promise<unknown> {
  const left = await context.evaluateExpression(node.left)
  const right = await context.evaluateExpression(node.right)
  assertDefinedValue(left, `la operación ${node.operator}`)
  assertDefinedValue(right, `la operación ${node.operator}`)

  const leftNumber = (): number => context.typeChecker.assertNumberType(left, `operando izquierdo de ${node.operator}`)
  const rightNumber = (): number => context.typeChecker.assertNumberType(right, `operando derecho de ${node.operator}`)

  switch (node.operator) {
    case 'Suma':
      return leftNumber() + rightNumber()
    case 'Resta':
      return leftNumber() - rightNumber()
    case 'Multiplicacion':
      return leftNumber() * rightNumber()
    case 'Division':
      if (rightNumber() === 0) {
        throw new RuntimeError(ERROR_MESSAGES.DIVISION_BY_ZERO)
      }
      return leftNumber() / rightNumber()
    case 'Div':
      if (rightNumber() === 0) {
        throw new RuntimeError(ERROR_MESSAGES.INTEGER_DIVISION_BY_ZERO)
      }
      return Math.trunc(leftNumber() / rightNumber())
    case 'Mod':
      if (rightNumber() === 0) {
        throw new RuntimeError(ERROR_MESSAGES.MODULO_BY_ZERO)
      }
      return leftNumber() % rightNumber()
    case 'Potencia':
      return leftNumber() ** rightNumber()
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
      throw new RuntimeError(ERROR_MESSAGES.UNKNOWN_BINARY_OPERATOR(node.operator))
  }
}

async function evaluateFunctionCallExpression(node: FunctionCallNode, context: ExpressionEvaluatorContext): Promise<unknown> {
  const args: unknown[] = []
  for (const arg of node.arguments) {
    args.push(await context.evaluateExpression(arg))
  }

  return await context.invokeFunction(node.name, args)
}
