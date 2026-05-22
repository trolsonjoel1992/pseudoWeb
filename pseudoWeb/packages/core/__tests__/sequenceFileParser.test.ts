import { describe, it, expect } from 'vitest'
import { parseSequenceFile } from '../src/io/sequenceFileParser'
import { analyzeSequences } from '../src/analysis/sequenceAnalyzer'

describe('sequenceFileParser integración', () => {
  it('parsea un archivo con Escribir y el analyzer lo detecta', () => {
    const source = `Accion prueba : ES
Ambiente
Proceso
  Escribir(datos, 1)
FinAccion`

    const action = parseSequenceFile(source)
    const detected = analyzeSequences(action)
    expect(detected.some(d => d.kind === 'write' && d.name === 'datos')).toBe(true)
  })
})
