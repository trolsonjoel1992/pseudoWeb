import type { SwitchNode } from '../../parser/ast'
import { assertDefinedValue } from '../utils/valueUtils'
import type { SwitchEvaluatorContext } from '../types/evaluatorContextContracts'

export async function evaluateSwitchNode(node: SwitchNode, context: SwitchEvaluatorContext): Promise<void> {
  const expressionValue = await context.evaluateExpression(node.expression)
  assertDefinedValue(expressionValue, 'la expresión de Segun')
  const expressionType = context.typeChecker.resolveSwitchValueType(expressionValue)

  for (const switchCase of node.cases) {
    let matches = false

    switch (switchCase.condition.type) {
      case 'Default':
        matches = true
        break
      case 'ExactMatch': {
        const caseValue = await context.evaluateExpression(switchCase.condition.value)
        context.typeChecker.assertSwitchCaseCompatible(expressionType, caseValue, false)
        matches = expressionValue === caseValue
        break
      }
      case 'Comparison': {
        const caseValue = await context.evaluateExpression(switchCase.condition.value)
        context.typeChecker.assertSwitchCaseCompatible(expressionType, caseValue, true)
        const expressionNumber = context.typeChecker.assertNumberType(expressionValue, 'expresion de Segun')
        const caseNumber = context.typeChecker.assertNumberType(caseValue, 'caso de Segun')
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
      await context.evaluateBlock(switchCase.body)
      break
    }
  }
}
