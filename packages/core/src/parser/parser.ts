import type { Token } from '../lexer/lexer'
import type { ActionNode } from './ast'
import { parseProgram } from './gramars/parserStatements'
import { ParserState } from './gramars/parserState'

export class Parser {
  private readonly state: ParserState

  constructor(tokens: Token[]) {
    this.state = {
      tokens,
      current: 0,
    }
  }

  public parse(): ActionNode {
    return parseProgram(this.state)
  }
}
