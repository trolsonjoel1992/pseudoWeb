import { describe, expect, it } from 'vitest'
import { Environment } from '../src/interpreter/environment'
import { Evaluator } from '../src/interpreter/evaluator'
import { Lexer } from '../src/lexer/lexer'
import { Parser } from '../src/parser/parser'

function execute(source: string, inputValues: unknown[] = []) {
  const tokens = new Lexer.Lexer(source).tokenize()
  const statements = new Parser.Parser(tokens).parse()
  const evaluator = new Evaluator(new Environment(), inputValues)
  return evaluator.evaluate(statements)
}

describe('Evaluator', () => {
  it('ejecuta aritmética y variables', () => {
    const result = execute('a, b : Entero\na := 4\nb := a + 6\nEscribir(b)')

    expect(result.output).toEqual(['10'])
    expect(result.variables.b).toBe(10)
  })

  it('ejecuta condicionales', () => {
    const result = execute('a := 3\nSi a < 5 Entonces\n  Escribir("ok")\nSiNo\n  Escribir("no")\nFinSi')

    expect(result.output).toEqual(['ok'])
  })

  it('ejecuta bucles', () => {
    const result = execute('suma := 0\nPara i := 1 .. 3 Hacer\n  suma := suma + i\nFinPara\nEscribir(suma)')

    expect(result.output).toEqual(['6'])
    expect(result.variables.suma).toBe(6)
  })

  it('ejecuta bucles con paso negativo', () => {
    const result = execute('suma := 0\nPara i := 3 .. 1 Hacer\n  suma := suma + i\nFinPara\nEscribir(suma)')

    expect(result.output).toEqual(['6'])
    expect(result.variables.suma).toBe(6)
  })

  it('lee valores de entrada', () => {
    const result = execute('Leer(a, b)\nEscribir(a, b)', [7, 'hola'])

    expect(result.output).toEqual(['7 hola'])
    expect(result.variables.a).toBe(7)
    expect(result.variables.b).toBe('hola')
  })

  it('falla cuando hay division por cero', () => {
    expect(() => execute('a := 10 / 0\nEscribir(a)')).toThrow('División por cero.')
  })

  it('asigna null cuando no hay entrada en Leer', () => {
    const result = execute('Leer(a, b)\nEscribir(a, b)', [42])

    expect(result.output).toEqual(['42 '])
    expect(result.variables.a).toBe(42)
    expect(result.variables.b).toBeNull()
  })

  it('falla en bucle Mientras infinito por limite de seguridad', () => {
    expect(() => execute('Mientras Verdadero Hacer\n  Escribir("x")\nFinMientras')).toThrow('Bucle Mientras excedió el límite de seguridad.')
  })
})