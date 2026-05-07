import { RuntimeError } from '../../errors'
import { ERROR_MESSAGES } from '../constants/errorMessages'

/**
 * Type resolution and rules
 * Determines types of values and applies type rules
 */
export class TypeRules {
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

  public resolveSwitchValueType(value: unknown): 'number' | 'string' | 'boolean' {
    if (typeof value === 'number') return 'number'
    if (typeof value === 'string') return 'string'
    if (typeof value === 'boolean') return 'boolean'
    throw new RuntimeError(ERROR_MESSAGES.SWITCH_UNSUPPORTED_TYPE)
  }
}
