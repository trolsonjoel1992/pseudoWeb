import { LexerStateImpl } from './lexerState.js'
import { TokenType } from '../types/index.js'
import type { Token } from '../types/index.js'
import { scanIdentifierToken } from '../scanners/identifierScanner.js'
import { scanNumberToken } from '../scanners/numberScanner.js'
import { scanStringToken } from '../scanners/stringScanner.js'
import { skipBlockComment, skipLineComment } from '../scanners/commentScanner.js'
import { scanOperatorToken } from '../scanners/operatorScanner.js'
import { isAlpha, isAlphaNumeric, isDigit } from '../utils/charUtils.js'

export class Lexer {
  private readonly state: LexerStateImpl

  constructor(source: string) {
    this.state = new LexerStateImpl(source)
  }

  public tokenize(): Token[] {
    while (!this.state.isAtEnd()) {
      this.state.markStart()
      this.scanToken()
    }

    this.state.addToken(TokenType.EOF, '', null, this.state.line, this.state.column)

    return this.state.getTokens()
  }

  private scanToken(): void {
    const char = this.state.peek()

    if (char === ' ' || char === '\r' || char === '\t') {
      this.state.advance()
      return
    }

    if (char === '\n') {
      const line = this.state.line
      const column = this.state.column
      this.state.advance()
      this.state.addToken(TokenType.SaltoDeLinea, '\n', null, line, column)
      return
    }

    if (char === '/' && this.state.peekNext() === '*') {
      skipBlockComment(this.state)
      return
    }

    if (char === '/' && this.state.peekNext() === '/') {
      skipLineComment(this.state)
      return
    }

    if (char === '"' || char === "'") {
      scanStringToken(this.state, char)
      return
    }

    if (isDigit(char)) {
      scanNumberToken(this.state, isDigit)
      return
    }

    if (isAlpha(char)) {
      scanIdentifierToken(this.state, isAlphaNumeric)
      return
    }

    scanOperatorToken(this.state, char)
  }
}
