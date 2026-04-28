import { Lexer } from '../lexer/lexer'
import { Ast } from './ast'
import { parseProgram } from './parserStatements'
import { ParserState } from './parserState'

export namespace Parser {
  export class Parser {
    private readonly state: ParserState

    constructor(tokens: Lexer.Token[]) {
      this.state = {
        tokens,
        current: 0,
      }
    }

    public parse(): Ast.StatementNode[] {
      return parseProgram(this.state)
    }
  }
}
