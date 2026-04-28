import { Ast } from './ast'
import { TokenType } from '../lexer/tokenTypes'
import { ParserState } from './parserState'
import { consume, match, parserError, peek, previous } from './parserUtils'

export function parseExpression(state: ParserState): Ast.ExpressionNode {
  return parseOr(state)
}

function parseOr(state: ParserState): Ast.ExpressionNode {
  let expr = parseAnd(state)
  while (match(state, TokenType.O)) {
    const operator = previous(state)
    expr = binary(expr, operator, parseAnd(state))
  }
  return expr
}

function parseAnd(state: ParserState): Ast.ExpressionNode {
  let expr = parseEquality(state)
  while (match(state, TokenType.Y)) {
    const operator = previous(state)
    expr = binary(expr, operator, parseEquality(state))
  }
  return expr
}

function parseEquality(state: ParserState): Ast.ExpressionNode {
  let expr = parseComparison(state)
  while (match(state, TokenType.Igual) || match(state, TokenType.Distinto)) {
    const operator = previous(state)
    expr = binary(expr, operator, parseComparison(state))
  }
  return expr
}

function parseComparison(state: ParserState): Ast.ExpressionNode {
  let expr = parseTerm(state)
  while (match(state, TokenType.Menor) || match(state, TokenType.MenorIgual) || match(state, TokenType.Mayor) || match(state, TokenType.MayorIgual)) {
    const operator = previous(state)
    expr = binary(expr, operator, parseTerm(state))
  }
  return expr
}

function parseTerm(state: ParserState): Ast.ExpressionNode {
  let expr = parseFactor(state)
  while (match(state, TokenType.Suma) || match(state, TokenType.Resta)) {
    const operator = previous(state)
    expr = binary(expr, operator, parseFactor(state))
  }
  return expr
}

function parseFactor(state: ParserState): Ast.ExpressionNode {
  let expr = parsePower(state)
  while (match(state, TokenType.Multiplicacion) || match(state, TokenType.Division) || match(state, TokenType.Div) || match(state, TokenType.Mod)) {
    const operator = previous(state)
    expr = binary(expr, operator, parsePower(state))
  }
  return expr
}

function parsePower(state: ParserState): Ast.ExpressionNode {
  const expr = parseUnary(state)
  if (!match(state, TokenType.Potencia)) {
    return expr
  }

  const operator = previous(state)
  return binary(expr, operator, parsePower(state))
}

function parseUnary(state: ParserState): Ast.ExpressionNode {
  if (match(state, TokenType.Resta) || match(state, TokenType.No)) {
    const operator = previous(state)
    return { type: 'UnaryExpression', operator: operator.type, right: parseUnary(state), line: operator.line, column: operator.column }
  }

  return parsePrimary(state)
}

function parsePrimary(state: ParserState): Ast.ExpressionNode {
  const token = peek(state)

  if (match(state, TokenType.Entero) || match(state, TokenType.Real) || match(state, TokenType.Alfanumerico) || match(state, TokenType.Caracter) || match(state, TokenType.Verdadero) || match(state, TokenType.Falso)) {
    const literal = previous(state)
    return { type: 'Literal', value: literal.literal, line: literal.line, column: literal.column }
  }

  if (match(state, TokenType.Identificador)) {
    const identifier = previous(state)
    return { type: 'Identifier', name: identifier.lexeme, line: identifier.line, column: identifier.column }
  }

  if (match(state, TokenType.ParentesisIzquierdo)) {
    const expression = parseExpression(state)
    consume(state, TokenType.ParentesisDerecho, "Se esperaba ')' después de la expresión")
    return { type: 'Grouping', expression, line: token.line, column: token.column }
  }

  throw parserError(state, token, 'Se esperaba una expresión')
}

function binary(left: Ast.ExpressionNode, operator: { type: string; line: number; column: number }, right: Ast.ExpressionNode): Ast.BinaryExpressionNode {
  return { type: 'BinaryExpression', operator: operator.type, left, right, line: operator.line, column: operator.column }
}
