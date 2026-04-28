import { TokenType } from '../tokenTypes'

type Literal = string | number | boolean | null

type NumberScannerContext = {
  line: number
  column: number
  isAtEnd: () => boolean
  peek: () => string
  peekNext: () => string
  advance: () => string
  isDigit: (char: string) => boolean
  sliceLexeme: () => string
  addToken: (type: TokenType, lexeme: string, literal: Literal, line: number, column: number) => void
}

export function scanNumberToken(context: NumberScannerContext): void {
  while (!context.isAtEnd() && context.isDigit(context.peek())) {
    context.advance()
  }

  let tokenType = TokenType.Entero

  if (context.peek() === '.' && context.isDigit(context.peekNext())) {
    tokenType = TokenType.Real
    context.advance()

    while (!context.isAtEnd() && context.isDigit(context.peek())) {
      context.advance()
    }
  }

  const lexeme = context.sliceLexeme()
  const literal = tokenType === TokenType.Real ? Number(lexeme) : Number.parseInt(lexeme, 10)

  context.addToken(tokenType, lexeme, literal, context.line, context.column)
}
