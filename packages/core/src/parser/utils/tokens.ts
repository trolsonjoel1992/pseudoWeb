import { ParserError } from '../../errors'
import type { Token } from '../../lexer/lexer'
import { TokenType } from '../../lexer/tokenTypes'
import type { ParserContext } from '../state'
import { ERR_LOCATION_EOF, ERR_LOCATION_TOKEN } from '../constants'

export function peek(state: ParserContext): Token {
  return state.peek()
}

export function previous(state: ParserContext): Token {
  return state.previous()
}

export function isAtEnd(state: ParserContext): boolean {
  return state.isAtEnd()
}

export function advance(state: ParserContext): Token {
  return state.advance()
}

export function check(state: ParserContext, type: TokenType): boolean {
  return state.check(type)
}

export function checkAny(state: ParserContext, types: TokenType[]): boolean {
  return state.checkAny(types)
}

export function checkNext(state: ParserContext, ...types: TokenType[]): boolean {
  return state.checkNext(...types)
}

export function parseCommaSeparatedList<T>(
  state: ParserContext,
  elementParser: (state: ParserContext) => T,
  allowParens = false,
  open: TokenType = TokenType.ParentesisIzquierdo,
  close: TokenType = TokenType.ParentesisDerecho,
): T[] {
  return state.parseCommaSeparatedList(
    () => elementParser(state),
    allowParens,
    open,
    close,
  )
}

export function match(state: ParserContext, type: TokenType): boolean {
  return state.match(type)
}

export function consume(state: ParserContext, type: TokenType, message: string): Token {
  return state.consume(type, message)
}

export function consumeAny(state: ParserContext, types: TokenType[], message: string): Token {
  for (const type of types) {
    if (state.check(type)) {
      return state.advance()
    }
  }

  throw parserError(state, state.peek(), message)
}

export function skipSeparators(state: ParserContext): void {
  state.skipSeparators()
}

export function parserError(_state: ParserContext, token: Token, message: string): ParserError {
  const location = token.type === TokenType.EOF ? ERR_LOCATION_EOF : ERR_LOCATION_TOKEN(token.lexeme)
  return new ParserError(`${message} ${location}`, token.line, token.column)
}