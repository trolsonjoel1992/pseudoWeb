import { TokenType } from './tokenTypes'
import { scanIdentifierToken } from './scanners/identifierScanner'
import { scanNumberToken } from './scanners/numberScanner'
import { scanStringToken } from './scanners/stringScanner'
import { skipBlockComment, skipLineComment } from './scanners/commentScanner'
import { scanOperatorToken } from './scanners/operatorScanner'
import { isAlpha, isAlphaNumeric, isDigit } from './utils/charUtils'

export interface Token {
  type: TokenType;
  lexeme: string;
  literal: string | number | boolean | null;
  line: number;
  column: number;
}

export class Lexer {
  private source: string
  private tokens: Token[] = []
  private start = 0
  private current = 0
  private line = 1
  private column = 1

  constructor(source: string) {
    this.source = source
  }

  public tokenize(): Token[] {
    while (!this.isAtEnd()) {
      this.start = this.current
      this.scanToken()
    }

    this.tokens.push({
      type: TokenType.EOF,
      lexeme: '',
      literal: null,
      line: this.line,
      column: this.column,
    })

    return this.tokens
  }

  private scanToken(): void {
    const char = this.peek()

    if (char === ' ' || char === '\r' || char === '\t') {
      this.advance()
      return
    }

    if (char === '\n') {
      const line = this.line
      const column = this.column
      this.advance()
      this.addToken(TokenType.SaltoDeLinea, '\n', null, line, column)
      return
    }

    if (char === '/' && this.peekNext() === '*') {
      skipBlockComment({
        line: this.line,
        column: this.column,
        isAtEnd: this.isAtEnd.bind(this),
        peek: this.peek.bind(this),
        peekNext: this.peekNext.bind(this),
        advance: this.advance.bind(this),
      })
      return
    }

    if (char === '/' && this.peekNext() === '/') {
      skipLineComment({
        line: this.line,
        column: this.column,
        isAtEnd: this.isAtEnd.bind(this),
        peek: this.peek.bind(this),
        peekNext: this.peekNext.bind(this),
        advance: this.advance.bind(this),
      })
      return
    }

    if (char === '"' || char === "'") {
      scanStringToken({
        quote: char,
        line: this.line,
        column: this.column,
        isAtEnd: this.isAtEnd.bind(this),
        peek: this.peek.bind(this),
        advance: this.advance.bind(this),
        sliceLexeme: () => this.source.slice(this.start, this.current),
        addToken: this.addToken.bind(this),
      })
      return
    }

    if (isDigit(char)) {
      scanNumberToken({
        line: this.line,
        column: this.column,
        isAtEnd: this.isAtEnd.bind(this),
        peek: this.peek.bind(this),
        peekNext: this.peekNext.bind(this),
        advance: this.advance.bind(this),
        isDigit,
        sliceLexeme: () => this.source.slice(this.start, this.current),
        addToken: this.addToken.bind(this),
      })
      return
    }

    if (isAlpha(char)) {
      scanIdentifierToken({
        line: this.line,
        column: this.column,
        isAtEnd: this.isAtEnd.bind(this),
        peek: this.peek.bind(this),
        advance: this.advance.bind(this),
        isAlphaNumeric,
        sliceLexeme: () => this.source.slice(this.start, this.current),
        addToken: this.addToken.bind(this),
      })
      return
    }

    scanOperatorToken({
      char,
      line: this.line,
      column: this.column,
      peekNext: this.peekNext.bind(this),
      advance: this.advance.bind(this),
      addToken: this.addToken.bind(this),
    })
  }

  private addToken(
    type: TokenType,
    lexeme: string,
    literal: string | number | boolean | null = null,
    line?: number,
    column?: number,
  ): void {
    const resolvedLine = line ?? this.line
    const resolvedColumn = column ?? this.column

    this.tokens.push({
      type,
      lexeme,
      literal,
      line: resolvedLine,
      column: resolvedColumn,
    })
  }

  private advance(): string {
    const char = this.source[this.current]
    this.current++

    if (char === '\n') {
      this.line++
      this.column = 1
    } else {
      this.column++
    }

    return char
  }

  private peek(): string {
    return this.source[this.current] ?? '\0'
  }

  private peekNext(): string {
    return this.source[this.current + 1] ?? '\0'
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length
  }
}