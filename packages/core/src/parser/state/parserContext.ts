import type { Token } from '../../lexer/types'
import type { TokenType } from '../../lexer/types'
import type { ParserError } from '../../errors'

export interface ParserContext {
  /**
   * Returns the current token without advancing
   */
  peek(): Token

  /**
   * Returns a token at offset positions ahead (1 = next, 2 = next next, etc)
   */
  peekAhead(offset: number): Token

  /**
   * Advances to the next token and returns the previous one
   */
  advance(): Token

  /**
   * Returns the previously consumed token
   */
  previous(): Token

  /**
   * Checks if the current token is of the expected type, throws if not
   */
  consume(type: TokenType, message: string): Token

  /**
   * Checks if the current token matches one of the given types
   */
  checkAny(types: TokenType[]): boolean

  /**
   * Checks if the current token is of a specific type (without advancing)
   */
  check(type: TokenType): boolean

  /**
   * Checks if the next token (current + 1) matches any of the given types
   */
  checkNext(...types: TokenType[]): boolean

  /**
   * Attempts to match the current token type, advancing if successful
   */
  match(type: TokenType): boolean

  /**
   * Returns true if we are at the end of the token stream
   */
  isAtEnd(): boolean

  /**
   * Skips over line breaks and semicolons
   */
  skipSeparators(): void

  /**
   * Parses a comma-separated list of elements
   */
  parseCommaSeparatedList<T>(
    parser: () => T,
    allowParens?: boolean,
    open?: TokenType,
    close?: TokenType
  ): T[]

  /**
   * Creates a parser error with proper formatting
   */
  parserError(message: string): ParserError

  /**
   * Internal flag to track if we are inside a Proceso block
   */
  inProcess?: boolean
}
