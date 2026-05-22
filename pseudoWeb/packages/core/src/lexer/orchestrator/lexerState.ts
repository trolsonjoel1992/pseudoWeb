import { TokenType } from '../types/tokenType.js'
import { Token } from '../types/token.js'
import { LexerContext } from './lexerContext.js'

export class LexerStateImpl implements LexerContext {
  private source: string
  private tokens: Token[] = []
  private start = 0
  private current = 0
  private _line = 1
  private _column = 1

  constructor(source: string) {
    this.source = source
  }

  public get line(): number {
    return this._line
  }

  public get column(): number {
    return this._column
  }

  public markStart(): void {
    this.start = this.current
  }

  public addToken(
    type: TokenType,
    lexeme: string,
    literal: string | number | boolean | null = null,
    line?: number,
    column?: number,
  ): void {
    const resolvedLine = line ?? this._line
    const resolvedColumn = column ?? this._column

    this.tokens.push({
      type,
      lexeme,
      literal,
      line: resolvedLine,
      column: resolvedColumn,
    })
  }

  public getTokens(): Token[] {
    return this.tokens
  }

  public advance(): string {
    const char = this.source[this.current]
    this.current++

    if (char === '\n') {
      this._line++
      this._column = 1
    } else {
      this._column++
    }

    return char
  }

  public peek(): string {
    return this.source[this.current] ?? '\0'
  }

  public peekNext(): string {
    return this.source[this.current + 1] ?? '\0'
  }

  public isAtEnd(): boolean {
    return this.current >= this.source.length
  }

  public sliceLexeme(start = this.start): string {
    return this.source.slice(start, this.current)
  }
}
