import type { Token } from '../../lexer/lexer'

export interface ParserState {
  tokens: Token[]
  current: number
}
