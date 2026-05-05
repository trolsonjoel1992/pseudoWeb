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
import { TokenType } from '../../lexer/tokenTypes'
import { ParserState } from './parserState'
import { check, checkAny, checkNext, consume, consumeAny, match, parserError, peek, previous, skipSeparators, isAtEnd } from '../utils/parserUtils'
import { parseStatement } from './statementDispatcher'
import { parseVariableDeclaration as decParseVariableDeclaration } from './declarationParser'
import { parseDataType, toDataType } from '../utils/parseDataTypeUtils'

type ParseEnvironmentOptions = {
  parentScopeNames?: Set<string>
  disallowShadowing?: boolean
}

export function parseProgram(state: ParserState): ActionNode {
  skipSeparators(state)

  // Exigir estructura: Accion <identificador> : ES
  if (!match(state, TokenType.Accion)) {
    throw parserError(state, peek(state), 'Se esperaba el encabezado "Accion <nombre> : ES"')
  }

  const accionToken = previous(state)
  const actionName = consume(state, TokenType.Identificador, 'Se esperaba un identificador para el nombre de la Accion').lexeme
  consume(state, TokenType.DosPuntos, "Se esperaba ':' después del nombre de la Accion")
  consume(state, TokenType.ES, "Se esperaba 'ES' después de ':' en el encabezado de la Accion")

  // Ambiente obligatorio
  skipSeparators(state)
  if (!match(state, TokenType.Ambiente)) {
    throw parserError(state, peek(state), 'Se esperaba el bloque "Ambiente" tras el encabezado de la Accion')
  }

  // Parsear y validar ambiente (orden estricto)
  const ambiente = parseEnvironment(state)

  // Proceso obligatorio
  skipSeparators(state)
  if (!match(state, TokenType.Proceso)) {
    throw parserError(state, peek(state), 'Se esperaba el bloque "Proceso" después de Ambiente')
  }

  // Parsear proceso hasta FinAccion (con contexto inProcess = true)
  state.inProcess = true
  const proceso = parseBlock(state, [TokenType.FinAccion])
  state.inProcess = false

  // Consumir FinAccion
  consume(state, TokenType.FinAccion, "Se esperaba 'FinAccion' al final de la Accion")

  return { type: 'Action', name: actionName, ambiente, proceso, line: accionToken.line, column: accionToken.column }
}

export function parseBlock(state: ParserState, stoppers: TokenType[]): StatementNode[] {
  const statements: StatementNode[] = []
  while (!isAtEnd(state) && !checkAny(state, stoppers)) {
    skipSeparators(state)
    if (isAtEnd(state) || checkAny(state, stoppers)) break
    statements.push(parseStatement(state))
  }
  skipSeparators(state)
  return statements
}

