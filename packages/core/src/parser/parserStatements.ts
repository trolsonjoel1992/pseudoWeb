import { Ast } from './ast'
import { TokenType } from '../lexer/tokenTypes'
import { ParserState } from './parserState'
import { check, checkAny, checkNext, consume, consumeAny, match, parserError, peek, previous, skipSeparators, isAtEnd, parseCommaSeparatedList } from './parserUtils'
import { parseExpression } from './parserExpressions'

export function parseProgram(state: ParserState): Ast.StatementNode[] {
  const statements: Ast.StatementNode[] = []

  while (!isAtEnd(state)) {
    skipSeparators(state)
    if (isAtEnd(state)) break
    if (match(state, TokenType.Accion) || match(state, TokenType.FinAccion)) continue
    statements.push(parseStatement(state))
  }

  return statements
}

function parseStatement(state: ParserState): Ast.StatementNode {
  if (match(state, TokenType.Si)) return parseIf(state)
  if (match(state, TokenType.Mientras)) return parseWhile(state)
  if (match(state, TokenType.Para)) return parseFor(state)
  if (match(state, TokenType.Escribir)) return parseWrite(state)
  if (match(state, TokenType.Leer)) return parseRead(state)
  if (check(state, TokenType.Identificador) && checkNext(state, TokenType.Coma, TokenType.DosPuntos)) return parseVariableDeclaration(state)
  if (check(state, TokenType.Identificador) && checkNext(state, TokenType.Asignacion)) return parseAssignment(state)
  if (check(state, TokenType.SaltoDeLinea) || check(state, TokenType.PuntoYComa)) {
    skipSeparators(state)
    return parseStatement(state)
  }

  throw parserError(state, peek(state), 'Sentencia no válida')
}

function parseVariableDeclaration(state: ParserState): Ast.VariableDeclarationNode {
  const start = peek(state)
  const variables: string[] = []
  do variables.push(consume(state, TokenType.Identificador, 'Se esperaba un identificador').lexeme)
  while (match(state, TokenType.Coma))
  consume(state, TokenType.DosPuntos, "Se esperaba ':' después de las variables")
  const dataTypeToken = consumeAny(state, [TokenType.Entero, TokenType.Real, TokenType.Alfanumerico, TokenType.Caracter], 'Se esperaba un tipo de dato')
  const dataType = toDataType(dataTypeToken.type)
  return { type: 'VariableDeclaration', variables, dataType, line: start.line, column: start.column }
}

function parseAssignment(state: ParserState): Ast.AssignmentNode {
  const variable = consume(state, TokenType.Identificador, 'Se esperaba una variable').lexeme
  const equals = consume(state, TokenType.Asignacion, "Se esperaba ':=' en la asignación")
  return { type: 'Assignment', variable, value: parseExpression(state), line: equals.line, column: equals.column }
}

function parseWrite(state: ParserState): Ast.WriteNode {

  const token = previous(state)
  const values = parseCommaSeparatedList(state, parseExpression, true)

  return { type: 'Write', values, line: token.line, column: token.column }
}

function parseRead(state: ParserState): Ast.ReadNode {

  const token = previous(state)
  const variables = parseCommaSeparatedList(state, (s) => consume(s, TokenType.Identificador, 'Se esperaba un identificador en Leer').lexeme, true)

  return { type: 'Read', variables, line: token.line, column: token.column }
}

function parseIf(state: ParserState): Ast.IfNode {
  const token = previous(state)
  const condition = parseExpression(state)
  match(state, TokenType.Entonces)
  const thenBranch = parseBlock(state, [TokenType.SiNo, TokenType.FinSi])
  const elseBranch = match(state, TokenType.SiNo) ? parseBlock(state, [TokenType.FinSi]) : []
  consume(state, TokenType.FinSi, 'Se esperaba FinSi')
  return { type: 'If', condition, thenBranch, elseBranch, line: token.line, column: token.column }
}

function parseWhile(state: ParserState): Ast.WhileNode {
  const token = previous(state)
  const condition = parseExpression(state)
  match(state, TokenType.Hacer)
  const body = parseBlock(state, [TokenType.FinMientras])
  consume(state, TokenType.FinMientras, 'Se esperaba FinMientras')
  return { type: 'While', condition, body, line: token.line, column: token.column }
}

function parseFor(state: ParserState): Ast.ForNode {
  const token = previous(state)
  const variable = consume(state, TokenType.Identificador, 'Se esperaba el nombre del contador').lexeme
  consume(state, TokenType.Asignacion, "Se esperaba ':=' en el Para")
  const start = parseExpression(state)
  // Consumir el separador de rango ('..'), 'Hasta' o compatibilidad con 'HastaQue'
  consumeAny(state, [TokenType.Rango, TokenType.Hasta, TokenType.HastaQue], "Se esperaba '..' o Hasta en el Para")
  const end = parseExpression(state)

  let step: Ast.ExpressionNode | undefined = undefined
  if (match(state, TokenType.Coma)) {
    step = parseExpression(state)
  }

  consume(state, TokenType.Hacer, "Se esperaba 'Hacer' en el Para")
  const body = parseBlock(state, [TokenType.FinPara])
  consume(state, TokenType.FinPara, 'Se esperaba FinPara')
  return { type: 'For', variable, start, end, body, step, line: token.line, column: token.column }
}

function parseBlock(state: ParserState, stoppers: TokenType[]): Ast.StatementNode[] {
  const statements: Ast.StatementNode[] = []
  while (!isAtEnd(state) && !checkAny(state, stoppers)) {
    skipSeparators(state)
    if (isAtEnd(state) || checkAny(state, stoppers)) break
    statements.push(parseStatement(state))
  }
  skipSeparators(state)
  return statements
}

function toDataType(type: TokenType): Ast.DataType {
  switch (type) {
    case TokenType.Entero:
      return 'Entero'
    case TokenType.Real:
      return 'Real'
    case TokenType.Caracter:
      return 'Caracter'
    case TokenType.Alfanumerico:
      return 'Alfanumerico'
    default:
      throw parserError({ tokens: [
        { type, lexeme: type, literal: null, line: 0, column: 0 },
      ], current: 0 }, { type, lexeme: type, literal: null, line: 0, column: 0 }, 'Se esperaba un tipo de dato')
  }
}
