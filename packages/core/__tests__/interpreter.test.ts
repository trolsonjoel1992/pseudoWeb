import { describe, expect, it } from 'vitest'
import { Environment } from '../src/interpreter/environment'
import { Evaluator } from '../src/interpreter/evaluator'
import { Lexer } from '../src/lexer/lexer'
import { Parser } from '../src/parser/parser'

async function execute(source: string, inputValues: unknown[] = []) {
  let wrapped = source
  if (!/^\s*Accion\b/.test(source)) {
    wrapped = `Accion main : ES\nAmbiente\nProceso\n${source}\nFinAccion`
  }
  const tokens = new Lexer(wrapped).tokenize()
  const statements = new Parser(tokens).parse()
  const pendingInputs = [...inputValues]
  const evaluator = new Evaluator(new Environment(), async () => pendingInputs.shift() ?? null)
  return await evaluator.evaluate(statements)
}

describe('Evaluator', () => {
  it('ejecuta aritmética y variables', async () => {
    const result = await execute('a, b : Entero\na := 4\nb := a + 6\nEscribir(b)')

    expect(result.output).toEqual(['10'])
    expect(result.variables.b).toBe(10)
  })

  it('ejecuta condicionales', async () => {
    const result = await execute('a := 3\nSi a < 5 Entonces\n  Escribir("ok")\nSiNo\n  Escribir("no")\nFinSi')

    expect(result.output).toEqual(['ok'])
  })

  it('ejecuta bucles', async () => {
    const result = await execute('suma := 0\nPara i := 1 .. 3 Hacer\n  suma := suma + i\nFinPara\nEscribir(suma)')

    expect(result.output).toEqual(['6'])
    expect(result.variables.suma).toBe(6)
  })

  it('ejecuta bucles con Hasta y paso negativo', async () => {
    const result = await execute('suma := 0\nPara i := 3 Hasta 1, -1 Hacer\n  suma := suma + i\nFinPara\nEscribir(suma)')

    expect(result.output).toEqual(['6'])
    expect(result.variables.suma).toBe(6)
  })

  it('ejecuta bucles con paso negativo', async () => {
    const result = await execute('suma := 0\nPara i := 3 .. 1 Hacer\n  suma := suma + i\nFinPara\nEscribir(suma)')

    expect(result.output).toEqual(['6'])
    expect(result.variables.suma).toBe(6)
  })

  it('lee valores de entrada', async () => {
    const result = await execute('a : Entero\nb : Alfanumerico\nLeer(a, b)\nEscribir(a, b)', [7, 'hola'])

    expect(result.output).toEqual(['7 hola'])
    expect(result.variables.a).toBe(7)
    expect(result.variables.b).toBe('hola')
  })

  it('rechaza tipos incompatibles en Leer', async () => {
    await expect(execute('a : Entero\nLeer(a)', ['hola'])).rejects.toThrow("Valor incompatible para 'a'. Se esperaba Entero.")
  })

  it('falla cuando hay division por cero', async () => {
    await expect(execute('a := 10 / 0\nEscribir(a)')).rejects.toThrow('División por cero.')
  })

  it('asigna null cuando no hay entrada en Leer', async () => {
    const result = await execute('a, b : Entero\nLeer(a, b)\nEscribir(a, b)', [42])

    expect(result.output).toEqual(['42 '])
    expect(result.variables.a).toBe(42)
    expect(result.variables.b).toBeNull()
  })

  it('falla en bucle Mientras infinito por limite de seguridad', async () => {
    await expect(execute('Mientras Verdadero Hacer\n  Escribir("x")\nFinMientras')).rejects.toThrow('Bucle Mientras excedió el límite de seguridad.')
  })

  it('ejecuta Repetir HastaQue', async () => {
    const result = await execute(`contador := 0\nRepetir\n  contador := contador + 1\n  Escribir(contador)\nHastaQue contador >= 3`)

    expect(result.output).toEqual(['1', '2', '3'])
    expect(result.variables.contador).toBe(3)
  })

  it('ejecuta Segun con valores exactos', async () => {
    const result = await execute('opcion := 2\nSegun opcion Hacer\n  1: Escribir("uno")\n  2: Escribir("dos")\n  Otro: Escribir("otro")\nFinSegun')

    expect(result.output).toEqual(['dos'])
  })

  it('ejecuta Segun con comparacion mayor que', async () => {
    const result = await execute('valor := 7\nSegun valor Hacer\n  >10: Escribir("mayor que 10")\n  >5: Escribir("mayor que 5")\n  Otro: Escribir("menor o igual a 5")\nFinSegun')

    expect(result.output).toEqual(['mayor que 5'])
  })
})