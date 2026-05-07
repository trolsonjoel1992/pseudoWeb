import { RuntimeError } from '../../errors'

/**
 * Local Errors - Dynamic value handling error messages
 * These messages require interpolation with values or contexts, so they live locally
 */
const Errors = {
  NULL_VALUE_NOT_ALLOWED: (operation: string) => `No se puede usar un valor nulo en ${operation}.`,
  CANNOT_CONVERT_TO_NUMBER: (value: unknown) => `No se puede convertir a número: ${String(value)}`,
  CANNOT_COMPARE_NON_NUMERIC: (value: unknown) => `No se puede comparar un valor no numérico: ${String(value)}`,
} as const

export function stringifyValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }

  return String(value)
}

export function isTruthy(value: unknown): boolean {
  return Boolean(value)
}

export function assertDefinedValue(value: unknown, operation: string): void {
  if (value === null || value === undefined) {
    throw new RuntimeError(Errors.NULL_VALUE_NOT_ALLOWED(operation))
  }
}

export function toNumber(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new RuntimeError(Errors.CANNOT_CONVERT_TO_NUMBER(value))
  }

  return value
}

export function toComparable(value: unknown): string | number {
  if (typeof value === 'number') {
    return value
  }

  throw new RuntimeError(Errors.CANNOT_COMPARE_NON_NUMERIC(value))
}
