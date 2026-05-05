import type { Token } from '../../lexer/lexer'

export interface ParserState {
  tokens: Token[]
  current: number
  inProcess?: boolean  // Tracking si estamos dentro de un bloque Proceso
}
