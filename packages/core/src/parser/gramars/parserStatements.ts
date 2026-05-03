import type {
  ActionNode,
  AssignmentNode,
  ConstantDeclarationNode,
  DataType,
  EnvironmentBlockNode,
  ExpressionNode,
  ForNode,
  FunctionDeclarationNode,
  IfNode,
  LiteralValue,
  ParameterNode,
  ProcedureDeclarationNode,
  ReadNode,
  StatementNode,
  VariableDeclarationNode,
  WhileNode,
  WriteNode,
  SwitchNode,
  SwitchCaseNode,
  SwitchCaseCondition,
  DoWhileNode,
} from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import { ParserState } from './parserState'
import { check, checkAny, checkNext, consume, consumeAny, match, parserError, peek, previous, skipSeparators, isAtEnd, parseCommaSeparatedList } from '../utils/parserUtils'
import { parseExpression } from './parserExpressions'

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

  // Parsear proceso hasta FinAccion
  const proceso = parseBlock(state, [TokenType.FinAccion])

  // Consumir FinAccion
  consume(state, TokenType.FinAccion, "Se esperaba 'FinAccion' al final de la Accion")

  return { type: 'Action', name: actionName, ambiente, proceso, line: accionToken.line, column: accionToken.column }
}

function parseStatement(state: ParserState): StatementNode {
  if (match(state, TokenType.Si)) return parseIf(state)
  if (match(state, TokenType.Mientras)) return parseWhile(state)
  if (match(state, TokenType.Para)) return parseFor(state)
  if (match(state, TokenType.Escribir)) return parseWrite(state)
  if (match(state, TokenType.Leer)) return parseRead(state)
  if (match(state, TokenType.Segun)) return parseSegun(state)
  if (match(state, TokenType.Repetir)) return parseRepetir(state)
  if (check(state, TokenType.Identificador) && checkNext(state, TokenType.Coma, TokenType.DosPuntos)) return parseVariableDeclaration(state)
  if (check(state, TokenType.Identificador) && checkNext(state, TokenType.Asignacion)) return parseAssignment(state)
  if (check(state, TokenType.SaltoDeLinea) || check(state, TokenType.PuntoYComa)) {
    skipSeparators(state)
    return parseStatement(state)
  }

  throw parserError(state, peek(state), 'Sentencia no válida')
}

function parseVariableDeclaration(state: ParserState): VariableDeclarationNode {
  const start = peek(state)
  const variables: string[] = []
  do variables.push(consume(state, TokenType.Identificador, 'Se esperaba un identificador').lexeme)
  while (match(state, TokenType.Coma))
  consume(state, TokenType.DosPuntos, "Se esperaba ':' después de las variables")
  const dataTypeToken = consumeAny(state, [TokenType.Entero, TokenType.Real, TokenType.Alfanumerico, TokenType.Caracter, TokenType.Logico], 'Se esperaba un tipo de dato')
  const dataType = toDataType(dataTypeToken.type)
  return { type: 'VariableDeclaration', variables, dataType, line: start.line, column: start.column }
}

function parseAssignment(state: ParserState): AssignmentNode {
  const variable = consume(state, TokenType.Identificador, 'Se esperaba una variable').lexeme
  const equals = consume(state, TokenType.Asignacion, "Se esperaba ':=' en la asignación")
  return { type: 'Assignment', variable, value: parseExpression(state), line: equals.line, column: equals.column }
}

function parseWrite(state: ParserState): WriteNode {

  const token = previous(state)
  const values = parseCommaSeparatedList(state, parseExpression, true)

  return { type: 'Write', values, line: token.line, column: token.column }
}

function parseRead(state: ParserState): ReadNode {

  const token = previous(state)
  const variables = parseCommaSeparatedList(state, (s) => consume(s, TokenType.Identificador, 'Se esperaba un identificador en Leer').lexeme, true)

  return { type: 'Read', variables, line: token.line, column: token.column }
}

function parseIf(state: ParserState): IfNode {
  const token = previous(state)
  const condition = parseExpression(state)
  match(state, TokenType.Entonces)
  const thenBranch = parseBlock(state, [TokenType.SiNo, TokenType.FinSi])
  const elseBranch = match(state, TokenType.SiNo) ? parseBlock(state, [TokenType.FinSi]) : []
  consume(state, TokenType.FinSi, 'Se esperaba FinSi')
  return { type: 'If', condition, thenBranch, elseBranch, line: token.line, column: token.column }
}

function parseWhile(state: ParserState): WhileNode {
  const token = previous(state)
  const condition = parseExpression(state)
  match(state, TokenType.Hacer)
  const body = parseBlock(state, [TokenType.FinMientras])
  consume(state, TokenType.FinMientras, 'Se esperaba FinMientras')
  return { type: 'While', condition, body, line: token.line, column: token.column }
}

