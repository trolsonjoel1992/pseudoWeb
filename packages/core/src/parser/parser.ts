import { Ast } from "./ast";
import { Lexer } from "../lexer/lexer";
import { TokenType } from "../lexer/tokenTypes";

export namespace Parser {
  export class Parser {
    private tokens: Lexer.Token[];
    private current = 0;

    constructor(tokens: Lexer.Token[]) {
      this.tokens = tokens;
    }

    public parse(): Ast.StatementNode[] {
      const statements: Ast.StatementNode[] = [];
      while (!this.isAtEnd()) {
        statements.push(this.declaration());
      }
      return statements;
    }

    private declaration(): Ast.StatementNode {
      if (this.match(TokenType.Identificador) && this.match(TokenType.Coma, true)) {
        return this.variableDeclaration();
      }
      throw new Error("Declaración no válida");
    }

    private variableDeclaration(): Ast.VariableDeclarationNode {
      const variables: string[] = [];
      do {
        variables.push(this.previous().lexeme);
      } while (this.match(TokenType.Coma));

      this.consume(TokenType.DosPuntos, "Se esperaba ':' después de las variables");
      const dataType = this.consume(TokenType.Identificador, "Se esperaba un tipo de dato").lexeme;

      return {
        type: "VariableDeclaration",
        variables,
        dataType,
      };
    }

    private match(type: TokenType, optional = false): boolean {
      if (this.check(type)) {
        this.advance();
        return true;
      }
      return optional;
    }

    private consume(type: TokenType, errorMessage: string): Lexer.Token {
      if (this.check(type)) return this.advance();
      throw new Error(errorMessage);
    }

    private check(type: TokenType): boolean {
      if (this.isAtEnd()) return false;
      return this.peek().type === type;
    }

    private advance(): Lexer.Token {
      if (!this.isAtEnd()) this.current++;
      return this.previous();
    }

    private peek(): Lexer.Token {
      return this.tokens[this.current];
    }

    private previous(): Lexer.Token {
      return this.tokens[this.current - 1];
    }

    private isAtEnd(): boolean {
      return this.peek().type === TokenType.EOF;
    }
  }
}