import type { ParserState } from './parserState'
import type { ReadNode, WriteNode } from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import { previous, consume, parseCommaSeparatedList } from '../utils/parserUtils'
import { parseExpression } from './parserExpressions'

export function parseWrite(state: ParserState): WriteNode {
  const token = previous(state)
  const values = parseCommaSeparatedList(state, parseExpression, true)
  return { type: 'Write', values, line: token.line, column: token.column }
}

export function parseRead(state: ParserState): ReadNode {
  const token = previous(state)
  const variables = parseCommaSeparatedList(state, (s) => consume(s, TokenType.Identificador, 'Se esperaba un identificador en Leer').lexeme, true)
  return { type: 'Read', variables, line: token.line, column: token.column }
}
