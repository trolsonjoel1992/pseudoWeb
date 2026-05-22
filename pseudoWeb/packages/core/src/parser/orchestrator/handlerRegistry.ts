import type { ParserContext } from '../state'
import type { StatementNode } from '../ast'
import { TokenType } from '../../lexer/types'
import { parseIf, parseWhile, parseFor, parseSwitch, parseDoWhile } from '../syntax/controlFlow'
import { parseWrite, parseRead } from '../syntax/io'
import { parseCallStatement } from '../syntax/declarations'

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
  [TokenType.Crear]: parseCallStatement,
  [TokenType.Arrancar]: parseCallStatement,
  [TokenType.Avanzar]: parseCallStatement,
  [TokenType.FinDeSecuencia]: parseCallStatement,
  [TokenType.NoFinDeSecuencia]: parseCallStatement,
  [TokenType.Cerrar]: parseCallStatement,
  [TokenType.Segun]: parseSwitch,
  [TokenType.Repetir]: parseDoWhile,
}
