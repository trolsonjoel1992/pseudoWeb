import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors.js'
import type { BuiltinFunction } from './registry'

function assertSeqArg(args: unknown[], name: string) {
  if (args.length !== 1) {
    throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: `${name} requiere 1 argumento.`, module: 'interpreter' })
  }
  const seq = args[0] as any
  if (!seq || seq.kind !== 'Secuencia' || !Array.isArray(seq.elements)) {
    throw new RuntimeError({ code: ErrorCode.RUN_TYPE_MISMATCH, message: `${name}: argumento no es Secuencia`, module: 'interpreter', context: { arg: args[0] } })
  }
  return seq
}

export function createFDS(): BuiltinFunction {
  return {
    name: 'FinDeSecuencia',
    execute: (args: unknown[]): unknown => {
      const seq = assertSeqArg(args, 'FinDeSecuencia')
      if (seq.mode === 'closed') throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia cerrada', module: 'interpreter' })
      if (seq.mode !== 'read') throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia no está en modo lectura', module: 'interpreter' })
      return seq.position >= seq.elements.length
    },
  }
}

export function createNFDS(): BuiltinFunction {
  return {
    name: 'NoFinDeSecuencia',
    execute: (args: unknown[]): unknown => {
      const seq = assertSeqArg(args, 'NoFinDeSecuencia')
      if (seq.mode === 'closed') throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia cerrada', module: 'interpreter' })
      if (seq.mode !== 'read') throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia no está en modo lectura', module: 'interpreter' })
      return seq.position < seq.elements.length
    },
  }
}

export function createArrancar(): BuiltinFunction {
  return {
    name: 'Arrancar',
    execute: (args: unknown[]): unknown => {
      const seq = assertSeqArg(args, 'Arrancar')
      if (seq.mode === 'closed') throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia cerrada', module: 'interpreter' })
      if (seq.mode !== 'idle') throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia ya inicializada', module: 'interpreter' })
      seq.mode = 'read'
      seq.position = 0
      return null
    },
  }
}

export function createCerrar(): BuiltinFunction {
  return {
    name: 'Cerrar',
    execute: (args: unknown[]): unknown => {
      const seq = assertSeqArg(args, 'Cerrar')
      if (seq.mode === 'closed') throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia ya cerrada', module: 'interpreter' })
      seq.mode = 'closed'
      return null
    },
  }
}

export function createAvanzarBuiltin(): BuiltinFunction {
  return {
    name: 'Avanzar',
    execute: (args: unknown[]): unknown => {
      const seq = assertSeqArg(args, 'Avanzar')
      if (seq.mode === 'closed') throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia cerrada', module: 'interpreter' })
      if (seq.mode !== 'read') throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Secuencia no iniciada para lectura', module: 'interpreter' })
      if (seq.position >= seq.elements.length) throw new RuntimeError({ code: ErrorCode.RUN_INVALID_ARGUMENT, message: 'Fin de secuencia alcanzado', module: 'interpreter' })
      const el = seq.elements[seq.position]
      seq.position += 1
      return el
    },
  }
}
