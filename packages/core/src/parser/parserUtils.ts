import { ParserError } from '../errors'
import { Lexer } from '../lexer/lexer'
import { TokenType } from '../lexer/tokenTypes'
import { ParserState } from './parserState'

export function peek(state: ParserState): Lexer.Token {
  return state.tokens[state.current]
}

export function previous(state: ParserState): Lexer.Token {
  return state.tokens[state.current - 1]
}

export function isAtEnd(state: ParserState): boolean {
  return peek(state).type === TokenType.EOF
}

export function advance(state: ParserState): Lexer.Token {
  if (!isAtEnd(state)) {
    state.current += 1
  }

  return previous(state)
}

export function check(state: ParserState, type: TokenType): boolean {
  if (isAtEnd(state)) {
    return false
  }

  return peek(state).type === type
}

export function checkAny(state: ParserState, types: TokenType[]): boolean {
  return types.some((type) => check(state, type))
}

export function checkNext(state: ParserState, ...types: TokenType[]): boolean {
  const next = state.tokens[state.current + 1]
  return Boolean(next) && types.includes(next.type)
}

export function match(state: ParserState, type: TokenType): boolean {
  if (!check(state, type)) {
    return false
  }

  advance(state)
  return true
}

export function consume(state: ParserState, type: TokenType, message: string): Lexer.Token {
  if (check(state, type)) {
    return advance(state)
  }

  throw parserError(state, peek(state), message)
}

export function consumeAny(state: ParserState, types: TokenType[], message: string): Lexer.Token {
  for (const type of types) {
    if (check(state, type)) {
      return advance(state)
    }
  }

  throw parserError(state, peek(state), message)
}

export function skipSeparators(state: ParserState): void {
  while (match(state, TokenType.SaltoDeLinea) || match(state, TokenType.PuntoYComa)) {
    // Skip separators.
  }
}

export function parserError(_state: ParserState, token: Lexer.Token, message: string): ParserError {
  const location = token.type === TokenType.EOF ? 'al final del archivo' : `en '${token.lexeme}'`
  return new ParserError(`${message} ${location}`, token.line, token.column)
}
