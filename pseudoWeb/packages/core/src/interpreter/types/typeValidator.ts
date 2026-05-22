import type { DataType } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors.js'
import { buildMessage } from '../../constants/errorMessages.js'
import { ERROR_MESSAGES } from '../constants/errorMessages'
import type { Environment } from '../environment/environment'

const Errors = {
  INCOMPATIBLE_TYPE_AN: (contextLabel: string, maxLength: number) =>
    `Tipo incompatible en ${contextLabel}. Se esperaba AN(${maxLength}).`,
  INCOMPATIBLE_TYPE: (contextLabel: string, expectedType: DataType) =>
    `Tipo incompatible en ${contextLabel}. Se esperaba ${expectedType}.`,
} as const

export function resolveValueType(value: unknown): string {
  // Sequence runtime representation
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { isSequence } = require('./SequenceValue') as { isSequence: (v: unknown) => boolean }
    if (isSequence(value)) return 'Secuencia'
  } catch {
    // ignore
  }

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
  throw new RuntimeError({
    code: ErrorCode.GEN_UNKNOWN,
    message: ERROR_MESSAGES.SWITCH_UNSUPPORTED_TYPE,
    module: 'interpreter',
  })
}

export class TypeValidator {
  public assertValueMatchesType(value: unknown, expectedType: DataType, contextLabel: string): void {
    // Handle AN
    if (typeof expectedType === 'object' && expectedType.kind === 'AN') {
      if (typeof value === 'string' && value.length <= expectedType.maxLength) return
      throw new RuntimeError({
        code: ErrorCode.RUN_TYPE_MISMATCH,
        message: Errors.INCOMPATIBLE_TYPE_AN(contextLabel, expectedType.maxLength),
        module: 'interpreter',
        context: { contextLabel, maxLength: expectedType.maxLength },
      })
    }

    // Handle Secuencia<T>
    if (typeof expectedType === 'object' && expectedType.kind === 'Secuencia') {
      // Lazy require to avoid circular deps
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { isSequence } = require('./SequenceValue') as { isSequence: (v: unknown) => boolean }
      if (!isSequence(value)) {
        throw new RuntimeError({
          code: ErrorCode.RUN_TYPE_MISMATCH,
          message: `Tipo incompatible en ${contextLabel}. Se esperaba Secuencia.`,
          module: 'interpreter',
          context: { contextLabel, expectedType },
        })
      }

      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { asSequence } = require('./SequenceValue') as { asSequence: (v: unknown) => any }
      const seq = asSequence(value)
      const equal = dataTypeEquals(seq.elementType, expectedType.elementType)
      if (!equal) {
        throw new RuntimeError({
          code: ErrorCode.RUN_TYPE_MISMATCH,
          message: `Tipo incompatible en ${contextLabel}. Se esperaba Secuencia de ${JSON.stringify(
            expectedType.elementType,
          )}.`,
          module: 'interpreter',
          context: { contextLabel, expectedType },
        })
      }

      return
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

    throw new RuntimeError({
      code: ErrorCode.RUN_TYPE_MISMATCH,
      message: Errors.INCOMPATIBLE_TYPE(contextLabel, expectedType),
      module: 'interpreter',
      context: { contextLabel, expectedType },
    })
  }

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
      throw new RuntimeError({
        code: ErrorCode.RUN_UNDEFINED_IDENTIFIER,
        message: ERROR_MESSAGES.VARIABLE_NOT_FOUND(variableName),
        module: 'interpreter',
        context: { variableName },
      })
    }
  }

  public assertNumberType(value: unknown, context: string = 'valor'): number {
    if (typeof value !== 'number' || Number.isNaN(value) || !Number.isFinite(value)) {
      throw new RuntimeError({
        code: ErrorCode.RUN_TYPE_MISMATCH,
        message: ERROR_MESSAGES.INVALID_NUMBER(value, context),
        module: 'interpreter',
        context: { value, context },
      })
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
        throw new RuntimeError({
          code: ErrorCode.RUN_TYPE_MISMATCH,
          message: ERROR_MESSAGES.SWITCH_COMPARISON_NUMERIC_ONLY,
          module: 'interpreter',
        })
      }
      return
    }

    if (expressionType !== caseType) {
      throw new RuntimeError({
        code: ErrorCode.RUN_TYPE_MISMATCH,
        message: ERROR_MESSAGES.SWITCH_TYPE_MISMATCH,
        module: 'interpreter',
      })
    }
  }
}

function dataTypeEquals(a: DataType, b: DataType): boolean {
  if (typeof a === 'string' && typeof b === 'string') return a === b
  if (typeof a === 'object' && typeof b === 'object') {
    if ((a as any).kind === 'AN' && (b as any).kind === 'AN') {
      return (a as any).maxLength === (b as any).maxLength
    }
    if ((a as any).kind === 'Secuencia' && (b as any).kind === 'Secuencia') {
      return dataTypeEquals((a as any).elementType, (b as any).elementType)
    }
  }
  return false
}