export function parseEnvironment(state: ParserState, options?: ParseEnvironmentOptions): EnvironmentBlockNode {
  enum Phase { Constants = 1, Variables = 2, Functions = 3 }
  let phase = Phase.Constants
  const constants: ConstantDeclarationNode[] = []
  const variables: VariableDeclarationNode[] = []
  const functions: FunctionDeclarationNode[] = []
  const procedures: ProcedureDeclarationNode[] = []
  const declaredNames = new Set<string>()

  while (!isAtEnd(state) && !check(state, TokenType.Proceso)) {
    skipSeparators(state)
    if (isAtEnd(state) || check(state, TokenType.Proceso)) break

    // Constante: Identificador '=' Literal
    if (check(state, TokenType.Identificador) && checkNext(state, TokenType.Igual)) {
      if (phase > Phase.Constants) {
        throw parserError(state, peek(state), 'Constantes deben declararse antes que las variables y funciones en Ambiente')
      }
      const start = peek(state)
      const name = consume(state, TokenType.Identificador, 'Se esperaba identificador').lexeme
      registerDeclarationName(state, name, declaredNames, options)
      consume(state, TokenType.Igual, "Se esperaba '='")
      const valueToken = consumeAny(state, [TokenType.Entero, TokenType.Real, TokenType.Caracter, TokenType.Alfanumerico, TokenType.Verdadero, TokenType.Falso], 'Se esperaba un literal al declarar una constante')
      const value = valueToken.literal as LiteralValue
      constants.push({ type: 'ConstantDeclaration', name, value, dataType: toDataType(valueToken.type), line: start.line, column: start.column })
      continue
    }

    // Variable declaration: Identificador (,) ':' Tipo
    if (check(state, TokenType.Identificador) && checkNext(state, TokenType.Coma, TokenType.DosPuntos)) {
      if (phase > Phase.Variables) {
        throw parserError(state, peek(state), 'Las variables deben declararse antes que funciones y procedimientos en Ambiente')
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
    if (match(state, TokenType.Funcion)) {
      phase = Phase.Functions
      functions.push(parseFunction(state, declaredNames, options))
      continue
    }

    if (match(state, TokenType.Procedimiento)) {
      phase = Phase.Functions
      procedures.push(parseProcedure(state, declaredNames, options))
      continue
    }

    // Si encontramos otro token inesperado, lanzar error
    throw parserError(state, peek(state), 'Declaración no válida en Ambiente')
  }

  return { type: 'EnvironmentBlock', constants, variables, functions, procedures }
}

export function parseFunction(state: ParserState, declaredNames: Set<string>, options?: ParseEnvironmentOptions): FunctionDeclarationNode {
  return parseCallable(state, 'Function', declaredNames, options) as FunctionDeclarationNode
}

export function parseProcedure(state: ParserState, declaredNames: Set<string>, options?: ParseEnvironmentOptions): ProcedureDeclarationNode {
  return parseCallable(state, 'Procedure', declaredNames, options) as ProcedureDeclarationNode
}

export function parseParameterList(
  state: ParserState,
  localScopeNames: Set<string>,
  parentScopeNames?: Set<string>,
): ParameterNode[] {
  // Consume '(' already expected by callers in original code; keep same messages
  consume(state, TokenType.ParentesisIzquierdo, "Se esperaba '(' después del nombre de la función")
  const parameters: ParameterNode[] = []
  if (!check(state, TokenType.ParentesisDerecho)) {
    do {
      const paramStart = peek(state)
      const paramName = consume(state, TokenType.Identificador, 'Se esperaba nombre de parámetro').lexeme
      if (localScopeNames.has(paramName)) {
        throw parserError(state, paramStart, `Identificador redeclarado en el mismo alcance: '${paramName}'`)
      }
      if (parentScopeNames?.has(paramName)) {
        throw parserError(state, paramStart, `No se permite shadowing: '${paramName}' ya existe en el alcance externo`)
      }
      localScopeNames.add(paramName)
      consume(state, TokenType.DosPuntos, "Se esperaba ':' al declarar parámetro")
      const paramType = parseDataType(state)
      parameters.push({
        type: 'Parameter',
        name: paramName,
        dataType: paramType,
        byReference: false,
        line: paramStart.line,
        column: paramStart.column,
      })
    } while (match(state, TokenType.Coma))
  }
  consume(state, TokenType.ParentesisDerecho, "Se esperaba ')' después de parámetros")
  return parameters
}

export function parseCallable(
  state: ParserState,
  kind: 'Function' | 'Procedure',
  declaredNames: Set<string>,
  options?: ParseEnvironmentOptions,
): FunctionDeclarationNode | ProcedureDeclarationNode {
  const start = peek(state)
  const name = consume(state, TokenType.Identificador, kind === 'Function' ? 'Se esperaba nombre de función' : 'Se esperaba nombre de procedimiento').lexeme
  registerDeclarationName(state, name, declaredNames, options)

  const callableLocalNames = new Set<string>()
  callableLocalNames.add(name)

  const parameters = parseParameterList(state, callableLocalNames, options?.parentScopeNames)

  let returnType: DataType | undefined = undefined
  if (kind === 'Function') {
    consume(state, TokenType.DosPuntos, "Se esperaba ':' antes del tipo de retorno")
    returnType = parseDataType(state)
  }

  skipSeparators(state)
  let ambiente: EnvironmentBlockNode | undefined
  if (match(state, TokenType.Ambiente)) {
    const outerNames = new Set<string>([
      ...(options?.parentScopeNames ?? new Set<string>()),
      ...declaredNames,
    ])

    ambiente = parseEnvironment(state, {
      parentScopeNames: new Set([...outerNames, ...callableLocalNames]),
      disallowShadowing: true,
    })
  }

  if (!match(state, TokenType.Proceso)) {
    throw parserError(state, peek(state), kind === 'Function' ? "Se esperaba 'Proceso' en la función" : "Se esperaba 'Proceso' en el procedimiento")
  }
  const proceso = parseBlock(state, [kind === 'Function' ? TokenType.FinFuncion : TokenType.FinProcedimiento])

  consume(state, kind === 'Function' ? TokenType.FinFuncion : TokenType.FinProcedimiento, kind === 'Function' ? "Se esperaba 'FinFuncion'" : "Se esperaba 'FinProcedimiento'")

  if (kind === 'Function') {
    return {
      type: 'FunctionDeclaration',
      name,
      parameters,
      returnType: returnType as DataType,
      ambiente: ambiente || { type: 'EnvironmentBlock', constants: [], variables: [], functions: [], procedures: [] },
      proceso,
      line: start.line,
      column: start.column,
    }
  }

  return {
    type: 'ProcedureDeclaration',
    name,
    parameters,
    ambiente,
    proceso,
    line: start.line,
    column: start.column,
  }
}

function registerDeclarationName(
  state: ParserState,
  name: string,
  declaredNames: Set<string>,
  options?: ParseEnvironmentOptions,
): void {
  if (declaredNames.has(name)) {
    throw parserError(state, peek(state), `Identificador redeclarado en el mismo alcance: '${name}'`)
  }

  if (options?.disallowShadowing && options.parentScopeNames?.has(name)) {
    throw parserError(state, peek(state), `No se permite shadowing: '${name}' ya existe en el alcance externo`)
  }

  declaredNames.add(name)
}
