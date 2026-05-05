import { describe, expect, it } from 'vitest'
import { Environment } from '../src/interpreter/environment'
import { Evaluator } from '../src/interpreter/evaluator'
import { Lexer } from '../src/lexer/lexer'
import { Parser } from '../src/parser/parser'

async function execute(source: string, inputValues: unknown[] = []) {
  const tokens = new Lexer(source).tokenize()
  const statements = new Parser(tokens).parse()
  const pendingInputs = [...inputValues]
  const evaluator = new Evaluator(new Environment(), async () => pendingInputs.shift() ?? null)
  return await evaluator.evaluate(statements)
}

describe('Evaluator', () => {
  it('ejecuta aritmética y variables declaradas', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  a, b : Entero
Proceso
  a := 4
  b := a + 6
  Escribir(b)
FinAccion`)

    expect(result.output).toEqual(['10'])
    expect(result.variables.b).toBe(10)
  })

  it('ejecuta condicionales', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  a : Entero
Proceso
  a := 3
  Si a < 5 Entonces
    Escribir("ok")
  SiNo
    Escribir("no")
  FinSi
FinAccion`)

    expect(result.output).toEqual(['ok'])
  })

  it('ejecuta bucles con Hasta', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  suma, i : Entero
Proceso
  suma := 0
  Para i := 1 Hasta 3 Hacer
    suma := suma + i
  FinPara
  Escribir(suma)
FinAccion`)

    expect(result.output).toEqual(['6'])
    expect(result.variables.suma).toBe(6)
  })

  it('ejecuta bucles con Hasta y paso negativo', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  suma, i : Entero
Proceso
  suma := 0
  Para i := 3 Hasta 1, -1 Hacer
    suma := suma + i
  FinPara
  Escribir(suma)
FinAccion`)

    expect(result.output).toEqual(['6'])
    expect(result.variables.suma).toBe(6)
  })

  it('lee valores de entrada en variables declaradas', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  a : Entero
  b : Alfanumerico
Proceso
  Leer(a, b)
  Escribir(a, b)
FinAccion`, [7, 'hola'])

    expect(result.output).toEqual(['7 hola'])
    expect(result.variables.a).toBe(7)
    expect(result.variables.b).toBe('hola')
  })

  it('rechaza tipos incompatibles en Leer', async () => {
    await expect(execute(`Accion prueba : ES
Ambiente
  a : Entero
Proceso
  Leer(a)
FinAccion`, ['hola'])).rejects.toThrow("Valor incompatible para 'a'. Se esperaba Entero.")
  })

  it('falla cuando hay division por cero', async () => {
    await expect(execute(`Accion prueba : ES
Ambiente
  a : Entero
Proceso
  a := 10 / 0
  Escribir(a)
FinAccion`)).rejects.toThrow('División por cero.')
  })

  it('rechaza reasignar una constante', async () => {
    await expect(execute(`Accion prueba : ES
Ambiente
  PI = 3
Proceso
  PI := 4
FinAccion`)).rejects.toThrow("No se puede reasignar la constante 'PI'.")
  })

  it('rechaza operaciones con valores nulos', async () => {
    await expect(execute(`Accion prueba : ES
Ambiente
  a, b : Entero
Proceso
  b := a + 1
FinAccion`)).rejects.toThrow('No se puede usar un valor nulo')
  })

  it('falla cuando se asigna a una variable no declarada', async () => {
    await expect(execute(`Accion prueba : ES
Ambiente
Proceso
  a := 1
FinAccion`)).rejects.toThrow("Variable 'a' no declarada")
  })

  it('falla en bucle Mientras infinito por limite de seguridad', async () => {
    await expect(execute(`Accion prueba : ES
Ambiente
Proceso
  Mientras Verdadero Hacer
    Escribir("x")
  FinMientras
FinAccion`)).rejects.toThrow('Bucle Mientras excedió el límite de seguridad.')
  })

  it('ejecuta Repetir HastaQue', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  contador : Entero
Proceso
  contador := 0
  Repetir
    contador := contador + 1
    Escribir(contador)
  HastaQue contador >= 3
FinAccion`)

    expect(result.output).toEqual(['1', '2', '3'])
    expect(result.variables.contador).toBe(3)
  })

  it('ejecuta Segun con valores exactos', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  opcion : Entero
Proceso
  opcion := 2
  Segun opcion Hacer
    1: Escribir("uno")
    2: Escribir("dos")
    Otro: Escribir("otro")
  FinSegun
FinAccion`)

    expect(result.output).toEqual(['dos'])
  })

  it('ejecuta Segun con comparacion mayor que', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  valor : Entero
Proceso
  valor := 7
  Segun valor Hacer
    >10: Escribir("mayor que 10")
    >5: Escribir("mayor que 5")
    Otro: Escribir("menor o igual a 5")
  FinSegun
FinAccion`)

    expect(result.output).toEqual(['mayor que 5'])
  })

  it('ejecuta función con retorno por asignación al nombre', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  resultado : Entero
  Funcion suma(a : Entero, b : Entero) : Entero
  Proceso
    suma := a + b
  FinFuncion
Proceso
  resultado := suma(2, 8)
  Escribir(resultado)
FinAccion`)

    expect(result.output).toEqual(['10'])
    expect(result.variables.resultado).toBe(10)
  })

  it('ejecuta procedimiento como sentencia', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  Procedimiento saludar(nombre : Alfanumerico)
  Proceso
    Escribir("Hola", nombre)
  FinProcedimiento
Proceso
  saludar("Ada")
FinAccion`)

    expect(result.output).toEqual(['Hola Ada'])
  })

  it('rechaza tipos incompatibles en parámetros de función', async () => {
    await expect(execute(`Accion prueba : ES
Ambiente
  resultado : Entero
  Funcion doble(x : Entero) : Entero
  Proceso
    doble := x * 2
  FinFuncion
Proceso
  resultado := doble("3")
FinAccion`)).rejects.toThrow("Tipo incompatible en el parámetro 'x'. Se esperaba Entero.")
  })

  it('ejecuta REDOND como función integrada', async () => {
    const result = await execute(`Accion prueba : ES
Ambiente
  r : Entero
Proceso
  r := REDOND(3.6)
  Escribir(r)
FinAccion`)

    expect(result.output).toEqual(['4'])
    expect(result.variables.r).toBe(4)
  })

  it('valida longitud de AN(n) en asignación', async () => {
    await expect(execute(`Accion prueba : ES
Ambiente
  nombre : AN(3)
Proceso
  nombre := "abcd"
FinAccion`)).rejects.toThrow('Se esperaba AN(3)')
  })

  it('valida longitud de AN(n) en Leer', async () => {
    await expect(execute(`Accion prueba : ES
Ambiente
  nombre : AN(3)
Proceso
  Leer(nombre)
FinAccion`, ['abcd'])).rejects.toThrow('Se esperaba AN(3)')
  })

  it('rechaza incompatibilidad de tipos en Segun', async () => {
    await expect(execute(`Accion prueba : ES
Ambiente
  opcion : Entero
Proceso
  opcion := 1
  Segun opcion Hacer
    "1": Escribir("uno")
  FinSegun
FinAccion`)).rejects.toThrow('el tipo de la expresión y el tipo del caso deben coincidir')
  })
})
