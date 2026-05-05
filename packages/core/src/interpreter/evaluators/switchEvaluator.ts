import type { SwitchNode } from '../../parser/ast'
import { assertDefinedValue } from '../utils/valueUtils'
import type { EvaluatorContext } from '../types/evaluatorContext'

export type SwitchEvaluatorCallbacks = Pick<EvaluatorContext, 'evaluateExpression' | 'evaluateBlock' | 'typeChecker'>

export async function evaluateSwitchNode(node: SwitchNode, callbacks: SwitchEvaluatorCallbacks): Promise<void> {
  const expressionValue = await callbacks.evaluateExpression(node.expression)
  assertDefinedValue(expressionValue, 'la expresión de Segun')
  const expressionType = callbacks.typeChecker.resolveSwitchValueType(expressionValue)

  for (const switchCase of node.cases) {
    let matches = false

    switch (switchCase.condition.type) {
      case 'Default':
        matches = true
        break
      case 'ExactMatch': {
        const caseValue = await callbacks.evaluateExpression(switchCase.condition.value)
        callbacks.typeChecker.assertSwitchCaseCompatible(expressionType, caseValue, false)
        matches = expressionValue === caseValue
        break
      }
      case 'Comparison': {
        const caseValue = await callbacks.evaluateExpression(switchCase.condition.value)
        callbacks.typeChecker.assertSwitchCaseCompatible(expressionType, caseValue, true)
        const expressionNumber = callbacks.typeChecker.assertNumberType(expressionValue, 'expresion de Segun')
        const caseNumber = callbacks.typeChecker.assertNumberType(caseValue, 'caso de Segun')
        switch (switchCase.condition.operator) {
          case 'Mayor':
            matches = expressionNumber > caseNumber
            break
          case 'Menor':
            matches = expressionNumber < caseNumber
            break
          case 'MayorIgual':
            matches = expressionNumber >= caseNumber
            break
          case 'MenorIgual':
            matches = expressionNumber <= caseNumber
            break
        }
        break
      }
    }

    if (matches) {
      await callbacks.evaluateBlock(switchCase.body)
      break
    }
  }
}
