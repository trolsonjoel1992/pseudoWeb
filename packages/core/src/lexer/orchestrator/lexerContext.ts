import { TokenType } from '../types/tokenType'
import { Token } from '../types/token'

export interface LexerContext {
  readonly line: number
  readonly column: number
  markStart(): void
  peek(): string
  peekNext(): string
  advance(): string
  isAtEnd(): boolean
  addToken(
    type: TokenType,
    lexeme: string,
    literal: Token['literal'],
    line?: number,
    column?: number,
  ): void
  sliceLexeme(start?: number): string
}
