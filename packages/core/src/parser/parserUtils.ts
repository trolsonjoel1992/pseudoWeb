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
  const nextIndex = state.current + 1
  if (nextIndex < 0 || nextIndex >= state.tokens.length) return false
  const next = state.tokens[nextIndex]
  return types.includes(next.type)
}

export function parseCommaSeparatedList<T>(
  state: ParserState,
  elementParser: (state: ParserState) => T,
  allowParens = false,
  open: TokenType = TokenType.ParentesisIzquierdo,
  close: TokenType = TokenType.ParentesisDerecho,
): T[] {
  const items: T[] = []

  if (allowParens && match(state, open)) {
    if (!check(state, close)) {
      do {
        items.push(elementParser(state))
      } while (match(state, TokenType.Coma))
    }
    consume(state, close, `Se esperaba ')' al cerrar la lista`)
    return items
  }

  // No parens: at least one element expected
  items.push(elementParser(state))
  while (match(state, TokenType.Coma)) items.push(elementParser(state))
  return items
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
