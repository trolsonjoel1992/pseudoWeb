import type { LexerContext } from '../orchestrator/lexerContext.js'
import { TokenType } from '../types/index.js'

type Literal = string | number | boolean | null

type NumberScannerContext = LexerContext & {
  addToken: (type: TokenType, lexeme: string, literal: Literal, line: number, column: number) => void
}

export function scanNumberToken(context: NumberScannerContext, isDigit: (char: string) => boolean): void {
  const column = context.column

  while (!context.isAtEnd() && isDigit(context.peek())) {
    context.advance()
  }

  let tokenType = TokenType.Entero

  if (context.peek() === '.' && isDigit(context.peekNext())) {
    tokenType = TokenType.Real
    context.advance()

    while (!context.isAtEnd() && isDigit(context.peek())) {
      context.advance()
    }
  }

  const lexeme = context.sliceLexeme()
  const literal = tokenType === TokenType.Real ? Number(lexeme) : Number.parseInt(lexeme, 10)

  context.addToken(tokenType, lexeme, literal, context.line, column)
}
