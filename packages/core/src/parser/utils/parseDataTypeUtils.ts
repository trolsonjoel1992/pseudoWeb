import type { DataType } from '../ast'
import type { ParserState } from '../gramars/parserState'
import { TokenType } from '../../lexer/tokenTypes'
import { checkAny, consumeAny, check, peek, consume, parserError } from './parserUtils'

export function parseDataType(state: ParserState): DataType {
  if (checkAny(state, [TokenType.Entero, TokenType.Real, TokenType.Alfanumerico, TokenType.Caracter, TokenType.Logico])) {
    const token = advanceDataTypeToken(state)
    return toDataType(token.type)
  }

  if (check(state, TokenType.Identificador) && peek(state).lexeme.toLowerCase() === 'an') {
    advanceDataTypeToken(state)
    consume(state, TokenType.ParentesisIzquierdo, "Se esperaba '(' en el tipo AN(n)")
    const lengthToken = consume(state, TokenType.Entero, 'Se esperaba una longitud entera positiva en AN(n)')
    const maxLength = Number(lengthToken.literal)
    if (!Number.isInteger(maxLength) || maxLength <= 0) {
      throw parserError(state, lengthToken, 'La longitud en AN(n) debe ser un entero positivo')
    }
    consume(state, TokenType.ParentesisDerecho, "Se esperaba ')' al cerrar AN(n)")
    return { kind: 'AN', maxLength }
  }

  throw parserError(state, peek(state), 'Se esperaba un tipo de dato')
}

export function toDataType(type: TokenType): DataType {
  switch (type) {
    case TokenType.Entero:
      return 'Entero'
    case TokenType.Real:
      return 'Real'
    case TokenType.Caracter:
      return 'Caracter'
    case TokenType.Logico:
      return 'Logico'
    case TokenType.Alfanumerico:
      return 'Alfanumerico'
    default:
      throw parserError({ tokens: [
        { type, lexeme: type, literal: null, line: 0, column: 0 },
      ], current: 0 }, { type, lexeme: type, literal: null, line: 0, column: 0 }, 'Se esperaba un tipo de dato')
  }
}

function advanceDataTypeToken(state: ParserState) {
  return consumeAny(state, [TokenType.Entero, TokenType.Real, TokenType.Alfanumerico, TokenType.Caracter, TokenType.Logico, TokenType.Identificador], 'Se esperaba un tipo de dato')
}
