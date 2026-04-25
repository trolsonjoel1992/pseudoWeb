import { LexerError } from "../errors";
import { resolveIdentifierType } from "./tokenRules";
import { TokenType } from "./tokenTypes";

export namespace Lexer {
  export interface Token {
    type: TokenType;
    lexeme: string;
    literal: string | number | boolean | null;
    line: number;
    column: number;
  }

  export class Lexer {
    private source: string;
    private tokens: Token[] = [];
    private start = 0;
    private current = 0;
    private line = 1;
    private column = 1;

    constructor(source: string) {
      this.source = source;
    }

    public tokenize(): Token[] {
      while (!this.isAtEnd()) {
        this.start = this.current;
        this.scanToken();
      }

      this.tokens.push({
        type: TokenType.EOF,
        lexeme: "",
        literal: null,
        line: this.line,
        column: this.column,
      });

      return this.tokens;
    }

    private scanToken(): void {
      const char = this.peek();

      if (char === ' ' || char === '\r' || char === '\t') {
        this.advance();
        return;
      }

      if (char === '\n') {
        const line = this.line;
        const column = this.column;
        this.advance();
        this.addToken(TokenType.SaltoDeLinea, '\n', null, line, column);
        return;
      }

      if (char === '/' && this.peekNext() === '*') {
        this.skipBlockComment();
        return;
      }

      if (char === '"' || char === "'") {
        this.scanString(char);
        return;
      }

      if (this.isDigit(char)) {
        this.scanNumber();
        return;
      }

      if (this.isAlpha(char)) {
        this.scanIdentifier();
        return;
      }

      const line = this.line;
      const column = this.column;

      switch (char) {
        case ':':
          if (this.peekNext() === '=') {
            this.advance();
            this.advance();
            this.addToken(TokenType.Asignacion, ':=', null, line, column);
            return;
          }
          this.advance();
          this.addToken(TokenType.DosPuntos, ':', null, line, column);
          return;
        case '+':
          this.advance();
          this.addToken(TokenType.Suma, '+', null, line, column);
          return;
        case '-':
          this.advance();
          this.addToken(TokenType.Resta, '-', null, line, column);
          return;
        case '*':
          if (this.peekNext() === '*') {
            this.advance();
            this.advance();
            this.addToken(TokenType.Potencia, '**', null, line, column);
            return;
          }
          this.advance();
          this.addToken(TokenType.Multiplicacion, '*', null, line, column);
          return;
        case '/':
          this.advance();
          this.addToken(TokenType.Division, '/', null, line, column);
          return;
        case '=':
          this.advance();
          this.addToken(TokenType.Igual, '=', null, line, column);
          return;
        case '<':
          if (this.peekNext() === '=') {
            this.advance();
            this.advance();
            this.addToken(TokenType.MenorIgual, '<=', null, line, column);
            return;
          }
          if (this.peekNext() === '>') {
            this.advance();
            this.advance();
            this.addToken(TokenType.Distinto, '<>', null, line, column);
            return;
          }
          this.advance();
          this.addToken(TokenType.Menor, '<', null, line, column);
          return;
        case '>':
          if (this.peekNext() === '=') {
            this.advance();
            this.advance();
            this.addToken(TokenType.MayorIgual, '>=', null, line, column);
            return;
          }
          this.advance();
          this.addToken(TokenType.Mayor, '>', null, line, column);
          return;
        case '(':
          this.advance();
          this.addToken(TokenType.ParentesisIzquierdo, '(', null, line, column);
          return;
        case ')':
          this.advance();
          this.addToken(TokenType.ParentesisDerecho, ')', null, line, column);
          return;
        case ',':
          this.advance();
          this.addToken(TokenType.Coma, ',', null, line, column);
          return;
        case ';':
          this.advance();
          this.addToken(TokenType.PuntoYComa, ';', null, line, column);
          return;
        case '.':
          if (this.peekNext() === '.') {
            this.advance();
            this.advance();
            this.addToken(TokenType.Rango, '..', null, line, column);
            return;
          }
          break;
      }

      throw new LexerError(`Caracter inesperado '${char}'`, line, column);
    }

