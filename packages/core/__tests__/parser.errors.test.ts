import { describe, expect, it } from 'vitest'
import { Lexer } from '../src/lexer'
import { Parser } from '../src/parser'
import { ERR_CONSTANTS_BEFORE_VARIABLES, ERR_VARIABLES_BEFORE_CALLABLES, ERR_EXPECTED_AMBIENTE_BLOCK, ERR_EXPECTED_PROCESO_BLOCK, ERR_EXPECTED_FIN_ACCION, ERR_EXPECTED_PROCESO_IN_FUNCTION, ERR_EXPECTED_FIN_FUNCTION } from '../src/parser/constants'

describe('Parser — errores negativos', () => {
  it('error: constante después de variable', () => {
    const source = `Accion c1 : ES
Ambiente
  a : Entero
  b = 1
Proceso
FinAccion`

    expect(() => new Parser(new Lexer(source).tokenize()).parse()).toThrow(ERR_CONSTANTS_BEFORE_VARIABLES)
  })

  it('error: variable después de función', () => {
    const source = `Accion v1 : ES
Ambiente
  Funcion f() : Entero
  Proceso
    f := 1
  FinFuncion
  x : Entero
Proceso
FinAccion`

    expect(() => new Parser(new Lexer(source).tokenize()).parse()).toThrow(ERR_VARIABLES_BEFORE_CALLABLES)
  })

  it('error: programa sin Ambiente', () => {
    const source = `Accion sinAmbiente : ES
Proceso
FinAccion`

    expect(() => new Parser(new Lexer(source).tokenize()).parse()).toThrow(ERR_EXPECTED_AMBIENTE_BLOCK)
  })

  it('error: programa sin Proceso', () => {
    const source = `Accion sinProceso : ES
Ambiente
FinAccion`

    expect(() => new Parser(new Lexer(source).tokenize()).parse()).toThrow(ERR_EXPECTED_PROCESO_BLOCK)
  })

  it('error: programa sin FinAccion', () => {
    const source = `Accion sinFin : ES
Ambiente
Proceso
  Escribir("ok")`

    expect(() => new Parser(new Lexer(source).tokenize()).parse()).toThrow(ERR_EXPECTED_FIN_ACCION)
  })

  it('error: función sin Proceso', () => {
    const source = `Accion fnSinProceso : ES
Ambiente
  Funcion f() : Entero
  FinFuncion
Proceso
FinAccion`

    expect(() => new Parser(new Lexer(source).tokenize()).parse()).toThrow(ERR_EXPECTED_PROCESO_IN_FUNCTION)
  })

  it('error: función sin FinFuncion', () => {
    const source = `Accion fnSinFin : ES
Ambiente
  Funcion f() : Entero
  Proceso
    f := 1
Proceso
FinAccion`

    expect(() => new Parser(new Lexer(source).tokenize()).parse()).toThrow(ERR_EXPECTED_FIN_FUNCTION)
  })
})
