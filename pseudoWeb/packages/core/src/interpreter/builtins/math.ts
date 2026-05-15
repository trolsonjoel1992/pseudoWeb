import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors.js'
import { buildMessage } from '../../constants/errorMessages.js'
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
        throw new RuntimeError({
          code: ErrorCode.RUN_INVALID_ARGUMENT,
          message: Errors.REDOND_INVALID_ARGS(),
          module: 'interpreter',
        })
      }
      const value = args[0]
      if (typeof value !== 'number' || !Number.isFinite(value)) {
        throw new RuntimeError({
          code: ErrorCode.RUN_TYPE_MISMATCH,
          message: Errors.REDOND_INVALID_TYPE(),
          module: 'interpreter',
          context: { value },
        })
      }
      return Math.round(value)
    },
  }
}