    private scanIdentifier(): void {
      const line = this.line;
      const column = this.column;

      while (!this.isAtEnd() && this.isAlphaNumeric(this.peek())) {
        this.advance();
      }

      const lexeme = this.source.slice(this.start, this.current);
      const tokenType = resolveIdentifierType(lexeme);
      const literal = tokenType === TokenType.Verdadero ? true : tokenType === TokenType.Falso ? false : null;
      this.addToken(tokenType, lexeme, literal, line, column);
    }

    private scanNumber(): void {
      const line = this.line;
      const column = this.column;

      while (!this.isAtEnd() && this.isDigit(this.peek())) {
        this.advance();
      }

      let tokenType = TokenType.Entero;
      if (this.peek() === '.' && this.isDigit(this.peekNext())) {
        tokenType = TokenType.Real;
        this.advance();
        while (!this.isAtEnd() && this.isDigit(this.peek())) {
          this.advance();
        }
      }

      const lexeme = this.source.slice(this.start, this.current);
      const literal = tokenType === TokenType.Real ? Number(lexeme) : Number.parseInt(lexeme, 10);
      this.addToken(tokenType, lexeme, literal, line, column);
    }

    private scanString(quote: '"' | "'"): void {
      const line = this.line;
      const column = this.column;
      this.advance();

      let value = '';
      while (!this.isAtEnd() && this.peek() !== quote) {
        if (this.peek() === '\n') {
          throw new LexerError('Cadena sin cerrar', line, column);
        }

        if (this.peek() === '\\' && !this.isAtEnd()) {
          this.advance();
          if (this.isAtEnd()) {
            break;
          }

          const escaped = this.advance();
          switch (escaped) {
            case 'n':
              value += '\n';
              continue;
            case 't':
              value += '\t';
              continue;
            case 'r':
              value += '\r';
              continue;
            case '"':
            case "'":
            case '\\':
              value += escaped;
              continue;
            default:
              value += escaped;
              continue;
          }
        }

        value += this.advance();
      }

      if (this.isAtEnd()) {
        throw new LexerError('Cadena sin cerrar', line, column);
      }

      this.advance();
      const type = quote === '"' ? TokenType.Alfanumerico : TokenType.Caracter;
      this.addToken(type, this.source.slice(this.start, this.current), value, line, column);
    }

    private skipBlockComment(): void {
      const line = this.line;
      const column = this.column;
      this.advance();
      this.advance();

      while (!this.isAtEnd()) {
        if (this.peek() === '*' && this.peekNext() === '/') {
          this.advance();
          this.advance();
          return;
        }

        if (this.peek() === '\n') {
          this.advance();
          continue;
        }

        this.advance();
      }

      throw new LexerError('Comentario sin cerrar', line, column);
    }

    private addToken(
      type: TokenType,
      lexeme: string,
      literal: string | number | boolean | null = null,
      line?: number,
      column?: number,
    ): void {
      const resolvedLine = line ?? this.line;
      const resolvedColumn = column ?? this.column;

      this.tokens.push({
        type,
        lexeme,
        literal,
        line: resolvedLine,
        column: resolvedColumn,
      });
    }

    private advance(): string {
      const char = this.source[this.current];
      this.current++;
      if (char === '\n') {
        this.line++;
        this.column = 1;
      } else {
        this.column++;
      }
      return char;
    }

    private peek(): string {
      return this.source[this.current] ?? '\0';
    }

    private peekNext(): string {
      return this.source[this.current + 1] ?? '\0';
    }

    private isDigit(char: string): boolean {
      return char >= '0' && char <= '9';
    }

    private isAlpha(char: string): boolean {
      return /[A-Za-z_ÁÉÍÓÚÜÑáéíóúüñ]/.test(char);
    }

    private isAlphaNumeric(char: string): boolean {
      return this.isAlpha(char) || this.isDigit(char);
    }

    private isAtEnd(): boolean {
      return this.current >= this.source.length;
    }
  }
}