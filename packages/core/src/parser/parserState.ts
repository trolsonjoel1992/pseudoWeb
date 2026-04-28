import { Lexer } from '../lexer/lexer'

export interface ParserState {
  tokens: Lexer.Token[]
  current: number
}
