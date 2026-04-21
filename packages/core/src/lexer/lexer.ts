import { tokenRules } from "./tokenRules";
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
      const char = this.advance();

      for (const rule of tokenRules) {
        const match = this.matchRule(rule.regex);
        if (match) {
          this.addToken(rule.type, match);
          return;
        }
      }

      // If no rule matches, report an error or skip the character
      console.error(`Unexpected character '${char}' at line ${this.line}, column ${this.column}`);
    }

    private matchRule(regex: RegExp): string | null {
      const substring = this.source.substring(this.start);
      const match = substring.match(regex);
      if (match && match.index === 0) {
        this.current += match[0].length;
        this.column += match[0].length;
        return match[0];
      }
      return null;
    }

    private addToken(type: TokenType, lexeme: string, literal: string | number | boolean | null = null): void {
      this.tokens.push({
        type,
        lexeme,
        literal,
        line: this.line,
        column: this.column - lexeme.length,
      });
    }

    private advance(): string {
      const char = this.source[this.current];
      this.current++;
      if (char === "\n") {
        this.line++;
        this.column = 1;
        this.addToken(TokenType.SaltoDeLinea, "\n");
        return "\n"; // Retornar el carácter para evitar el error de tipo
      } else {
        this.column++;
      }
      return char;
    }

    private isAtEnd(): boolean {
      return this.current >= this.source.length;
    }
  }
}