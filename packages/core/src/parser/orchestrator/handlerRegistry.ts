import type { ParserContext } from '../state'
import type { StatementNode } from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import { parseIf, parseWhile, parseFor, parseSwitch, parseDoWhile } from '../syntax/controlFlow'
import { parseWrite, parseRead } from '../syntax/io'

/**
 * Registry de handlers para sentencias de control de flujo y I/O.
 * Mapea TokenType a sus funciones parseadoras correspondientes.
 */
export const handlerRegistry: Record<string, (ctx: ParserContext) => StatementNode> = {
  [TokenType.Si]: parseIf,
  [TokenType.Mientras]: parseWhile,
  [TokenType.Para]: parseFor,
  [TokenType.Escribir]: parseWrite,
  [TokenType.Leer]: parseRead,
  [TokenType.Segun]: parseSwitch,
  [TokenType.Repetir]: parseDoWhile,
}
