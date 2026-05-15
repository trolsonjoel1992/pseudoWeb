import { ERR_UNTERMINATED_BLOCK_COMMENT } from '../constants/index.js'
import { LexerError } from '../types/index.js'
import { ErrorCode } from '../../errors.js'
import { buildMessage } from '../../constants/errorMessages.js'
import type { ScannerContext } from '../types/index.js'

type CommentScannerContext = ScannerContext

export function skipBlockComment(context: CommentScannerContext): void {
  context.advance()
  context.advance()

  while (!context.isAtEnd()) {
    if (context.peek() === '*' && context.peekNext() === '/') {
      context.advance()
      context.advance()
      return
    }

    context.advance()
  }

  throw new LexerError({
    code: ErrorCode.LEX_UNTERMINATED_STRING,
    message: buildMessage(ErrorCode.LEX_UNTERMINATED_STRING),
    line: context.line,
    column: context.column,
    module: 'lexer',
    context: {},
  })
}

export function skipLineComment(context: CommentScannerContext): void {
  while (!context.isAtEnd() && context.peek() !== '\n') {
    context.advance()
  }
  // \n no se consume, quedará en siguiente scanToken
}