function parseFor(state: ParserState): ForNode {
  const token = previous(state)
  const variable = consume(state, TokenType.Identificador, 'Se esperaba el nombre del contador').lexeme
  consume(state, TokenType.Asignacion, "Se esperaba ':=' en el Para")
  const start = parseExpression(state)
  // Consumir el separador de rango ('..'), 'Hasta' o compatibilidad con 'HastaQue'
  consumeAny(state, [TokenType.Rango, TokenType.Hasta, TokenType.HastaQue], "Se esperaba '..' o Hasta en el Para")
  const end = parseExpression(state)

  let step: ExpressionNode | undefined = undefined
  if (match(state, TokenType.Coma)) {
    step = parseExpression(state)
  }

  consume(state, TokenType.Hacer, "Se esperaba 'Hacer' en el Para")
  const body = parseBlock(state, [TokenType.FinPara])
  consume(state, TokenType.FinPara, 'Se esperaba FinPara')
  return { type: 'For', variable, start, end, body, step, line: token.line, column: token.column }
}

function parseBlock(state: ParserState, stoppers: TokenType[]): StatementNode[] {
  const statements: StatementNode[] = []
  while (!isAtEnd(state) && !checkAny(state, stoppers)) {
    skipSeparators(state)
    if (isAtEnd(state) || checkAny(state, stoppers)) break
    statements.push(parseStatement(state))
  }
  skipSeparators(state)
  return statements
}

function parseEnvironment(state: ParserState): EnvironmentBlockNode {
  enum Phase { Constants = 1, Types = 2, Variables = 3, Functions = 4 }
  let phase = Phase.Constants
  const constants: ConstantDeclarationNode[] = []
  const variables: VariableDeclarationNode[] = []
  const functions: FunctionDeclarationNode[] = []
  const procedures: ProcedureDeclarationNode[] = []

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
      consume(state, TokenType.Igual, "Se esperaba '='")
      const valueToken = consumeAny(state, [TokenType.Entero, TokenType.Real, TokenType.Caracter, TokenType.Alfanumerico, TokenType.Verdadero, TokenType.Falso], 'Se esperaba un literal al declarar una constante')
      const value = valueToken.literal as LiteralValue
      constants.push({ type: 'ConstantDeclaration', name, value, dataType: toDataType(valueToken.type), line: start.line, column: start.column })
      continue
    }

    // Variable declaration: Identificador (,) ':' Tipo
    if (check(state, TokenType.Identificador) && checkNext(state, TokenType.Coma, TokenType.DosPuntos)) {
      phase = Math.max(phase, Phase.Variables)
      variables.push(parseVariableDeclaration(state))
      continue
    }

    // Funcion / Procedimiento
    if (match(state, TokenType.Funcion)) {
      phase = Phase.Functions
      functions.push(parseFunction(state))
      continue
    }

    if (match(state, TokenType.Procedimiento)) {
      phase = Phase.Functions
      procedures.push(parseProcedure(state))
      continue
    }

    // Si encontramos otro token inesperado, lanzar error
    throw parserError(state, peek(state), 'Declaración no válida en Ambiente')
  }

  return { type: 'EnvironmentBlock', constants, variables, functions, procedures }
}

function parseFunction(state: ParserState): FunctionDeclarationNode {
  return parseCallable(state, 'Function') as FunctionDeclarationNode
}

function parseProcedure(state: ParserState): ProcedureDeclarationNode {
  return parseCallable(state, 'Procedure') as ProcedureDeclarationNode
}

function parseParameterList(state: ParserState): ParameterNode[] {
  // Consume '(' already expected by callers in original code; keep same messages
  consume(state, TokenType.ParentesisIzquierdo, "Se esperaba '(' después del nombre de la función")
  const parameters: ParameterNode[] = []
  if (!check(state, TokenType.ParentesisDerecho)) {
    do {
      const paramStart = peek(state)
      const paramName = consume(state, TokenType.Identificador, 'Se esperaba nombre de parámetro').lexeme
      consume(state, TokenType.DosPuntos, "Se esperaba ':' al declarar parámetro")
      const paramType = consumeAny(state, [TokenType.Entero, TokenType.Real, TokenType.Caracter, TokenType.Logico, TokenType.Alfanumerico], 'Se esperaba tipo de parámetro')
      parameters.push({
        type: 'Parameter',
        name: paramName,
        dataType: toDataType(paramType.type),
        byReference: false,
        line: paramStart.line,
        column: paramStart.column,
      })
    } while (match(state, TokenType.Coma))
  }
  consume(state, TokenType.ParentesisDerecho, "Se esperaba ')' después de parámetros")
  return parameters
}

