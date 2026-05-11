import type { DataType } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { resolveSwitchValueType } from './typeValidator'

/**
 * Local Errors - Dynamic type coercion error messages
 * These messages require interpolation with variable names, so they live locally
 */
const Errors = {
  INCOMPATIBLE_VALUE_AN: (variableName: string, maxLength: number) =>
    `Valor incompatible para '${variableName}'. Se esperaba AN(${maxLength}).`,
  INCOMPATIBLE_VALUE: (variableName: string, expectedType: DataType | null) =>
    `Valor incompatible para '${variableName}'. Se esperaba ${expectedType ?? 'un tipo válido'}.`,
} as const

/**
 * Type coercion and input conversion
 * Converts values between types during input and assignment
 */
export class TypeCoercer {
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
      throw new RuntimeError(Errors.INCOMPATIBLE_VALUE_AN(variableName, expectedType.maxLength))
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

    throw new RuntimeError(Errors.INCOMPATIBLE_VALUE(variableName, expectedType))
  }

  public resolveSwitchValueType(value: unknown): 'number' | 'string' | 'boolean' {
    return resolveSwitchValueType(value)
  }
}
