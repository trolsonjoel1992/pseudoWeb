import type { ExpressionNode } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors.js'
import { createInitialSequence, isSequence, asSequence, SequenceValue } from '../types/SequenceValue'
import type { EvaluatorContext } from '../types/evaluatorContext'

const PRIMITIVES = new Set([
  'Arrancar',
  'Crear',
  'Avanzar',
  'Escribir',
  'FinDeSecuencia',
  'FDS',
  'NoFinDeSecuencia',
  'NFDS',
  'Cerrar',
])

export function isSequencePrimitive(name: string): boolean {
  return PRIMITIVES.has(name)
}

export async function evaluateSequenceProcedure(name: string, argNodes: ExpressionNode[], context: EvaluatorContext): Promise<unknown> {
  const lower = name
  switch (lower) {
    case 'Arrancar':
    case 'Arrancar'.toString(): {
      if (argNodes.length !== 1) throwSequenceError('Arrancar', 'requiere 1 argumento')
      const seqValue = await context.evaluateExpression(argNodes[0])
      if (!isSequence(seqValue)) throwSequenceError('Arrancar', 'el argumento no es una Secuencia')
      const seq = asSequence(seqValue)
      if (seq.mode === 'closed') throwSequenceError('Arrancar', 'secuencia ya cerrada')
      if (seq.mode !== 'idle') throwSequenceError('Arrancar', 'secuencia ya inicializada')
      if (seq.elements.length === 0) {
        throw new RuntimeError({
          code: ErrorCode.RUN_NO_SEQUENCE_DATA,
          message: `Arrancar: secuencia sin datos precargados`,
          module: 'interpreter',
        })
      }
      seq.mode = 'read'
      seq.position = 0
      return null
    }

    case 'Crear': {
      if (argNodes.length !== 1) throwSequenceError('Crear', 'requiere 1 argumento (variable identificador)')
      const node = argNodes[0]
      // Expect identifier to assign the created sequence
      // @ts-ignore - node may be IdentifierNode with name
      const varName = (node as any).name
      if (!varName || typeof varName !== 'string') throwSequenceError('Crear', 'debe recibir una variable identificador')
      // Lookup declared type for variable
      const declaredType = context.lookupVariableType(varName)
      if (!declaredType || (typeof declaredType === 'object' && (declaredType as any).kind !== 'Secuencia')) {
        throwSequenceError('Crear', `la variable ${varName} no es de tipo Secuencia`)
      }
      const elementType = (declaredType as any).elementType
      const seq = createInitialSequence(elementType)
      seq.mode = 'write'
      seq.elements = []
      seq.position = 0
      context.assignVariable(varName, seq)
      return null
    }

    case 'Escribir': {
      if (argNodes.length !== 2) throwSequenceError('Escribir', 'requiere 2 argumentos')
      const seqVal = await context.evaluateExpression(argNodes[0])
      const value = await context.evaluateExpression(argNodes[1])
      if (!isSequence(seqVal)) throwSequenceError('Escribir', 'primer argumento no es Secuencia')
      const seq = asSequence(seqVal)
      if (seq.mode === 'closed') throwSequenceError('Escribir', 'secuencia cerrada')
      if (seq.mode !== 'write') throwSequenceError('Escribir', 'secuencia no está en modo escritura')
      // Validate element type
      context.typeChecker.assertValueMatchesType(value, seq.elementType, 'Escribir en Secuencia')
      seq.elements.push(value)
      return null
    }

    case 'Avanzar': {
      if (argNodes.length !== 2) throwSequenceError('Avanzar', 'requiere 2 argumentos (secuencia, variable)')
      const seqVal = await context.evaluateExpression(argNodes[0])
      if (!isSequence(seqVal)) throwSequenceError('Avanzar', 'primer argumento no es Secuencia')
      const seq = asSequence(seqVal)
      if (seq.mode === 'closed') throwSequenceError('Avanzar', 'secuencia cerrada')
      if (seq.mode !== 'read') throwSequenceError('Avanzar', 'secuencia no iniciada para lectura')
      if (seq.position >= seq.elements.length) throwSequenceError('Avanzar', 'fin de secuencia alcanzado')

      // second arg must be identifier node so we can assign
      // @ts-ignore
      const maybeIdent = argNodes[1]
      const varName = (maybeIdent as any).name
      if (!varName || typeof varName !== 'string') throwSequenceError('Avanzar', 'segundo argumento debe ser una variable identificador')
      if (!context.hasVariable(varName)) throwSequenceError('Avanzar', `variable ${varName} no encontrada`)

      const element = seq.elements[seq.position]
      context.typeChecker.assertValueMatchesType(element, seq.elementType, `variable '${varName}' asignada por Avanzar`)
      context.assignVariable(varName, element)
      seq.position += 1
      return null
    }

    case 'FinDeSecuencia':
    case 'FDS': {
      if (argNodes.length !== 1) throwSequenceError('FDS', 'requiere 1 argumento')
      const seqVal = await context.evaluateExpression(argNodes[0])
      if (!isSequence(seqVal)) throwSequenceError('FDS', 'argumento no es Secuencia')
      const seq = asSequence(seqVal)
      if (seq.mode === 'closed') throwSequenceError('FDS', 'secuencia cerrada')
      if (seq.mode !== 'read') throwSequenceError('FDS', 'secuencia no está en modo lectura')
      return seq.position >= seq.elements.length
    }

    case 'NoFinDeSecuencia':
    case 'NFDS': {
      if (argNodes.length !== 1) throwSequenceError('NFDS', 'requiere 1 argumento')
      const seqVal = await context.evaluateExpression(argNodes[0])
      if (!isSequence(seqVal)) throwSequenceError('NFDS', 'argumento no es Secuencia')
      const seq = asSequence(seqVal)
      if (seq.mode === 'closed') throwSequenceError('NFDS', 'secuencia cerrada')
      if (seq.mode !== 'read') throwSequenceError('NFDS', 'secuencia no está en modo lectura')
      return seq.position < seq.elements.length
    }

    case 'Cerrar': {
      if (argNodes.length !== 1) throwSequenceError('Cerrar', 'requiere 1 argumento')
      const seqVal = await context.evaluateExpression(argNodes[0])
      if (!isSequence(seqVal)) throwSequenceError('Cerrar', 'argumento no es Secuencia')
      const seq = asSequence(seqVal)
      if (seq.mode === 'closed') throwSequenceError('Cerrar', 'secuencia ya cerrada')
      seq.mode = 'closed'
      return null
    }

    default:
      throw new RuntimeError({
        code: ErrorCode.RUN_INVALID_ARGUMENT,
        message: `Primitiva de secuencia desconocida: ${name}`,
        module: 'interpreter',
      })
  }
}

function throwSequenceError(operation: string, message: string): never {
  throw new RuntimeError({
    code: ErrorCode.RUN_INVALID_ARGUMENT,
    message: `${operation}: ${message}`,
    module: 'interpreter',
  })
}
