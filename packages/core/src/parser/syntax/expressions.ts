import type { BinaryExpressionNode, BinaryOperator, ExpressionNode, UnaryOperator } from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import type { Token } from '../../lexer/lexer'
import type { ParserContext } from '../state'
import { ERR_EXPECTED_CLOSE_PAREN_AFTER_ARGS, ERR_EXPECTED_CLOSE_PAREN_AFTER_EXPR, ERR_EXPECTED_EXPRESSION, ERR_UNSUPPORTED_BINARY_OPERATOR, ERR_UNSUPPORTED_UNARY_OPERATOR } from '../constants'
import { parserError } from '../utils/tokens'

export function parseExpression(state: ParserContext): ExpressionNode {
  return parseOr(state)
}

function toBinaryOperator(type: TokenType, operatorToken: Token, state: ParserContext): BinaryOperator {
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
      throw parserError(state, operatorToken, `${ERR_UNSUPPORTED_BINARY_OPERATOR}: ${type}`)
  }
}

function toUnaryOperator(type: TokenType, operatorToken: Token, state: ParserContext): UnaryOperator {
  switch (type) {
    case TokenType.Resta:
    case TokenType.No:
      return type
    default:
      throw parserError(state, operatorToken, `${ERR_UNSUPPORTED_UNARY_OPERATOR}: ${type}`)
  }
}

function parseOr(state: ParserContext): ExpressionNode {
  let expr = parseAnd(state)
  while (state.match(TokenType.O)) {
    const operator = state.previous()
    expr = binary(state, expr, operator, parseAnd(state))
  }
  return expr
}

function parseAnd(state: ParserContext): ExpressionNode {
  let expr = parseEquality(state)
  while (state.match(TokenType.Y)) {
    const operator = state.previous()
    expr = binary(state, expr, operator, parseEquality(state))
  }
  return expr
}

function parseEquality(state: ParserContext): ExpressionNode {
  let expr = parseComparison(state)
  while (state.match(TokenType.Igual) || state.match(TokenType.Distinto)) {
    const operator = state.previous()
    expr = binary(state, expr, operator, parseComparison(state))
  }
  return expr
}

function parseComparison(state: ParserContext): ExpressionNode {
  let expr = parseTerm(state)
  while (state.match(TokenType.Menor) || state.match(TokenType.MenorIgual) || state.match(TokenType.Mayor) || state.match(TokenType.MayorIgual)) {
    const operator = state.previous()
    expr = binary(state, expr, operator, parseTerm(state))
  }
  return expr
}

function parseTerm(state: ParserContext): ExpressionNode {
  let expr = parseFactor(state)
  while (state.match(TokenType.Suma) || state.match(TokenType.Resta)) {
    const operator = state.previous()
    expr = binary(state, expr, operator, parseFactor(state))
  }
  return expr
}

function parseFactor(state: ParserContext): ExpressionNode {
  let expr = parsePower(state)
  while (state.match(TokenType.Multiplicacion) || state.match(TokenType.Division) || state.match(TokenType.Div) || state.match(TokenType.Mod)) {
    const operator = state.previous()
    expr = binary(state, expr, operator, parsePower(state))
  }
  return expr
}

function parsePower(state: ParserContext): ExpressionNode {
  const expr = parseUnary(state)
  if (!state.match(TokenType.Potencia)) {
    return expr
  }

  const operator = state.previous()
  return binary(state, expr, operator, parsePower(state))
}

function parseUnary(state: ParserContext): ExpressionNode {
  if (state.match(TokenType.Resta) || state.match(TokenType.No)) {
    const operator = state.previous()
    return { type: 'UnaryExpression', operator: toUnaryOperator(operator.type, operator, state), right: parseUnary(state), line: operator.line, column: operator.column }
  }

  return parsePrimary(state)
}

function parsePrimary(state: ParserContext): ExpressionNode {
  const token = state.peek()

  if (state.match(TokenType.Entero) || state.match(TokenType.Real) || state.match(TokenType.Alfanumerico) || state.match(TokenType.Caracter) || state.match(TokenType.Verdadero) || state.match(TokenType.Falso)) {
    const literal = state.previous()
    return { type: 'Literal', value: literal.literal, line: literal.line, column: literal.column }
  }

  if (state.match(TokenType.Identificador)) {
    const identifier = state.previous()

    if (state.match(TokenType.ParentesisIzquierdo)) {
      const args: ExpressionNode[] = []
      if (!state.match(TokenType.ParentesisDerecho)) {
        do {
          args.push(parseExpression(state))
        } while (state.match(TokenType.Coma))
        state.consume(TokenType.ParentesisDerecho, ERR_EXPECTED_CLOSE_PAREN_AFTER_ARGS)
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

  if (state.match(TokenType.ParentesisIzquierdo)) {
    const expression = parseExpression(state)
    state.consume(TokenType.ParentesisDerecho, ERR_EXPECTED_CLOSE_PAREN_AFTER_EXPR)
    return { type: 'Grouping', expression, line: token.line, column: token.column }
  }

  throw state.parserError(ERR_EXPECTED_EXPRESSION)
}

function binary(state: ParserContext, left: ExpressionNode, operator: Token, right: ExpressionNode): BinaryExpressionNode {
  return { type: 'BinaryExpression', operator: toBinaryOperator(operator.type, operator, state), left, right, line: operator.line, column: operator.column }
}
