import type { ParserContext } from '../state'
import type { StatementNode } from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import { handlerRegistry } from './handlerRegistry'
import { parseVariableDeclaration, parseAssignment, parseCallStatement } from '../syntax/declarations'
import { ERR_NO_DECLARATIONS_IN_PROCESO, ERR_INVALID_STATEMENT } from '../constants'

/**
 * Enrutador principal de sentencias.
 * Determina el tipo de sentencia y delega al handler correspondiente.
 */
export function parseStatement(state: ParserContext): StatementNode {
  // Intentar handlers registrados (control de flujo e I/O)
  const currentToken = state.peek()
  if (handlerRegistry[currentToken.type as TokenType]) {
    state.advance()
    return handlerRegistry[currentToken.type as TokenType](state)
  }

  // Validación: rechazar declaraciones en Proceso
  if (state.inProcess && state.check(TokenType.Identificador) && state.checkNext(TokenType.Coma, TokenType.DosPuntos)) {
    throw state.parserError(ERR_NO_DECLARATIONS_IN_PROCESO)
  }

  // Intentar declaraciones y asignaciones
  if (state.check(TokenType.Identificador) && state.checkNext(TokenType.Coma, TokenType.DosPuntos)) {
    return parseVariableDeclaration(state)
  }

  if (state.check(TokenType.Identificador) && state.checkNext(TokenType.Asignacion)) {
    return parseAssignment(state)
  }

  if (state.check(TokenType.Identificador) && state.checkNext(TokenType.ParentesisIzquierdo)) {
    return parseCallStatement(state)
  }

  // Manejar separadores recursivamente
  if (state.check(TokenType.SaltoDeLinea) || state.check(TokenType.PuntoYComa)) {
    state.skipSeparators()
    return parseStatement(state)
  }

  throw state.parserError(ERR_INVALID_STATEMENT)
}
