import { LexerError } from '../../errors'

type CommentScannerContext = {
  line: number
  column: number
  isAtEnd: () => boolean
  peek: () => string
  peekNext: () => string
  advance: () => string
}

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

  throw new LexerError('Comentario sin cerrar', context.line, context.column)
}

export function skipLineComment(context: CommentScannerContext): void {
  while (!context.isAtEnd() && context.peek() !== '\n') {
    context.advance()
  }
  // \n no se consume, quedará en siguiente scanToken
}
