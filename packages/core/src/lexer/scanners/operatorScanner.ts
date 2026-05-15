import { ERR_UNEXPECTED_CHARACTER } from '../constants/index.js'
import { LexerError, TokenType } from '../types/index.js'
import type { ScannerContext } from '../types/index.js'

type Literal = string | number | boolean | null

type OperatorScannerContext = ScannerContext & {
  addToken: (type: TokenType, lexeme: string, literal: Literal, line: number, column: number) => void
}

export function scanOperatorToken(context: OperatorScannerContext, char: string): void {
  const { line, column } = context

  switch (char) {
    case ':':
      if (context.peekNext() === '=') {
        context.advance()
        context.advance()
        context.addToken(TokenType.Asignacion, ':=', null, line, column)
        return
      }
      context.advance()
      context.addToken(TokenType.DosPuntos, ':', null, line, column)
      return

    case '+':
      context.advance()
      context.addToken(TokenType.Suma, '+', null, line, column)
      return

    case '-':
      context.advance()
      context.addToken(TokenType.Resta, '-', null, line, column)
      return

    case '*':
      if (context.peekNext() === '*') {
        context.advance()
        context.advance()
        context.addToken(TokenType.Potencia, '**', null, line, column)
        return
      }
      context.advance()
      context.addToken(TokenType.Multiplicacion, '*', null, line, column)
      return

    case '/':
      context.advance()
      context.addToken(TokenType.Division, '/', null, line, column)
      return

    case '=':
      context.advance()
      context.addToken(TokenType.Igual, '=', null, line, column)
      return

    case '<':
      if (context.peekNext() === '=') {
        context.advance()
        context.advance()
        context.addToken(TokenType.MenorIgual, '<=', null, line, column)
        return
      }

      if (context.peekNext() === '>') {
        context.advance()
        context.advance()
        context.addToken(TokenType.Distinto, '<>', null, line, column)
        return
      }

      context.advance()
      context.addToken(TokenType.Menor, '<', null, line, column)
      return

    case '>':
      if (context.peekNext() === '=') {
        context.advance()
        context.advance()
        context.addToken(TokenType.MayorIgual, '>=', null, line, column)
        return
      }

      context.advance()
      context.addToken(TokenType.Mayor, '>', null, line, column)
      return

    case '(':
      context.advance()
      context.addToken(TokenType.ParentesisIzquierdo, '(', null, line, column)
      return

    case ')':
      context.advance()
      context.addToken(TokenType.ParentesisDerecho, ')', null, line, column)
      return

    case ',':
      context.advance()
      context.addToken(TokenType.Coma, ',', null, line, column)
      return

    case ';':
      context.advance()
      context.addToken(TokenType.PuntoYComa, ';', null, line, column)
      return

    case '.':
      if (context.peekNext() === '.') {
        context.advance()
        context.advance()
        context.addToken(TokenType.Rango, '..', null, line, column)
        return
      }
      break
  }

  throw new LexerError(ERR_UNEXPECTED_CHARACTER(char, line, column), line, column)
}
