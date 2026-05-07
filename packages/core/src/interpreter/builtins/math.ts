import { RuntimeError } from '../../errors'
import type { BuiltinFunction } from './registry'

/**
 * Local Errors - Dynamic builtin math error messages
 * These messages are specific to math builtin validation, so they live locally
 */
const Errors = {
  REDOND_INVALID_ARGS: () => 'REDOND requiere exactamente 1 argumento.',
  REDOND_INVALID_TYPE: () => 'REDOND solo acepta un argumento numérico.',
} as const

export function createREDOND(): BuiltinFunction {
  return {
    name: 'REDOND',
    execute: (args: unknown[]): unknown => {
      if (args.length !== 1) {
        throw new RuntimeError(Errors.REDOND_INVALID_ARGS())
      }
      const value = args[0]
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new RuntimeError(Errors.REDOND_INVALID_TYPE())
      }
      return Math.round(value)
    },
  }
}
