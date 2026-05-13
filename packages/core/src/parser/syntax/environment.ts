import type {
  ConstantDeclarationNode,
  VariableDeclarationNode,
  FunctionDeclarationNode,
  ProcedureDeclarationNode,
  EnvironmentBlockNode,
  LiteralValue,
} from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import type { ParserContext } from '../state'
import { parseVariableDeclaration as decParseVariableDeclaration } from './declarations'
import { parseFunction, parseProcedure } from './callables'
import { toDataType } from '../types'
import { ERR_CONSTANTS_BEFORE_VARIABLES, ERR_VARIABLES_BEFORE_CALLABLES, ERR_EXPECTED_IDENTIFIER, ERR_EXPECTED_EQUAL, ERR_EXPECTED_LITERAL_IN_CONSTANT_DECLARATION, ERR_INVALID_AMBIENTE_DECLARATION, ERR_REDECLARED_IDENTIFIER, ERR_SHADOWING_NOT_ALLOWED } from '../constants'
import { parserError } from '../utils/tokens'

export type ParseEnvironmentOptions =
  | { disallowShadowing?: false; parentScopeNames?: Set<string> }
  | { disallowShadowing: true; parentScopeNames: Set<string> }

export function parseEnvironment(state: ParserContext, options?: ParseEnvironmentOptions): EnvironmentBlockNode {
  enum Phase { Constants = 1, Variables = 2, Functions = 3 }
  let phase = Phase.Constants
  const constants: ConstantDeclarationNode[] = []
  const variables: VariableDeclarationNode[] = []
  const functions: FunctionDeclarationNode[] = []
  const procedures: ProcedureDeclarationNode[] = []
  const declaredNames = new Set<string>()

  while (!state.isAtEnd() && !state.checkAny([TokenType.Proceso, TokenType.FinAccion])) {
    state.skipSeparators()
    if (state.isAtEnd() || state.checkAny([TokenType.Proceso, TokenType.FinAccion])) break

    // Constante: Identificador '=' Literal
    if (state.check(TokenType.Identificador) && state.checkNext(TokenType.Igual)) {
      if (phase > Phase.Constants) {
        throw state.parserError(ERR_CONSTANTS_BEFORE_VARIABLES)
      }
      const start = state.peek()
      const name = state.consume(TokenType.Identificador, ERR_EXPECTED_IDENTIFIER).lexeme
      registerDeclarationName(state, name, declaredNames, options)
      state.consume(TokenType.Igual, ERR_EXPECTED_EQUAL)
      const valueToken = consumeAny(state, [TokenType.Entero, TokenType.Real, TokenType.Caracter, TokenType.Alfanumerico, TokenType.Verdadero, TokenType.Falso], ERR_EXPECTED_LITERAL_IN_CONSTANT_DECLARATION)
      const value = valueToken.literal as LiteralValue
      constants.push({ type: 'ConstantDeclaration', name, value, dataType: toDataType(valueToken), line: start.line, column: start.column })
      continue
    }

    // Variable declaration: Identificador (,) ':' Tipo
    if (state.check(TokenType.Identificador) && state.checkNext(TokenType.Coma, TokenType.DosPuntos)) {
      if (phase > Phase.Variables) {
        throw state.parserError(ERR_VARIABLES_BEFORE_CALLABLES)
      }
      phase = Math.max(phase, Phase.Variables)
      const declaration = decParseVariableDeclaration(state)
      for (const variable of declaration.variables) {
        registerDeclarationName(state, variable, declaredNames, options)
      }
      variables.push(declaration)
      continue
    }

    // Funcion / Procedimiento
    if (state.match(TokenType.Funcion)) {
      phase = Phase.Functions
      const fn = parseFunction(state, declaredNames, options, parseEnvironment)
      functions.push(fn)
      continue
    }

    if (state.match(TokenType.Procedimiento)) {
      phase = Phase.Functions
      const proc = parseProcedure(state, declaredNames, options, parseEnvironment)
      procedures.push(proc)
      continue
    }

    // Si encontramos otro token inesperado, lanzar error
    throw state.parserError(ERR_INVALID_AMBIENTE_DECLARATION)
  }

  return { type: 'EnvironmentBlock', constants, variables, functions, procedures }
}

function registerDeclarationName(
  state: ParserContext,
  name: string,
  declaredNames: Set<string>,
  options?: ParseEnvironmentOptions,
): void {
  if (declaredNames.has(name)) {
    throw state.parserError(ERR_REDECLARED_IDENTIFIER(name))
  }

  if (options?.disallowShadowing) {
    if (!options.parentScopeNames) {
      throw parserError(state, state.peek(), 'Invariant: parentScopeNames requerido cuando disallowShadowing es true')
    }
    if (options.parentScopeNames.has(name)) {
      throw state.parserError(ERR_SHADOWING_NOT_ALLOWED(name))
    }
  }

  declaredNames.add(name)
}

function consumeAny(state: ParserContext, types: TokenType[], message: string) {
  for (const type of types) {
    if (state.check(type)) {
      return state.advance()
    }
  }

  throw state.parserError(message)
}
