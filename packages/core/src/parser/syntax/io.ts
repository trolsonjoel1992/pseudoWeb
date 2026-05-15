import type { ParserContext } from '../state'
import type { ReadNode, WriteNode } from '../ast'
import { TokenType } from '../../lexer/types'
import { parseExpression } from './expressions'
import { ERR_EXPECTED_VARIABLE_NAME_IN_READ } from '../constants'

export function parseWrite(state: ParserContext): WriteNode {
  const token = state.previous()
  const values = state.parseCommaSeparatedList(() => parseExpression(state), true)
  return { type: 'Write', values, line: token.line, column: token.column }
}

export function parseRead(state: ParserContext): ReadNode {
  const token = state.previous()
  const variables = state.parseCommaSeparatedList(
    () => state.consume(TokenType.Identificador, ERR_EXPECTED_VARIABLE_NAME_IN_READ).lexeme,
    true,
  )
  return { type: 'Read', variables, line: token.line, column: token.column }
}
