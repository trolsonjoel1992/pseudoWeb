import type { ParserState } from './parserState'
import type { VariableDeclarationNode, AssignmentNode, CallStatementNode, ExpressionNode } from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import { consume, match } from '../utils/parserUtils'
import { parseExpression } from './parserExpressions'
import { parseDataType } from '../utils/parseDataTypeUtils'

export function parseVariableDeclaration(state: ParserState): VariableDeclarationNode {
  const start = state.tokens[state.current]
  const variables: string[] = []
  do variables.push(consume(state, TokenType.Identificador, 'Se esperaba un identificador').lexeme)
  while (match(state, TokenType.Coma))
  consume(state, TokenType.DosPuntos, "Se esperaba ':' después de las variables")
  const dataType = parseDataType(state)
  return { type: 'VariableDeclaration', variables, dataType, line: start.line, column: start.column }
}

export function parseAssignment(state: ParserState): AssignmentNode {
  const variable = consume(state, TokenType.Identificador, 'Se esperaba una variable').lexeme
  const equals = consume(state, TokenType.Asignacion, "Se esperaba ':=' en la asignación")
  return { type: 'Assignment', variable, value: parseExpression(state), line: equals.line, column: equals.column }
}

export function parseCallStatement(state: ParserState): CallStatementNode {
  const nameToken = consume(state, TokenType.Identificador, 'Se esperaba el nombre de la llamada')
  consume(state, TokenType.ParentesisIzquierdo, "Se esperaba '(' en la llamada")

  const args: ExpressionNode[] = []
  if (!match(state, TokenType.ParentesisDerecho)) {
    do {
      args.push(parseExpression(state))
    } while (match(state, TokenType.Coma))
    consume(state, TokenType.ParentesisDerecho, "Se esperaba ')' al cerrar la llamada")
  }

  return {
    type: 'CallStatement',
    call: {
      type: 'FunctionCall',
      name: nameToken.lexeme,
      arguments: args,
      line: nameToken.line,
      column: nameToken.column,
    },
    line: nameToken.line,
    column: nameToken.column,
  }
}
