import type {
  ActionNode,
  ConstantDeclarationNode,
  DataType,
  EnvironmentBlockNode,
  FunctionDeclarationNode,
  LiteralValue,
  ParameterNode,
  ProcedureDeclarationNode,
  StatementNode,
  VariableDeclarationNode,
} from '../ast'
import { TokenType } from '../../lexer/types'
import type { ParserContext } from '../state'
import { parseStatement } from '../orchestrator/dispatcher'
import { parseVariableDeclaration as decParseVariableDeclaration } from './declarations'
import { parseDataType, toDataType } from '../types'
import { parseEnvironment } from './environment'
import { ERR_EXPECTED_ACTION_HEADER, ERR_EXPECTED_ACTION_NAME, ERR_EXPECTED_COLON_AFTER_ACTION, ERR_EXPECTED_ES_KEYWORD, ERR_EXPECTED_AMBIENTE_BLOCK, ERR_EXPECTED_PROCESO_BLOCK, ERR_EXPECTED_FIN_ACCION, ERR_CONSTANTS_BEFORE_VARIABLES, ERR_EXPECTED_IDENTIFIER, ERR_EXPECTED_EQUAL, ERR_EXPECTED_LITERAL_IN_CONSTANT_DECLARATION, ERR_INVALID_AMBIENTE_DECLARATION, ERR_VARIABLES_BEFORE_CALLABLES, ERR_EXPECTED_FUNCTION_NAME, ERR_EXPECTED_PROCEDURE_NAME, ERR_EXPECTED_OPEN_PAREN_AFTER_FUNCTION, ERR_EXPECTED_PARAMETER_NAME, ERR_EXPECTED_COLON_IN_PARAMETER, ERR_EXPECTED_CLOSE_PAREN_AFTER_PARAMS, ERR_EXPECTED_COLON_BEFORE_RETURN_TYPE, ERR_EXPECTED_PROCESO_IN_FUNCTION, ERR_EXPECTED_PROCESO_IN_PROCEDURE, ERR_EXPECTED_FIN_FUNCTION, ERR_EXPECTED_FIN_PROCEDURE, ERR_REDECLARED_IDENTIFIER, ERR_SHADOWING_NOT_ALLOWED } from '../constants'

export function parseProgram(state: ParserContext): ActionNode {
  state.skipSeparators()

  // Exigir estructura: Accion <identificador> : ES
  if (!state.match(TokenType.Accion)) {
    throw state.parserError(ERR_EXPECTED_ACTION_HEADER)
  }

  const accionToken = state.previous()
  const actionName = state.consume(TokenType.Identificador, ERR_EXPECTED_ACTION_NAME).lexeme
  state.consume(TokenType.DosPuntos, ERR_EXPECTED_COLON_AFTER_ACTION)
  state.consume(TokenType.ES, ERR_EXPECTED_ES_KEYWORD)

  // Ambiente obligatorio
  state.skipSeparators()
  if (!state.match(TokenType.Ambiente)) {
    throw state.parserError(ERR_EXPECTED_AMBIENTE_BLOCK)
  }

  // Parsear y validar ambiente (orden estricto)
  const ambiente = parseEnvironment(state)

  // Proceso obligatorio
  state.skipSeparators()
  if (!state.match(TokenType.Proceso)) {
    throw state.parserError(ERR_EXPECTED_PROCESO_BLOCK)
  }

  // Parsear proceso hasta FinAccion (con contexto inProcess = true)
  state.inProcess = true
  const proceso = parseBlock(state, [TokenType.FinAccion])
  state.inProcess = false

  // Consumir FinAccion
  state.consume(TokenType.FinAccion, ERR_EXPECTED_FIN_ACCION)

  return { type: 'Action', name: actionName, ambiente, proceso, line: accionToken.line, column: accionToken.column }
}

export function parseBlock(state: ParserContext, stoppers: TokenType[]): StatementNode[] {
  const statements: StatementNode[] = []
  while (!state.isAtEnd() && !state.checkAny(stoppers)) {
    state.skipSeparators()
    if (state.isAtEnd() || state.checkAny(stoppers)) break
    statements.push(parseStatement(state))
  }
  state.skipSeparators()
  return statements
}

// parseEnvironment moved to syntax/environment.ts

// NOTE: environment/callable helpers moved to syntax/environment.ts and syntax/callables.ts
