import type { DataType } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors'

export interface SequenceValue {
  kind: 'Secuencia'
  elementType: DataType
  elements: unknown[]
  position: number
  mode: 'idle' | 'read' | 'write' | 'closed'
}

export function isSequence(value: unknown): value is SequenceValue {
  if (!value || typeof value !== 'object') return false
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const v = value as any
  return v.kind === 'Secuencia' && Array.isArray(v.elements) && typeof v.position === 'number' && typeof v.mode === 'string'
}

export function asSequence(value: unknown): SequenceValue {
  if (!isSequence(value)) {
    throw new RuntimeError({
      code: ErrorCode.RUN_TYPE_MISMATCH,
      message: 'Se esperaba una Secuencia',
      module: 'interpreter',
    })
  }
  return value
}

export function createInitialSequence(elementType: DataType): SequenceValue {
  return {
    kind: 'Secuencia',
    elementType,
    elements: [],
    position: 0,
    mode: 'idle',
  }
}
