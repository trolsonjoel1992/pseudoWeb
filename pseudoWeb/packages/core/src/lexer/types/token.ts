import { TokenType } from './tokenType'

export interface Token {
  type: TokenType
  lexeme: string
  literal: string | number | boolean | null
  line: number
  column: number
}
