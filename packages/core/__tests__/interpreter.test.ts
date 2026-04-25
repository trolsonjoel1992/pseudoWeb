import { describe, expect, it } from 'vitest'
import { Environment } from '../src/interpreter/environment'
import { Evaluator } from '../src/interpreter/evaluator'
import { Lexer } from '../src/lexer/lexer'
import { Parser } from '../src/parser/parser'

function execute(source: string) {
  const tokens = new Lexer.Lexer(source).tokenize()
  const statements = new Parser.Parser(tokens).parse()
  const evaluator = new Evaluator(new Environment())
  return evaluator.evaluate(statements)
}

describe('Evaluator', () => {
  it('ejecuta aritmética y variables', () => {
    const result = execute('a, b : Entero\na := 4\nb := a + 6\nEscribir(b)')

    expect(result.output).toEqual(['10'])
    expect(result.variables.b).toBe(10)
  })

  it('ejecuta condicionales', () => {
    const result = execute('a := 3\nSi a < 5 Entonces\n  Escribir("ok")\nSino\n  Escribir("no")\nFinSi')

    expect(result.output).toEqual(['ok'])
  })

  it('ejecuta bucles', () => {
    const result = execute('suma := 0\nPara i := 1 .. 3 Hacer\n  suma := suma + i\nFinPara\nEscribir(suma)')

    expect(result.output).toEqual(['6'])
    expect(result.variables.suma).toBe(6)
  })
})