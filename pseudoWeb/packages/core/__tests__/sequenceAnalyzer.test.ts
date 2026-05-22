import { describe, it, expect } from 'vitest'
import { analyzeSequences } from '../src/analysis/sequenceAnalyzer'

describe('sequenceAnalyzer básico', () => {
  it('detecta llamadas Crear y Escribir en AST simple', () => {
    const ast = [
      {
        type: 'CallStatement',
        call: {
          type: 'FunctionCall',
          name: 'Crear',
          arguments: [{ type: 'Identifier', name: 'datos' }],
          line: 1,
          column: 1,
        },
      },
      {
        type: 'CallStatement',
        call: {
          type: 'FunctionCall',
          name: 'Escribir',
          arguments: [{ type: 'Identifier', name: 'datos' }, { type: 'Literal', value: 1 }],
          line: 2,
          column: 1,
        },
      },
    ]

    const res = analyzeSequences(ast)
    expect(res.length).toBeGreaterThanOrEqual(2)
    const names = res.map(r => r.name)
    expect(names).toContain('datos')
    const kinds = res.map(r => r.kind)
    expect(kinds).toContain('create')
    expect(kinds).toContain('write')
  })
})