function parseCallable(state: ParserState, kind: 'Function' | 'Procedure'): FunctionDeclarationNode | ProcedureDeclarationNode {
  const start = peek(state)
  const name = consume(state, TokenType.Identificador, kind === 'Function' ? 'Se esperaba nombre de función' : 'Se esperaba nombre de procedimiento').lexeme

  // Parsear parámetros usando la nueva función
  const parameters = parseParameterList(state)

  let returnType: DataType | undefined = undefined
  if (kind === 'Function') {
    // Parsear tipo de retorno
    consume(state, TokenType.DosPuntos, "Se esperaba ':' antes del tipo de retorno")
    const returnTypeToken = consumeAny(state, [TokenType.Entero, TokenType.Real, TokenType.Caracter, TokenType.Logico, TokenType.Alfanumerico], 'Se esperaba tipo de retorno')
    returnType = toDataType(returnTypeToken.type)
  }

  // Parsear bloque opcional de Ambiente
  skipSeparators(state)
  let ambiente: EnvironmentBlockNode | undefined
  if (match(state, TokenType.Ambiente)) {
    ambiente = { type: 'EnvironmentBlock', constants: [], variables: [], functions: [], procedures: [] }
    skipSeparators(state)
  }

  // Parsear Proceso
  if (!match(state, TokenType.Proceso)) {
    throw parserError(state, peek(state), kind === 'Function' ? "Se esperaba 'Proceso' en la función" : "Se esperaba 'Proceso' en el procedimiento")
  }
  const proceso = parseBlock(state, [kind === 'Function' ? TokenType.FinFuncion : TokenType.FinProcedimiento])

  // Consumir FinFuncion/FinProcedimiento
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

function toDataType(type: TokenType): DataType {
  switch (type) {
    case TokenType.Entero:
      return 'Entero'
    case TokenType.Real:
      return 'Real'
    case TokenType.Caracter:
      return 'Caracter'
    case TokenType.Logico:
      return 'Logico'
    case TokenType.Alfanumerico:
      return 'Alfanumerico'
    default:
      throw parserError({ tokens: [
        { type, lexeme: type, literal: null, line: 0, column: 0 },
      ], current: 0 }, { type, lexeme: type, literal: null, line: 0, column: 0 }, 'Se esperaba un tipo de dato')
  }
}

function parseSegun(state: ParserState): SwitchNode {
  const token = previous(state)
  const expression = parseExpression(state)
  match(state, TokenType.Hacer)
  skipSeparators(state)

  const cases: SwitchCaseNode[] = []

  while (!isAtEnd(state) && !check(state, TokenType.FinSegun)) {
    skipSeparators(state)
    if (isAtEnd(state) || check(state, TokenType.FinSegun)) break

    const condition = parseSegunCaseCondition(state)
    consume(state, TokenType.DosPuntos, "Se esperaba ':' después del valor o rango en Segun")

    const body: StatementNode[] = []
    while (!isAtEnd(state) && !check(state, TokenType.FinSegun) && !isSegunCaseHeaderStart(state)) {
      skipSeparators(state)
      if (isAtEnd(state) || check(state, TokenType.FinSegun) || isSegunCaseHeaderStart(state)) break
      body.push(parseStatement(state))
    }
    cases.push({ type: 'SwitchCase', condition, body, line: token.line, column: token.column })
  }

  consume(state, TokenType.FinSegun, "Se esperaba 'FinSegun'")
  return { type: 'Switch', expression, cases, line: token.line, column: token.column }
}

function parseSegunCaseCondition(state: ParserState): SwitchCaseCondition {
  if (match(state, TokenType.Otro)) {
    return { type: 'Default' }
  }

  if (match(state, TokenType.Mayor)) {
    return { type: 'Comparison', operator: 'Mayor', value: parseExpression(state) }
  }

  if (match(state, TokenType.Menor)) {
    return { type: 'Comparison', operator: 'Menor', value: parseExpression(state) }
  }

  if (match(state, TokenType.MayorIgual)) {
    return { type: 'Comparison', operator: 'MayorIgual', value: parseExpression(state) }
  }

  if (match(state, TokenType.MenorIgual)) {
    return { type: 'Comparison', operator: 'MenorIgual', value: parseExpression(state) }
  }

  return { type: 'ExactMatch', value: parseExpression(state) }
}

function isSegunCaseHeaderStart(state: ParserState): boolean {
  if (check(state, TokenType.Otro)) return true
  if (checkAny(state, [TokenType.Mayor, TokenType.Menor, TokenType.MayorIgual, TokenType.MenorIgual])) return true

  if (checkAny(state, [TokenType.Entero, TokenType.Real, TokenType.Caracter, TokenType.Alfanumerico, TokenType.Verdadero, TokenType.Falso, TokenType.Identificador, TokenType.ParentesisIzquierdo])) {
    if (state.current + 1 < state.tokens.length) {
      return state.tokens[state.current + 1].type === TokenType.DosPuntos
    }
  }

  return false
}

function parseRepetir(state: ParserState): DoWhileNode {
  const token = previous(state)
  skipSeparators(state)

  const body = parseBlock(state, [TokenType.HastaQue])
  consume(state, TokenType.HastaQue, "Se esperaba 'HastaQue' después del bloque Repetir")
  const condition = parseExpression(state)

  return { type: 'DoWhile', body, condition, line: token.line, column: token.column }
}
