import type { DataType } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import type { Environment } from '../environment/environment'

/**
 * Local Errors - Dynamic type validation error messages
 * These messages require interpolation with types or contexts, so they live locally
 */
const Errors = {
  INCOMPATIBLE_TYPE_AN: (contextLabel: string, maxLength: number) =>
    `Tipo incompatible en ${contextLabel}. Se esperaba AN(${maxLength}).`,
  INCOMPATIBLE_TYPE: (contextLabel: string, expectedType: DataType) =>
    `Tipo incompatible en ${contextLabel}. Se esperaba ${expectedType}.`,
} as const

export function resolveValueType(value: unknown): string {
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

export function resolveSwitchValueType(value: unknown): 'number' | 'string' | 'boolean' {
  if (typeof value === 'number') return 'number'
  if (typeof value === 'string') return 'string'
  if (typeof value === 'boolean') return 'boolean'
  throw new RuntimeError(ERROR_MESSAGES.SWITCH_UNSUPPORTED_TYPE)
}

/**
 * Type validation and assertion logic
 * Ensures values match expected types at runtime
 */
export class TypeValidator {
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
      throw new RuntimeError(Errors.INCOMPATIBLE_TYPE_AN(contextLabel, expectedType.maxLength))
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

    throw new RuntimeError(Errors.INCOMPATIBLE_TYPE(contextLabel, expectedType))
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
    const caseType = resolveSwitchValueType(caseValue)

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
}
