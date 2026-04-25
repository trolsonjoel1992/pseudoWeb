import { ParserError } from '../errors';
import { Ast } from './ast';
import { Lexer } from '../lexer/lexer';
import { TokenType } from '../lexer/tokenTypes';

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
        this.skipSeparators();

        if (this.isAtEnd()) {
          break;
        }

        if (this.match(TokenType.Accion) || this.match(TokenType.FinAccion) || this.match(TokenType.Fin)) {
          continue;
        }

        statements.push(this.statement());
      }

      return statements;
    }

    private statement(): Ast.StatementNode {
      if (this.match(TokenType.Si)) {
        return this.ifStatement();
      }

      if (this.match(TokenType.Mientras)) {
        return this.whileStatement();
      }

      if (this.match(TokenType.Para)) {
        return this.forStatement();
      }

      if (this.match(TokenType.Escribir)) {
        return this.writeStatement();
      }

      if (this.match(TokenType.Leer)) {
        return this.readStatement();
      }

      if (this.check(TokenType.Identificador) && this.checkNext(TokenType.Coma, TokenType.DosPuntos)) {
        return this.variableDeclaration();
      }

      if (this.check(TokenType.Identificador) && this.checkNext(TokenType.Asignacion)) {
        return this.assignment();
      }

      if (this.check(TokenType.SaltoDeLinea) || this.check(TokenType.PuntoYComa)) {
        this.advance();
        return this.statement();
      }

      throw this.error(this.peek(), 'Sentencia no válida');
    }

    private variableDeclaration(): Ast.VariableDeclarationNode {
      const start = this.peek();
      const variables: string[] = [];

      do {
        variables.push(this.consume(TokenType.Identificador, 'Se esperaba un identificador').lexeme);
      } while (this.match(TokenType.Coma));

      this.consume(TokenType.DosPuntos, "Se esperaba ':' después de las variables");
      const dataType = this.consumeAny([TokenType.Identificador, TokenType.Verdadero, TokenType.Falso], 'Se esperaba un tipo de dato').lexeme;

      return {
        type: 'VariableDeclaration',
        variables,
        dataType,
        line: start.line,
        column: start.column,
      };
    }

    private assignment(): Ast.AssignmentNode {
      const variable = this.consume(TokenType.Identificador, 'Se esperaba una variable').lexeme;
      const equals = this.consume(TokenType.Asignacion, "Se esperaba ':=' en la asignación");
      const value = this.expression();

      return {
        type: 'Assignment',
        variable,
        value,
        line: equals.line,
        column: equals.column,
      };
    }

    private writeStatement(): Ast.WriteNode {
      const token = this.previous();
      const values: Ast.ExpressionNode[] = [];

      if (this.match(TokenType.ParentesisIzquierdo)) {
        if (!this.check(TokenType.ParentesisDerecho)) {
          do {
            values.push(this.expression());
          } while (this.match(TokenType.Coma));
        }

        this.consume(TokenType.ParentesisDerecho, "Se esperaba ')' al cerrar Escribir");
      } else {
        values.push(this.expression());

        while (this.match(TokenType.Coma)) {
          values.push(this.expression());
        }
      }

      return {
        type: 'Write',
        values,
        line: token.line,
        column: token.column,
      };
    }

    private readStatement(): Ast.ReadNode {
      const token = this.previous();
      const variables: string[] = [];

      if (this.match(TokenType.ParentesisIzquierdo)) {
        if (!this.check(TokenType.ParentesisDerecho)) {
          do {
            variables.push(this.consume(TokenType.Identificador, 'Se esperaba un identificador en Leer').lexeme);
          } while (this.match(TokenType.Coma));
        }

        this.consume(TokenType.ParentesisDerecho, "Se esperaba ')' al cerrar Leer");
      } else {
        variables.push(this.consume(TokenType.Identificador, 'Se esperaba un identificador en Leer').lexeme);

        while (this.match(TokenType.Coma)) {
          variables.push(this.consume(TokenType.Identificador, 'Se esperaba un identificador en Leer').lexeme);
        }
      }

      return {
        type: 'Read',
        variables,
        line: token.line,
        column: token.column,
      };
    }

    private ifStatement(): Ast.IfNode {
      const token = this.previous();
      const condition = this.expression();
      this.match(TokenType.Entonces);

      const thenBranch = this.block([TokenType.Sino, TokenType.FinSi]);
      const elseBranch = this.match(TokenType.Sino) ? this.block([TokenType.FinSi]) : [];

      this.consume(TokenType.FinSi, 'Se esperaba FinSi');

      return {
        type: 'If',
        condition,
        thenBranch,
        elseBranch,
        line: token.line,
        column: token.column,
      };
    }

    private whileStatement(): Ast.WhileNode {
      const token = this.previous();
      const condition = this.expression();
      this.match(TokenType.Hacer);
      const body = this.block([TokenType.FinMientras]);
      this.consume(TokenType.FinMientras, 'Se esperaba FinMientras');

      return {
        type: 'While',
        condition,
        body,
        line: token.line,
        column: token.column,
      };
    }

    private forStatement(): Ast.ForNode {
      const token = this.previous();
      const variable = this.consume(TokenType.Identificador, 'Se esperaba el nombre del contador').lexeme;
      this.consume(TokenType.Asignacion, "Se esperaba ':=' en el Para");
      const start = this.expression();

      if (!this.match(TokenType.Rango) && !this.match(TokenType.HastaQue)) {
        throw this.error(this.peek(), "Se esperaba '..' o HastaQue en el Para");
      }

      const end = this.expression();
      this.match(TokenType.Hacer);
      const body = this.block([TokenType.FinPara]);
      this.consume(TokenType.FinPara, 'Se esperaba FinPara');

      return {
        type: 'For',
        variable,
        start,
        end,
        body,
        line: token.line,
        column: token.column,
      };
    }

    private block(stoppers: TokenType[]): Ast.StatementNode[] {
      const statements: Ast.StatementNode[] = [];

      while (!this.isAtEnd() && !this.checkAny(stoppers)) {
        this.skipSeparators();

        if (this.isAtEnd() || this.checkAny(stoppers)) {
          break;
        }

        statements.push(this.statement());
      }

      this.skipSeparators();
      return statements;
    }

    private expression(): Ast.ExpressionNode {
      return this.or();
    }

    private or(): Ast.ExpressionNode {
      let expr = this.and();

      while (this.match(TokenType.O)) {
        const operator = this.previous();
        const right = this.and();
        expr = this.binary(expr, operator, right);
      }

      return expr;
    }

    private and(): Ast.ExpressionNode {
      let expr = this.equality();

      while (this.match(TokenType.Y)) {
        const operator = this.previous();
        const right = this.equality();
        expr = this.binary(expr, operator, right);
      }

      return expr;
    }

    private equality(): Ast.ExpressionNode {
      let expr = this.comparison();

      while (this.match(TokenType.Igual) || this.match(TokenType.Distinto)) {
        const operator = this.previous();
        const right = this.comparison();
        expr = this.binary(expr, operator, right);
      }

      return expr;
    }

    private comparison(): Ast.ExpressionNode {
      let expr = this.term();

      while (
        this.match(TokenType.Menor) ||
        this.match(TokenType.MenorIgual) ||
        this.match(TokenType.Mayor) ||
        this.match(TokenType.MayorIgual)
      ) {
        const operator = this.previous();
        const right = this.term();
        expr = this.binary(expr, operator, right);
      }

      return expr;
    }

    private term(): Ast.ExpressionNode {
      let expr = this.factor();

      while (this.match(TokenType.Suma) || this.match(TokenType.Resta)) {
        const operator = this.previous();
        const right = this.factor();
        expr = this.binary(expr, operator, right);
      }

      return expr;
    }

    private factor(): Ast.ExpressionNode {
      let expr = this.power();

      while (
        this.match(TokenType.Multiplicacion) ||
        this.match(TokenType.Division) ||
        this.match(TokenType.Div) ||
        this.match(TokenType.Mod)
      ) {
        const operator = this.previous();
        const right = this.power();
        expr = this.binary(expr, operator, right);
      }

      return expr;
    }

    private power(): Ast.ExpressionNode {
      let expr = this.unary();

      if (this.match(TokenType.Potencia)) {
        const operator = this.previous();
        const right = this.power();
        expr = this.binary(expr, operator, right);
      }

      return expr;
    }

    private unary(): Ast.ExpressionNode {
      if (this.match(TokenType.Resta) || this.match(TokenType.No)) {
        const operator = this.previous();
        const right = this.unary();
        return {
          type: 'UnaryExpression',
          operator: operator.type,
          right,
          line: operator.line,
          column: operator.column,
        };
      }

      return this.primary();
    }

    private primary(): Ast.ExpressionNode {
      const token = this.peek();

      if (this.match(TokenType.Entero) || this.match(TokenType.Real) || this.match(TokenType.Alfanumerico) || this.match(TokenType.Caracter)) {
        const literal = this.previous();
        return {
          type: 'Literal',
          value: literal.literal,
          line: literal.line,
          column: literal.column,
        };
      }

      if (this.match(TokenType.Verdadero) || this.match(TokenType.Falso)) {
        const literal = this.previous();
        return {
          type: 'Literal',
          value: literal.literal,
          line: literal.line,
          column: literal.column,
        };
      }

      if (this.match(TokenType.Identificador)) {
        const identifier = this.previous();
        return {
          type: 'Identifier',
          name: identifier.lexeme,
          line: identifier.line,
          column: identifier.column,
        };
      }

      if (this.match(TokenType.ParentesisIzquierdo)) {
        const expression = this.expression();
        this.consume(TokenType.ParentesisDerecho, "Se esperaba ')' después de la expresión");
        return {
          type: 'Grouping',
          expression,
          line: token.line,
          column: token.column,
        };
      }

      throw this.error(token, 'Se esperaba una expresión');
    }

    private binary(left: Ast.ExpressionNode, operator: Lexer.Token, right: Ast.ExpressionNode): Ast.BinaryExpressionNode {
      return {
        type: 'BinaryExpression',
        operator: operator.type,
        left,
        right,
        line: operator.line,
        column: operator.column,
      };
    }

    private consumeAny(types: TokenType[], errorMessage: string): Lexer.Token {
      for (const type of types) {
        if (this.check(type)) {
          return this.advance();
        }
      }

      throw this.error(this.peek(), errorMessage);
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
      throw this.error(this.peek(), errorMessage);
    }

    private check(type: TokenType): boolean {
      if (this.isAtEnd()) return false;
      return this.peek().type === type;
    }

    private checkNext(...types: TokenType[]): boolean {
      const next = this.tokens[this.current + 1];

      if (!next) {
        return false;
      }

      return types.includes(next.type);
    }

    private checkAny(types: TokenType[]): boolean {
      return types.some((type) => this.check(type));
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

    private skipSeparators(): void {
      while (this.match(TokenType.SaltoDeLinea) || this.match(TokenType.PuntoYComa)) {
        // Skip separators.
      }
    }

    private error(token: Lexer.Token, message: string): ParserError {
      const location = token.type === TokenType.EOF ? 'al final del archivo' : `en '${token.lexeme}'`;
      return new ParserError(`${message} ${location}`, token.line, token.column);
    }

    private isAtEnd(): boolean {
      return this.peek().type === TokenType.EOF;
    }
  }
}