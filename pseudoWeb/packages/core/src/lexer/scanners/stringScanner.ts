import { TokenType } from '../types/index.js'
import { LexerError, ErrorCode } from '../../index.js'
import { buildMessage } from '../../constants/errorMessages.js'
import type { LexerContext } from '../orchestrator/lexerContext.js'

type Literal = string | number | boolean | null

type StringScannerContext = LexerContext & {
  addToken: (type: TokenType, lexeme: string, literal: Literal, line: number, column: number) => void
}

export function scanStringToken(context: StringScannerContext, quote: '"' | "'"): void {
  context.advance()

  let value = ''

  while (!context.isAtEnd() && context.peek() !== quote) {
    if (context.peek() === '\n') {
      throw new LexerError({
        code: ErrorCode.LEX_UNTERMINATED_STRING,
        message: buildMessage(ErrorCode.LEX_UNTERMINATED_STRING),
        line: context.line,
        column: context.column,
        module: 'lexer',
        context: { char: context.peek() },
      })
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
    throw new LexerError({
      code: ErrorCode.LEX_UNTERMINATED_STRING,
      message: buildMessage(ErrorCode.LEX_UNTERMINATED_STRING),
      line: context.line,
      column: context.column,
      module: 'lexer',
      context: {},
    })
  }

  context.advance()

  const type = quote === '"' ? TokenType.Alfanumerico : TokenType.Caracter
  context.addToken(type, context.sliceLexeme(), value, context.line, context.column)
}