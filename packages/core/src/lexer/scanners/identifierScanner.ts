import type { ScannerContext } from '../types/index.js'
import { TokenType, resolveIdentifierType } from '../types/index.js'

type Literal = string | number | boolean | null

type IdentifierScannerContext = ScannerContext & {
  addToken: (type: TokenType, lexeme: string, literal: Literal, line: number, column: number) => void
}

export function scanIdentifierToken(context: IdentifierScannerContext, isAlphaNumeric: (char: string) => boolean): void {
  while (!context.isAtEnd() && isAlphaNumeric(context.peek())) {
    context.advance()
  }

  const lexeme = context.sliceLexeme()
  const tokenType = resolveIdentifierType(lexeme)
  const literal = tokenType === TokenType.Verdadero ? true : tokenType === TokenType.Falso ? false : null

  context.addToken(tokenType, lexeme, literal, context.line, context.column)
}
