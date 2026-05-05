import type { DataType } from '../parser/ast'
import { RuntimeError } from '../errors'
import { ERROR_MESSAGES } from './constants/errorMessages'
import type { Environment } from './environment'

/**
 * Centralized type checking and coercion system
 * Unifies type validation logic from evaluator and ioEvaluator
 */
export class TypeChecker {
  /**
   * Validate that a value matches an expected type
   * Throws RuntimeError if type mismatch
   * @param value The value to validate
   * @param expectedType The expected DataType
   * @param contextLabel Description for error messages (e.g., "la variable 'x'")
   */
  public assertValueMatchesType(value: unknown, expectedType: DataType, contextLabel: string): void {
    if (typeof expectedType === 'object' && expectedType.kind === 'AN') {
      if (typeof value === 'string' && value.length <= expectedType.maxLength) return
      throw new RuntimeError(`Tipo incompatible en ${contextLabel}. Se esperaba AN(${expectedType.maxLength}).`)
    }

    switch (expectedType) {
      case 'Entero':
        if (typeof value === 'number' && Number.isInteger(value)) return
        break
      case 'Real':
        if (typeof value === 'number' && Number.isFinite(value)) return
        break
      case 'Caracter':
        if (typeof value === 'string' && value.length === 1) return
        break
      case 'Alfanumerico':
        if (typeof value === 'string') return
        break
      case 'Logico':
        if (typeof value === 'boolean') return
        break
    }

    throw new RuntimeError(`Tipo incompatible en ${contextLabel}. Se esperaba ${expectedType}.`)
  }

  /**
   * Determine the type of a value at runtime
   * @param value The value to analyze
   * @returns The inferred DataType
   */
  public resolveValueType(value: unknown): string {
    if (typeof value === 'number') {
      return Number.isInteger(value) ? 'Entero' : 'Real'
    }
    if (typeof value === 'string') {
      return value.length === 1 ? 'Caracter' : 'Alfanumerico'
    }
    if (typeof value === 'boolean') {
      return 'Logico'
    }
    return 'unknown'
  }

  /**
   * Coerce an input value to match an expected type
   * Supports string→number parsing and boolean conversion
   * @param variableName Name of the variable (for error messages)
   * @param inputValue The input value to coerce
   * @param expectedType The target type
   * @returns The coerced value, or the original if already correct
   * @throws RuntimeError if coercion fails
   */
  public coerceInputValue(variableName: string, inputValue: unknown, expectedType: DataType | null): unknown {
    if (inputValue === null || expectedType === null) {
      return inputValue
    }

    if (typeof expectedType === 'object' && expectedType.kind === 'AN') {
      if (typeof inputValue === 'string' && inputValue.length <= expectedType.maxLength) return inputValue
      throw new RuntimeError(`Valor incompatible para '${variableName}'. Se esperaba AN(${expectedType.maxLength}).`)
    }

    switch (expectedType) {
      case 'Entero':
        if (typeof inputValue === 'number' && Number.isInteger(inputValue)) return inputValue
        if (typeof inputValue === 'string' && /^-?\d+$/.test(inputValue.trim())) return Number.parseInt(inputValue, 10)
        break
      case 'Real':
        if (typeof inputValue === 'number' && Number.isFinite(inputValue)) return inputValue
        if (typeof inputValue === 'string' && /^-?(?:\d+\.\d+|\d+|\.\d+)$/.test(inputValue.trim())) return Number.parseFloat(inputValue)
        break
      case 'Caracter':
        if (typeof inputValue === 'string' && inputValue.length === 1) return inputValue
        break
      case 'Alfanumerico':
        if (typeof inputValue === 'string') return inputValue
        break
      case 'Logico':
        if (typeof inputValue === 'boolean') return inputValue
        if (typeof inputValue === 'string') {
          const normalized = inputValue.trim().toLowerCase()
          if (normalized === 'verdadero' || normalized === 'true') return true
          if (normalized === 'falso' || normalized === 'false') return false
        }
        break
    }

    throw new RuntimeError(`Valor incompatible para '${variableName}'. Se esperaba ${expectedType ?? 'un tipo válido'}.`)
  }

  /**
   * Check if a value can be safely assigned to a variable of expected type
   * Used for type validation in assignments and comparisons
   * @param value The value being assigned
   * @param expectedType The receiving type
   * @returns true if assignment is safe, false otherwise
   */
  public canAssign(value: unknown, expectedType: DataType): boolean {
    try {
      this.assertValueMatchesType(value, expectedType, 'assignment')
      return true
    } catch {
      return false
    }
  }

  public assertVariableExists(variableName: string, environment: Environment): void {
    if (!environment.has(variableName)) {
      throw new RuntimeError(ERROR_MESSAGES.VARIABLE_NOT_FOUND(variableName))
    }
  }

  public assertNumberType(value: unknown, context: string = 'valor'): number {
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
      throw new RuntimeError(ERROR_MESSAGES.INVALID_NUMBER(value, context))
    }

    return value
  }

  public assertSwitchCaseCompatible(
    expressionType: 'number' | 'string' | 'boolean',
    caseValue: unknown,
    isComparison: boolean,
  ): void {
    const caseType = this.resolveSwitchValueType(caseValue)

    if (isComparison) {
      if (expressionType !== 'number' || caseType !== 'number') {
        throw new RuntimeError(ERROR_MESSAGES.SWITCH_COMPARISON_NUMERIC_ONLY)
      }
      return
    }

    if (expressionType !== caseType) {
      throw new RuntimeError(ERROR_MESSAGES.SWITCH_TYPE_MISMATCH)
    }
  }

  public resolveSwitchValueType(value: unknown): 'number' | 'string' | 'boolean' {
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'boolean') return 'boolean'
    throw new RuntimeError(ERROR_MESSAGES.SWITCH_UNSUPPORTED_TYPE)
  }
}
