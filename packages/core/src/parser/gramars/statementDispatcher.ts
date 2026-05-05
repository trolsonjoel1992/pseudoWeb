import type { ParserState } from './parserState'
import type { StatementNode } from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import { check, checkNext, match, parserError, peek, skipSeparators } from '../utils/parserUtils'
import { parseIf } from './controlFlowParser'
import { parseWhile } from './controlFlowParser'
import { parseFor } from './controlFlowParser'
import { parseSegun } from './controlFlowParser'
import { parseRepetir } from './controlFlowParser'
import { parseWrite } from './ioParser'
import { parseRead } from './ioParser'
import { parseVariableDeclaration } from './declarationParser'
import { parseAssignment } from './declarationParser'
import { parseCallStatement } from './declarationParser'

export function parseStatement(state: ParserState): StatementNode {
  if (match(state, TokenType.Si)) return parseIf(state)
  if (match(state, TokenType.Mientras)) return parseWhile(state)
  if (match(state, TokenType.Para)) return parseFor(state)
  if (match(state, TokenType.Escribir)) return parseWrite(state)
  if (match(state, TokenType.Leer)) return parseRead(state)
  if (match(state, TokenType.Segun)) return parseSegun(state)
  if (match(state, TokenType.Repetir)) return parseRepetir(state)
  
  // Validación: rechazar declaraciones en Proceso
  if (state.inProcess && check(state, TokenType.Identificador) && checkNext(state, TokenType.Coma, TokenType.DosPuntos)) {
    throw parserError(state, peek(state), 'Las declaraciones de variables solo se permiten en el bloque Ambiente, no en Proceso')
  }
  
  if (check(state, TokenType.Identificador) && checkNext(state, TokenType.Coma, TokenType.DosPuntos)) return parseVariableDeclaration(state)
  if (check(state, TokenType.Identificador) && checkNext(state, TokenType.Asignacion)) return parseAssignment(state)
  if (check(state, TokenType.Identificador) && checkNext(state, TokenType.ParentesisIzquierdo)) return parseCallStatement(state)
  if (check(state, TokenType.SaltoDeLinea) || check(state, TokenType.PuntoYComa)) {
    skipSeparators(state)
    return parseStatement(state)
  }

  throw parserError(state, peek(state), 'Sentencia no válida')
}
