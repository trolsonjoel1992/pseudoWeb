import type {
  FunctionDeclarationNode,
  ProcedureDeclarationNode,
  ParameterNode,
  EnvironmentBlockNode,
  StatementNode,
  DataType,
} from '../ast'
import { EMPTY_ENVIRONMENT_BLOCK } from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import type { ParserContext } from '../state'
import { parseDataType } from '../types'
import { parseStatement } from '../orchestrator/dispatcher'
import { parserError } from '../utils/tokens'
import { ERR_EXPECTED_FUNCTION_NAME, ERR_EXPECTED_PROCEDURE_NAME, ERR_EXPECTED_OPEN_PAREN_AFTER_FUNCTION, ERR_EXPECTED_PARAMETER_NAME, ERR_EXPECTED_COLON_IN_PARAMETER, ERR_EXPECTED_CLOSE_PAREN_AFTER_PARAMS, ERR_EXPECTED_COLON_BEFORE_RETURN_TYPE, ERR_EXPECTED_PROCESO_IN_FUNCTION, ERR_EXPECTED_PROCESO_IN_PROCEDURE, ERR_EXPECTED_FIN_FUNCTION, ERR_EXPECTED_FIN_PROCEDURE, ERR_REDECLARED_IDENTIFIER, ERR_SHADOWING_NOT_ALLOWED } from '../constants'

export type ParseEnvironmentOptions =
  | { disallowShadowing?: false; parentScopeNames?: Set<string> }
  | { disallowShadowing: true; parentScopeNames: Set<string> }

export function parseParameterList(
  state: ParserContext,
  localScopeNames: Set<string>,
  parentScopeNames?: Set<string>,
): ParameterNode[] {
  state.consume(TokenType.ParentesisIzquierdo, ERR_EXPECTED_OPEN_PAREN_AFTER_FUNCTION)
  const parameters: ParameterNode[] = []
  if (!state.check(TokenType.ParentesisDerecho)) {
    do {
      const paramStart = state.peek()
      const paramName = state.consume(TokenType.Identificador, ERR_EXPECTED_PARAMETER_NAME).lexeme
      if (localScopeNames.has(paramName)) {
        throw state.parserError(ERR_REDECLARED_IDENTIFIER(paramName))
      }
      if (parentScopeNames?.has(paramName)) {
        throw state.parserError(ERR_SHADOWING_NOT_ALLOWED(paramName))
      }
      localScopeNames.add(paramName)
      state.consume(TokenType.DosPuntos, ERR_EXPECTED_COLON_IN_PARAMETER)
      const paramType = parseDataType(state)
      parameters.push({
        type: 'Parameter',
        name: paramName,
        dataType: paramType,
        byReference: false,
        line: paramStart.line,
        column: paramStart.column,
      })
    } while (state.match(TokenType.Coma))
  }
  state.consume(TokenType.ParentesisDerecho, ERR_EXPECTED_CLOSE_PAREN_AFTER_PARAMS)
  return parameters
}

