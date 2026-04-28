import { TokenType } from '../tokenTypes'
import { resolveIdentifierType } from '../tokenRules'

type Literal = string | number | boolean | null

type IdentifierScannerContext = {
  line: number
  column: number
  isAtEnd: () => boolean
  peek: () => string
  advance: () => string
  isAlphaNumeric: (char: string) => boolean
  sliceLexeme: () => string
  addToken: (type: TokenType, lexeme: string, literal: Literal, line: number, column: number) => void
}

export function scanIdentifierToken(context: IdentifierScannerContext): void {
  while (!context.isAtEnd() && context.isAlphaNumeric(context.peek())) {
    context.advance()
  }

  const lexeme = context.sliceLexeme()
  const tokenType = resolveIdentifierType(lexeme)
  const literal = tokenType === TokenType.Verdadero ? true : tokenType === TokenType.Falso ? false : null

  context.addToken(tokenType, lexeme, literal, context.line, context.column)
}
