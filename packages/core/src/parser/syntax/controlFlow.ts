import type { ParserContext } from '../state'
import type { IfNode, WhileNode, ForNode, ExpressionNode } from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import { parseExpression } from './expressions'
import { parseBlock } from './statements'
import { parseStatement } from '../orchestrator/dispatcher'
import type { SwitchNode, SwitchCaseNode, SwitchCaseCondition, DoWhileNode, StatementNode } from '../ast'
import { ERR_EXPECTED_COLON_AFTER_CASE, ERR_EXPECTED_FIN_SEGUN, ERR_EXPECTED_HASTA_QUE, ERR_EXPECTED_ENTONCES, ERR_EXPECTED_FIN_SI, ERR_EXPECTED_HACER_IN_WHILE, ERR_EXPECTED_FIN_MIENTRAS, ERR_EXPECTED_COUNTER_NAME, ERR_EXPECTED_ASSIGN_IN_FOR, ERR_EXPECTED_UNTIL_IN_FOR, ERR_EXPECTED_HACER_IN_FOR, ERR_EXPECTED_FIN_PARA } from '../constants'

function parseSwitchCaseCondition(state: ParserContext): SwitchCaseCondition {
  if (state.match(TokenType.Otro)) {
    return { type: 'Default' }
  }

  if (state.match(TokenType.Mayor)) {
    return { type: 'Comparison', operator: 'Mayor', value: parseExpression(state) }
  }

  if (state.match(TokenType.Menor)) {
    return { type: 'Comparison', operator: 'Menor', value: parseExpression(state) }
  }

  if (state.match(TokenType.MayorIgual)) {
    return { type: 'Comparison', operator: 'MayorIgual', value: parseExpression(state) }
  }

  if (state.match(TokenType.MenorIgual)) {
    return { type: 'Comparison', operator: 'MenorIgual', value: parseExpression(state) }
  }

  return { type: 'ExactMatch', value: parseExpression(state) }
}

function isSwitchCaseHeaderStart(state: ParserContext): boolean {
  if (state.check(TokenType.Otro)) return true
  if (state.checkAny([TokenType.Mayor, TokenType.Menor, TokenType.MayorIgual, TokenType.MenorIgual])) return true

  if (state.checkAny([TokenType.Entero, TokenType.Real, TokenType.Caracter, TokenType.Alfanumerico, TokenType.Verdadero, TokenType.Falso, TokenType.Identificador, TokenType.ParentesisIzquierdo])) {
    return state.peekAhead(1).type === TokenType.DosPuntos
  }

  return false
}

export function parseSwitch(state: ParserContext): SwitchNode {
  const token = state.previous()
  const expression = parseExpression(state)
  state.match(TokenType.Hacer)
  state.skipSeparators()

  const cases: SwitchCaseNode[] = []

  while (!state.isAtEnd() && !state.check(TokenType.FinSegun)) {
    state.skipSeparators()
    if (state.isAtEnd() || state.check(TokenType.FinSegun)) break

    const condition = parseSwitchCaseCondition(state)
    state.consume(TokenType.DosPuntos, ERR_EXPECTED_COLON_AFTER_CASE)

    const body: StatementNode[] = []
    while (!state.isAtEnd() && !state.check(TokenType.FinSegun) && !isSwitchCaseHeaderStart(state)) {
      state.skipSeparators()
      if (state.isAtEnd() || state.check(TokenType.FinSegun) || isSwitchCaseHeaderStart(state)) break
      body.push(parseStatement(state))
    }
    cases.push({ type: 'SwitchCase', condition, body, line: token.line, column: token.column })
  }

  state.consume(TokenType.FinSegun, ERR_EXPECTED_FIN_SEGUN)
  return { type: 'Switch', expression, cases, line: token.line, column: token.column }
}

export function parseDoWhile(state: ParserContext): DoWhileNode {
  const token = state.previous()
  state.skipSeparators()

  const body = parseBlock(state, [TokenType.HastaQue])
  state.consume(TokenType.HastaQue, ERR_EXPECTED_HASTA_QUE)
  const condition = parseExpression(state)

  return { type: 'DoWhile', body, condition, line: token.line, column: token.column }
}

export function parseIf(state: ParserContext): IfNode {
  const token = state.previous()
  const condition = parseExpression(state)
  state.consume(TokenType.Entonces, ERR_EXPECTED_ENTONCES)
  const thenBranch = parseBlock(state, [TokenType.SiNo, TokenType.FinSi])
  const elseBranch = state.match(TokenType.SiNo) ? parseBlock(state, [TokenType.FinSi]) : []
  state.consume(TokenType.FinSi, ERR_EXPECTED_FIN_SI)
  return { type: 'If', condition, thenBranch, elseBranch, line: token.line, column: token.column }
}

export function parseWhile(state: ParserContext): WhileNode {
  const token = state.previous()
  const condition = parseExpression(state)
  state.consume(TokenType.Hacer, ERR_EXPECTED_HACER_IN_WHILE)
  const body = parseBlock(state, [TokenType.FinMientras])
  state.consume(TokenType.FinMientras, ERR_EXPECTED_FIN_MIENTRAS)
  return { type: 'While', condition, body, line: token.line, column: token.column }
}

export function parseFor(state: ParserContext): ForNode {
  const token = state.previous()
  const variable = state.consume(TokenType.Identificador, ERR_EXPECTED_COUNTER_NAME).lexeme
  state.consume(TokenType.Asignacion, ERR_EXPECTED_ASSIGN_IN_FOR)
  const start = parseExpression(state)
  // Solo aceptar 'Hasta' como separador de rango
  state.consume(TokenType.Hasta, ERR_EXPECTED_UNTIL_IN_FOR)
  const end = parseExpression(state)

  let step: ExpressionNode | undefined
  if (state.match(TokenType.Coma)) {
    step = parseExpression(state)
  }

  state.consume(TokenType.Hacer, ERR_EXPECTED_HACER_IN_FOR)
  const body = parseBlock(state, [TokenType.FinPara])
  state.consume(TokenType.FinPara, ERR_EXPECTED_FIN_PARA)
  return { type: 'For', variable, start, end, body, step, line: token.line, column: token.column }
}
