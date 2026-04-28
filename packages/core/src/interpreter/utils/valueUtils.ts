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

export function toNumber(value: unknown): number {
  const numericValue = typeof value === 'number' ? value : Number(value)

  if (Number.isNaN(numericValue)) {
    throw new RuntimeError(`No se puede convertir a número: ${String(value)}`)
  }

  return numericValue
}

export function toComparable(value: unknown): string | number {
  return typeof value === 'number' ? value : String(value)
}
