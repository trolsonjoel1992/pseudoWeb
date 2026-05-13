import type { Token } from '../../lexer/lexer'
import type { ActionNode } from '../ast'
import { parseProgram } from '../syntax/statements'
import { type ParserContext } from '../state'
import { ParserStateImpl } from '../state/parserState'

export class Parser {
  private readonly state: ParserContext

  constructor(tokens: Token[]) {
    this.state = new ParserStateImpl(tokens)
  }

  public parse(): ActionNode {
    return parseProgram(this.state)
  }
}
