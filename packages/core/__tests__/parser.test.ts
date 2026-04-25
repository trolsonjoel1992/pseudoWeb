import { describe, expect, it } from 'vitest'
import { Lexer } from '../src/lexer/lexer'
import { Parser } from '../src/parser/parser'

describe('Parser', () => {
  it('parsea una asignación y una escritura', () => {
    const tokens = new Lexer.Lexer('a, b : Entero\na := 4 + 2\nEscribir(a)').tokenize()
    const statements = new Parser.Parser(tokens).parse()

    expect(statements).toHaveLength(3)
    expect(statements[0].type).toBe('VariableDeclaration')
    expect(statements[1].type).toBe('Assignment')
    expect(statements[2].type).toBe('Write')
  })

  it('parsea un Si con bloque Sino', () => {
    const source = `Si a < 10 Entonces
  Escribir("menor")
Sino
  Escribir("mayor")
FinSi`

    const tokens = new Lexer.Lexer(source).tokenize()
    const statements = new Parser.Parser(tokens).parse()

    expect(statements).toHaveLength(1)
    expect(statements[0].type).toBe('If')
  })
})