export function parseCallable(
  state: ParserContext,
  kind: 'Function' | 'Procedure',
  declaredNames: Set<string>,
  options?: ParseEnvironmentOptions,
  parseEnvFn?: (state: ParserContext, options?: ParseEnvironmentOptions) => EnvironmentBlockNode,
): FunctionDeclarationNode | ProcedureDeclarationNode {
  const start = state.peek()
  const name = state.consume(TokenType.Identificador, kind === 'Function' ? ERR_EXPECTED_FUNCTION_NAME : ERR_EXPECTED_PROCEDURE_NAME).lexeme

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

  const callableLocalNames = new Set<string>()
  callableLocalNames.add(name)

  const parameters = parseParameterList(state, callableLocalNames, options?.parentScopeNames)

  let returnType: DataType | undefined = undefined
  if (kind === 'Function') {
    state.consume(TokenType.DosPuntos, ERR_EXPECTED_COLON_BEFORE_RETURN_TYPE)
    returnType = parseDataType(state)
  }

  // — Discriminación simple/complejo —
  state.skipSeparators()

  let ambiente: EnvironmentBlockNode
  const finToken = kind === 'Function' ? TokenType.FinFuncion : TokenType.FinProcedimiento

  const isComplexForm = state.check(TokenType.Ambiente) || state.check(TokenType.Proceso)
  if (isComplexForm) {
    // FORMA COMPLEJA
    if (!parseEnvFn) {
      throw state.parserError('Internal: parseEnvironment not injected')
    }
    const outerNames = new Set<string>([
      ...(options?.parentScopeNames ?? new Set<string>()),
      ...declaredNames,
    ])
    const envOptions: ParseEnvironmentOptions = {
      parentScopeNames: new Set([...outerNames, ...callableLocalNames]),
      disallowShadowing: true,
    }
    ambiente = parseOptionalEnvironment(state, envOptions, callableLocalNames, parseEnvFn)

    state.skipSeparators()
    if (!state.match(TokenType.Proceso)) {
      throw state.parserError(kind === 'Function' ? ERR_EXPECTED_PROCESO_IN_FUNCTION : ERR_EXPECTED_PROCESO_IN_PROCEDURE)
    }
    const proceso: StatementNode[] = []
    while (!state.isAtEnd() && !state.check(finToken)) {
      state.skipSeparators()
      if (state.isAtEnd() || state.check(finToken)) break
      if (state.checkAny([TokenType.Proceso, TokenType.FinAccion])) {
        throw state.parserError(kind === 'Function' ? ERR_EXPECTED_FIN_FUNCTION : ERR_EXPECTED_FIN_PROCEDURE)
      }
      proceso.push(parseStatement(state))
    }

    state.skipSeparators()
    state.consume(finToken, kind === 'Function' ? ERR_EXPECTED_FIN_FUNCTION : ERR_EXPECTED_FIN_PROCEDURE)

    return kind === 'Function'
      ? {
          type: 'FunctionDeclaration',
          name,
          parameters,
          returnType: returnType as DataType,
          ambiente,
          proceso,
          line: start.line,
          column: start.column,
        }
      : {
          type: 'ProcedureDeclaration',
          name,
          parameters,
          ambiente,
          proceso,
          line: start.line,
          column: start.column,
        }
  }

  // FORMA SIMPLE
  ambiente = EMPTY_ENVIRONMENT_BLOCK
  const procesoSimple: StatementNode[] = []
  while (!state.isAtEnd() && !state.check(finToken)) {
    state.skipSeparators()
    if (state.isAtEnd() || state.check(finToken)) break
    if (state.checkAny([TokenType.Proceso, TokenType.FinAccion])) {
      throw state.parserError(kind === 'Function' ? ERR_EXPECTED_FIN_FUNCTION : ERR_EXPECTED_FIN_PROCEDURE)
    }
    procesoSimple.push(parseStatement(state))
  }

  state.skipSeparators()
  state.consume(finToken, kind === 'Function' ? ERR_EXPECTED_FIN_FUNCTION : ERR_EXPECTED_FIN_PROCEDURE)

  return kind === 'Function'
    ? {
        type: 'FunctionDeclaration',
        name,
        parameters,
        returnType: returnType as DataType,
        ambiente,
        proceso: procesoSimple,
        line: start.line,
        column: start.column,
      }
    : {
        type: 'ProcedureDeclaration',
        name,
        parameters,
        ambiente,
        proceso: procesoSimple,
        line: start.line,
        column: start.column,
      }
}

export function parseOptionalEnvironment(
  state: ParserContext,
  options: ParseEnvironmentOptions | undefined,
  localNames: Set<string>,
  parseEnvFn?: (state: ParserContext, options?: ParseEnvironmentOptions) => EnvironmentBlockNode,
): EnvironmentBlockNode {
  state.skipSeparators()
  if (state.match(TokenType.Ambiente)) {
    if (!parseEnvFn) {
      throw state.parserError('Internal: parseEnvironment not injected')
    }
    return parseEnvFn(state, options)
  }
  return EMPTY_ENVIRONMENT_BLOCK
}

export function parseFunction(state: ParserContext, declaredNames: Set<string>, options?: ParseEnvironmentOptions, parseEnvFn?: (state: ParserContext, options?: ParseEnvironmentOptions) => EnvironmentBlockNode): FunctionDeclarationNode {
  return parseCallable(state, 'Function', declaredNames, options, parseEnvFn) as FunctionDeclarationNode
}

export function parseProcedure(state: ParserContext, declaredNames: Set<string>, options?: ParseEnvironmentOptions, parseEnvFn?: (state: ParserContext, options?: ParseEnvironmentOptions) => EnvironmentBlockNode): ProcedureDeclarationNode {
  return parseCallable(state, 'Procedure', declaredNames, options, parseEnvFn) as ProcedureDeclarationNode
}
