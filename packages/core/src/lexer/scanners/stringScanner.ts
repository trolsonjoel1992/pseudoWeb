import { LexerError } from '../../errors'
import { TokenType } from '../tokenTypes'

type Literal = string | number | boolean | null

type StringScannerContext = {
  quote: '"' | "'"
  line: number
  column: number
  isAtEnd: () => boolean
  peek: () => string
  advance: () => string
  sliceLexeme: () => string
  addToken: (type: TokenType, lexeme: string, literal: Literal, line: number, column: number) => void
}

export function scanStringToken(context: StringScannerContext): void {
  context.advance()

  let value = ''

  while (!context.isAtEnd() && context.peek() !== context.quote) {
    if (context.peek() === '\n') {
      throw new LexerError('Cadena sin cerrar', context.line, context.column)
    }

    if (context.peek() === '\\' && !context.isAtEnd()) {
      context.advance()

      if (context.isAtEnd()) {
        break
      }

      const escaped = context.advance()

      switch (escaped) {
        case 'n':
          value += '\n'
          continue
        case 't':
          value += '\t'
          continue
        case 'r':
          value += '\r'
          continue
        case '"':
        case "'":
        case '\\':
          value += escaped
          continue
        default:
          value += escaped
          continue
      }
    }

    value += context.advance()
  }

  if (context.isAtEnd()) {
    throw new LexerError('Cadena sin cerrar', context.line, context.column)
  }

  context.advance()

  const type = context.quote === '"' ? TokenType.Alfanumerico : TokenType.Caracter
  context.addToken(type, context.sliceLexeme(), value, context.line, context.column)
}
