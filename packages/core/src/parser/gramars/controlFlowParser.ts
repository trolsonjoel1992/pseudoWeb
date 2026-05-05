import type { ParserState } from './parserState'
import type { IfNode, WhileNode, ForNode, ExpressionNode } from '../ast'
import { TokenType } from '../../lexer/tokenTypes'
import { parseExpression } from './parserExpressions'
import { consume, match, previous, skipSeparators, isAtEnd, checkAny, check } from '../utils/parserUtils'
import { parseBlock } from './parserStatements'
import { parseStatement } from './statementDispatcher'
import type { SwitchNode, SwitchCaseNode, SwitchCaseCondition, DoWhileNode, StatementNode } from '../ast'

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

export function parseSegun(state: ParserState): SwitchNode {
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

export function parseRepetir(state: ParserState): DoWhileNode {
  const token = previous(state)
  skipSeparators(state)

  const body = parseBlock(state, [TokenType.HastaQue])
  consume(state, TokenType.HastaQue, "Se esperaba 'HastaQue' después del bloque Repetir")
  const condition = parseExpression(state)

  return { type: 'DoWhile', body, condition, line: token.line, column: token.column }
}

export function parseIf(state: ParserState): IfNode {
  const token = previous(state)
  const condition = parseExpression(state)
  consume(state, TokenType.Entonces, "Se esperaba 'Entonces' tras la condición Si")
  const thenBranch = parseBlock(state, [TokenType.SiNo, TokenType.FinSi])
  const elseBranch = match(state, TokenType.SiNo) ? parseBlock(state, [TokenType.FinSi]) : []
  consume(state, TokenType.FinSi, 'Se esperaba FinSi')
  return { type: 'If', condition, thenBranch, elseBranch, line: token.line, column: token.column }
}

export function parseWhile(state: ParserState): WhileNode {
  const token = previous(state)
  const condition = parseExpression(state)
  consume(state, TokenType.Hacer, "Se esperaba 'Hacer' en Mientras")
  const body = parseBlock(state, [TokenType.FinMientras])
  consume(state, TokenType.FinMientras, 'Se esperaba FinMientras')
  return { type: 'While', condition, body, line: token.line, column: token.column }
}

export function parseFor(state: ParserState): ForNode {
  const token = previous(state)
  const variable = consume(state, TokenType.Identificador, 'Se esperaba el nombre del contador').lexeme
  consume(state, TokenType.Asignacion, "Se esperaba ':=' en el Para")
  const start = parseExpression(state)
  // Solo aceptar 'Hasta' como separador de rango
  consume(state, TokenType.Hasta, "Se esperaba 'Hasta' en el Para")
  const end = parseExpression(state)

  let step: ExpressionNode | undefined
  if (match(state, TokenType.Coma)) {
    step = parseExpression(state)
  }

  consume(state, TokenType.Hacer, "Se esperaba 'Hacer' en el Para")
  const body = parseBlock(state, [TokenType.FinPara])
  consume(state, TokenType.FinPara, 'Se esperaba FinPara')
  return { type: 'For', variable, start, end, body, step, line: token.line, column: token.column }
}
