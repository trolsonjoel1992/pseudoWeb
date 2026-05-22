import { describe, expect, it } from 'vitest'
import { ErrorCode } from '../src/errors'
import { Environment } from '../src/interpreter/environment'
import { Evaluator } from '../src/interpreter/orchestrator'
import { evaluateSequenceProcedure } from '../src/interpreter/evaluators'

async function createEvaluator() {
  const env = new Environment()
  const evaluator = new Evaluator(env)
  // access internal context for direct primitive invocation in tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = (evaluator as any).context
  return { evaluator, ctx }
}

describe('Secuencia primitivas (básico)', () => {
  it('Crear + Escribir x3 + Cerrar + Arrancar + Avanzar + NFDS/FDS', async () => {
    const { evaluator, ctx } = await createEvaluator()

    // declarar variables en el ambiente: datos: Secuencia de Entero, ventana: Entero
    ctx.defineVariable('datos', null, { kind: 'Secuencia', elementType: 'Entero' }, false)
    ctx.defineVariable('ventana', null, 'Entero', false)

    // Crear(datos)
    await evaluateSequenceProcedure('Crear', [{ type: 'Identifier', name: 'datos' }], ctx)

    // Escribir(datos, 1); Escribir(datos, 2); Escribir(datos, 3)
    await evaluateSequenceProcedure('Escribir', [{ type: 'Identifier', name: 'datos' }, { type: 'Literal', value: 1 }], ctx)
    await evaluateSequenceProcedure('Escribir', [{ type: 'Identifier', name: 'datos' }, { type: 'Literal', value: 2 }], ctx)
    await evaluateSequenceProcedure('Escribir', [{ type: 'Identifier', name: 'datos' }, { type: 'Literal', value: 3 }], ctx)

    // comprobar contenido y posición
    const seqAfterWrite = ctx.lookup('datos')
    expect(seqAfterWrite.elements.length).toBe(3)
    expect(seqAfterWrite.position).toBe(0)

    // Cerrar
    await evaluateSequenceProcedure('Cerrar', [{ type: 'Identifier', name: 'datos' }], ctx)
    expect(seqAfterWrite.mode).toBe('closed')

    // Simular re-inicialización para lectura: ponemos modo idle y elements ya existentes
    // Para el test usaremos directamente Arrancar sobre la misma secuencia (debiera fallar por closed)
    try {
      await evaluateSequenceProcedure('Arrancar', [{ type: 'Identifier', name: 'datos' }], ctx)
      throw new Error('Se esperaba excepción por secuencia cerrada')
    } catch (e: any) {
      expect(e).toBeTruthy()
    }

    // Now test FDS/NFDS as builtins via invokeFunction: first reset to read mode
    seqAfterWrite.mode = 'read'
    seqAfterWrite.position = 0
    const fds = await ctx.invokeFunction('FinDeSecuencia', [seqAfterWrite])
    expect(fds).toBe(false)
    const nfds = await ctx.invokeFunction('NoFinDeSecuencia', [seqAfterWrite])
    expect(nfds).toBe(true)

    // Test Avanzar as function (returns element)
    const next = await ctx.invokeFunction('Avanzar', [seqAfterWrite])
    expect(next).toBe(1)
    expect(seqAfterWrite.position).toBe(1)
  })

  it('Errores tipados: Escribir tipo incorrecto, Escribir tras Cerrar, Avanzar fin de secuencia', async () => {
    const { evaluator, ctx } = await createEvaluator()
    ctx.defineVariable('datos', null, { kind: 'Secuencia', elementType: 'Entero' }, false)

    // Crear y escribir un entero
    await evaluateSequenceProcedure('Crear', [{ type: 'Identifier', name: 'datos' }], ctx)
    await evaluateSequenceProcedure('Escribir', [{ type: 'Identifier', name: 'datos' }, { type: 'Literal', value: 42 }], ctx)

    // Escribir tipo incorrecto -> RUN_TYPE_MISMATCH
    try {
      await evaluateSequenceProcedure('Escribir', [{ type: 'Identifier', name: 'datos' }, { type: 'Literal', value: 'hola' }], ctx)
      throw new Error('Se esperaba error por tipo incompatible')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.RUN_TYPE_MISMATCH)
    }

    // Cerrar y luego Escribir -> RUN_INVALID_ARGUMENT
    const seq = ctx.lookup('datos')
    await evaluateSequenceProcedure('Cerrar', [{ type: 'Identifier', name: 'datos' }], ctx)
    try {
      await evaluateSequenceProcedure('Escribir', [{ type: 'Identifier', name: 'datos' }, { type: 'Literal', value: 1 }], ctx)
      throw new Error('Se esperaba error por secuencia cerrada')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.RUN_INVALID_ARGUMENT)
    }

    // Reiniciar para lectura y posicion al final
    seq.mode = 'read'
    seq.position = seq.elements.length
    try {
      await ctx.invokeFunction('Avanzar', [seq])
      throw new Error('Se esperaba error por fin de secuencia')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.RUN_INVALID_ARGUMENT)
    }
  })
})
