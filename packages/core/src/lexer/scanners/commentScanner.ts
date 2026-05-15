import { ERR_UNTERMINATED_BLOCK_COMMENT } from '../constants/index.js'
import { LexerError } from '../types/index.js'
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

  throw new LexerError(ERR_UNTERMINATED_BLOCK_COMMENT(context.line, context.column), context.line, context.column)
}

export function skipLineComment(context: CommentScannerContext): void {
  while (!context.isAtEnd() && context.peek() !== '\n') {
    context.advance()
  }
  // \n no se consume, quedará en siguiente scanToken
}
