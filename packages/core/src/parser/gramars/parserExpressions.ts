import type { BinaryExpressionNode, BinaryOperator, ExpressionNode, UnaryOperator } from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import { ParserState } from '../gramars/parserState'
import { consume, match, parserError, peek, previous } from '../utils/parserUtils'

export function parseExpression(state: ParserState): ExpressionNode {
  return parseOr(state)
}

function toBinaryOperator(type: TokenType): BinaryOperator {
  switch (type) {
    case TokenType.Suma:
    case TokenType.Resta:
    case TokenType.Multiplicacion:
    case TokenType.Division:
    case TokenType.Div:
    case TokenType.Mod:
    case TokenType.Potencia:
    case TokenType.Igual:
    case TokenType.Distinto:
    case TokenType.Menor:
    case TokenType.Mayor:
    case TokenType.MenorIgual:
    case TokenType.MayorIgual:
    case TokenType.Y:
    case TokenType.O:
      return type
    default:
      throw new Error(`Operador binario no soportado: ${type}`)
  }
}

function toUnaryOperator(type: TokenType): UnaryOperator {
  switch (type) {
    case TokenType.Resta:
    case TokenType.No:
      return type
    default:
      throw new Error(`Operador unario no soportado: ${type}`)
  }
}

function parseOr(state: ParserState): ExpressionNode {
  let expr = parseAnd(state)
  while (match(state, TokenType.O)) {
    const operator = previous(state)
    expr = binary(expr, operator, parseAnd(state))
  }
  return expr
}

function parseAnd(state: ParserState): ExpressionNode {
  let expr = parseEquality(state)
  while (match(state, TokenType.Y)) {
    const operator = previous(state)
    expr = binary(expr, operator, parseEquality(state))
  }
  return expr
}

function parseEquality(state: ParserState): ExpressionNode {
  let expr = parseComparison(state)
  while (match(state, TokenType.Igual) || match(state, TokenType.Distinto)) {
    const operator = previous(state)
    expr = binary(expr, operator, parseComparison(state))
  }
  return expr
}

function parseComparison(state: ParserState): ExpressionNode {
  let expr = parseTerm(state)
  while (match(state, TokenType.Menor) || match(state, TokenType.MenorIgual) || match(state, TokenType.Mayor) || match(state, TokenType.MayorIgual)) {
    const operator = previous(state)
    expr = binary(expr, operator, parseTerm(state))
  }
  return expr
}

function parseTerm(state: ParserState): ExpressionNode {
  let expr = parseFactor(state)
  while (match(state, TokenType.Suma) || match(state, TokenType.Resta)) {
    const operator = previous(state)
    expr = binary(expr, operator, parseFactor(state))
  }
  return expr
}

function parseFactor(state: ParserState): ExpressionNode {
  let expr = parsePower(state)
  while (match(state, TokenType.Multiplicacion) || match(state, TokenType.Division) || match(state, TokenType.Div) || match(state, TokenType.Mod)) {
    const operator = previous(state)
    expr = binary(expr, operator, parsePower(state))
  }
  return expr
}

function parsePower(state: ParserState): ExpressionNode {
  const expr = parseUnary(state)
  if (!match(state, TokenType.Potencia)) {
    return expr
  }

  const operator = previous(state)
  return binary(expr, operator, parsePower(state))
}

function parseUnary(state: ParserState): ExpressionNode {
  if (match(state, TokenType.Resta) || match(state, TokenType.No)) {
    const operator = previous(state)
    return { type: 'UnaryExpression', operator: toUnaryOperator(operator.type), right: parseUnary(state), line: operator.line, column: operator.column }
  }

  return parsePrimary(state)
}

function parsePrimary(state: ParserState): ExpressionNode {
  const token = peek(state)

  if (match(state, TokenType.Entero) || match(state, TokenType.Real) || match(state, TokenType.Alfanumerico) || match(state, TokenType.Caracter) || match(state, TokenType.Verdadero) || match(state, TokenType.Falso)) {
    const literal = previous(state)
    return { type: 'Literal', value: literal.literal, line: literal.line, column: literal.column }
  }

  if (match(state, TokenType.Identificador)) {
    const identifier = previous(state)

    if (match(state, TokenType.ParentesisIzquierdo)) {
      const args: ExpressionNode[] = []
      if (!match(state, TokenType.ParentesisDerecho)) {
        do {
          args.push(parseExpression(state))
        } while (match(state, TokenType.Coma))
        consume(state, TokenType.ParentesisDerecho, "Se esperaba ')' después de los argumentos")
      }

      return {
        type: 'FunctionCall',
        name: identifier.lexeme,
        arguments: args,
        line: identifier.line,
        column: identifier.column,
      }
    }

    return { type: 'Identifier', name: identifier.lexeme, line: identifier.line, column: identifier.column }
  }

  if (match(state, TokenType.ParentesisIzquierdo)) {
    const expression = parseExpression(state)
    consume(state, TokenType.ParentesisDerecho, "Se esperaba ')' después de la expresión")
    return { type: 'Grouping', expression, line: token.line, column: token.column }
  }

  throw parserError(state, token, 'Se esperaba una expresión')
}

function binary(left: ExpressionNode, operator: { type: TokenType; line: number; column: number }, right: ExpressionNode): BinaryExpressionNode {
  return { type: 'BinaryExpression', operator: toBinaryOperator(operator.type), left, right, line: operator.line, column: operator.column }
}
