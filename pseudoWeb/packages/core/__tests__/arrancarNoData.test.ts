import { describe, it, expect } from 'vitest'
import { createInitialSequence } from '../src/interpreter/types/SequenceValue'
import { ErrorCode } from '../src/errors'

import { evaluateSequenceProcedure } from '../src/interpreter/evaluators'

async function createEvaluator() {
  const { Environment } = await import('../src/interpreter/environment')
  const { Evaluator } = await import('../src/interpreter/orchestrator')
  const env = new Environment()
  const evaluator = new Evaluator(env)
  // access internal context for direct primitive invocation in tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ctx = (evaluator as any).context
  return { evaluator, ctx }
}

describe('Arrancar sin datos', () => {
  it('lanza RUN_NO_SEQUENCE_DATA si no hay elementos cargados', async () => {
    const { evaluator, ctx } = await createEvaluator()
    ctx.defineVariable('datos', null, { kind: 'Secuencia', elementType: 'Entero' }, false)
    const seq = createInitialSequence('Entero')
    // assign variable directly in context
    ctx.assignVariable('datos', seq)

    try {
      await evaluateSequenceProcedure('Arrancar', [{ type: 'Identifier', name: 'datos' }], ctx)
      throw new Error('Se esperaba excepción por falta de datos')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.RUN_NO_SEQUENCE_DATA)
    }
  })
})
