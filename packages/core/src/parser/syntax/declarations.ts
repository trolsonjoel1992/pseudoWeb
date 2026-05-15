import type { ParserContext } from '../state'
import type { VariableDeclarationNode, AssignmentNode, CallStatementNode, ExpressionNode } from '../ast'
import { TokenType } from '../../lexer/types'
import { parseExpression } from './expressions'
import { parseDataType } from '../types'
import { ERR_EXPECTED_IDENTIFIER, ERR_EXPECTED_COLON_AFTER_VARIABLES, ERR_EXPECTED_VARIABLE, ERR_EXPECTED_ASSIGN_OP, ERR_EXPECTED_CALL_NAME, ERR_EXPECTED_OPEN_PAREN_IN_CALL, ERR_EXPECTED_CLOSE_PAREN_IN_CALL } from '../constants'

export function parseVariableDeclaration(state: ParserContext): VariableDeclarationNode {
  const start = state.peek()
  const variables: string[] = []
  do variables.push(state.consume(TokenType.Identificador, ERR_EXPECTED_IDENTIFIER).lexeme)
  while (state.match(TokenType.Coma))
  state.consume(TokenType.DosPuntos, ERR_EXPECTED_COLON_AFTER_VARIABLES)
  const dataType = parseDataType(state)
  return { type: 'VariableDeclaration', variables, dataType, line: start.line, column: start.column }
}

export function parseAssignment(state: ParserContext): AssignmentNode {
  const variable = state.consume(TokenType.Identificador, ERR_EXPECTED_VARIABLE).lexeme
  const equals = state.consume(TokenType.Asignacion, ERR_EXPECTED_ASSIGN_OP)
  return { type: 'Assignment', variable, value: parseExpression(state), line: equals.line, column: equals.column }
}

export function parseCallStatement(state: ParserContext): CallStatementNode {
  const nameToken = state.consume(TokenType.Identificador, ERR_EXPECTED_CALL_NAME)
  state.consume(TokenType.ParentesisIzquierdo, ERR_EXPECTED_OPEN_PAREN_IN_CALL)

  const args: ExpressionNode[] = []
  if (!state.match(TokenType.ParentesisDerecho)) {
    do {
      args.push(parseExpression(state))
    } while (state.match(TokenType.Coma))
    state.consume(TokenType.ParentesisDerecho, ERR_EXPECTED_CLOSE_PAREN_IN_CALL)
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
