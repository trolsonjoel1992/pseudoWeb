import type { Token } from '../../lexer/types'
import { TokenType } from '../../lexer/types'
import { ParserError } from '../../errors'
import type { ParserContext } from './parserContext'
import { ERR_EXPECTED_CLOSE_PAREN_IN_LIST, ERR_LOCATION_EOF, ERR_LOCATION_TOKEN } from '../constants'

export class ParserStateImpl implements ParserContext {
  public readonly tokens: Token[]
  public current: number
  public inProcess?: boolean

  constructor(tokens: Token[]) {
    this.tokens = tokens
    this.current = 0
  }

  peek(): Token {
    return this.tokens[this.current]
  }

  peekAhead(offset: number): Token {
    const index = this.current + offset
    if (index >= this.tokens.length) {
      return this.tokens[this.tokens.length - 1] // Return EOF
    }
    return this.tokens[index]
  }

  advance(): Token {
    if (!this.isAtEnd()) {
      this.current += 1
    }
    return this.previous()
  }

  previous(): Token {
    return this.tokens[this.current - 1]
  }

  check(type: TokenType): boolean {
    if (this.isAtEnd()) {
      return false
    }
    return this.peek().type === type
  }

  checkAny(types: TokenType[]): boolean {
    return types.some((type) => this.check(type))
  }

  checkNext(...types: TokenType[]): boolean {
    const nextIndex = this.current + 1
    if (nextIndex < 0 || nextIndex >= this.tokens.length) return false
    const next = this.tokens[nextIndex]
    return types.includes(next.type)
  }

  match(type: TokenType): boolean {
    if (!this.check(type)) {
      return false
    }
    this.advance()
    return true
  }

  consume(type: TokenType, message: string): Token {
    if (this.check(type)) {
      return this.advance()
    }
    throw this.parserError(message)
  }

  isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF
  }

  skipSeparators(): void {
    while (this.match(TokenType.SaltoDeLinea) || this.match(TokenType.PuntoYComa)) {
      // Skip separators
    }
  }

  parseCommaSeparatedList<T>(
    parser: () => T,
    allowParens = false,
    open: TokenType = TokenType.ParentesisIzquierdo,
    close: TokenType = TokenType.ParentesisDerecho,
  ): T[] {
    const items: T[] = []

    if (allowParens && this.match(open)) {
      if (!this.check(close)) {
        do {
          items.push(parser())
        } while (this.match(TokenType.Coma))
      }
      this.consume(close, ERR_EXPECTED_CLOSE_PAREN_IN_LIST)
      return items
    }

    // No parens: at least one element expected
    items.push(parser())
    while (this.match(TokenType.Coma)) items.push(parser())
    return items
  }

  parserError(message: string): ParserError {
    const token = this.peek()
    const location = token.type === TokenType.EOF ? ERR_LOCATION_EOF : ERR_LOCATION_TOKEN(token.lexeme)
    return new ParserError(`${message} ${location}`, token.line, token.column)
  }
}
