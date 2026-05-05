import { RuntimeError } from '../../errors'

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
    throw new RuntimeError(`No se puede usar un valor nulo en ${operation}.`)
  }
}

export function toNumber(value: unknown): number {
  if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
    throw new RuntimeError(`No se puede convertir a número: ${String(value)}`)
  }

  return value
}

export function toComparable(value: unknown): string | number {
  if (typeof value === 'number') {
    return value
  }

  throw new RuntimeError(`No se puede comparar un valor no numérico: ${String(value)}`)
}
