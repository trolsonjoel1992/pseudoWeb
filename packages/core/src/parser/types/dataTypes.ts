import { TokenType } from '../../lexer/tokenTypes'
import type { Token } from '../../lexer/lexer'
import type { ParserContext } from '../state'
import type { DataType } from './data'
import { parserError } from '../utils/tokens'
import { ERR_EXPECTED_OPEN_PAREN_AN_TYPE, ERR_EXPECTED_INTEGER_LENGTH_AN_TYPE, ERR_INVALID_AN_LENGTH, ERR_EXPECTED_CLOSE_PAREN_AN_TYPE, ERR_EXPECTED_DATA_TYPE } from '../constants'

export type { DataType } from './data'

export function parseDataType(state: ParserContext): DataType {
  if (state.checkAny([TokenType.Entero, TokenType.Real, TokenType.Alfanumerico, TokenType.Caracter, TokenType.Logico])) {
    const token = advanceDataTypeToken(state)
    return toDataType(token)
  }

  if (state.check(TokenType.Identificador) && state.peek().lexeme.toLowerCase() === 'an') {
    state.advance()
    state.consume(TokenType.ParentesisIzquierdo, ERR_EXPECTED_OPEN_PAREN_AN_TYPE)
    const lengthToken = state.consume(TokenType.Entero, ERR_EXPECTED_INTEGER_LENGTH_AN_TYPE)
    const maxLength = Number(lengthToken.literal)
    if (!Number.isInteger(maxLength) || maxLength <= 0) {
      throw parserError(state, lengthToken, ERR_INVALID_AN_LENGTH)
    }
    state.consume(TokenType.ParentesisDerecho, ERR_EXPECTED_CLOSE_PAREN_AN_TYPE)
    return { kind: 'AN', maxLength }
  }

  throw parserError(state, state.peek(), ERR_EXPECTED_DATA_TYPE)
}

export function toDataType(token: Token): DataType {
  switch (token.type) {
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
      throw parserError({} as ParserContext, token, ERR_EXPECTED_DATA_TYPE)
  }
}

function advanceDataTypeToken(state: ParserContext) {
  const dataTypeTokens = [TokenType.Entero, TokenType.Real, TokenType.Alfanumerico, TokenType.Caracter, TokenType.Logico, TokenType.Identificador]
  for (const type of dataTypeTokens) {
    if (state.check(type)) {
      return state.advance()
    }
  }

  throw parserError(state, state.peek(), ERR_EXPECTED_DATA_TYPE)
}