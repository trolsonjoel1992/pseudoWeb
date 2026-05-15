import { describe, expect, it } from 'vitest'
import { Lexer } from '../src/lexer'
import { Parser } from '../src/parser'
import { ErrorCode } from '../src/errors'
import { ERR_CONSTANTS_BEFORE_VARIABLES, ERR_VARIABLES_BEFORE_CALLABLES, ERR_EXPECTED_AMBIENTE_BLOCK, ERR_EXPECTED_PROCESO_BLOCK, ERR_EXPECTED_FIN_ACCION, ERR_EXPECTED_PROCESO_IN_FUNCTION, ERR_EXPECTED_FIN_FUNCTION } from '../src/parser/constants'

describe('Parser — errores negativos', () => {
  it('error: constante después de variable', () => {
    const source = `Accion c1 : ES
Ambiente
  a : Entero
  b = 1
Proceso
FinAccion`

    try {
      new Parser(new Lexer(source).tokenize()).parse()
      throw new Error('Se esperaba que parse lanzara')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.PAR_UNEXPECTED_TOKEN)
    }
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

    try {
      new Parser(new Lexer(source).tokenize()).parse()
      throw new Error('Se esperaba que parse lanzara')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.PAR_UNEXPECTED_TOKEN)
    }
  })

  it('error: programa sin Ambiente', () => {
    const source = `Accion sinAmbiente : ES
Proceso
FinAccion`

    try {
      new Parser(new Lexer(source).tokenize()).parse()
      throw new Error('Se esperaba que parse lanzara')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.PAR_UNEXPECTED_TOKEN)
    }
  })

  it('error: programa sin Proceso', () => {
    const source = `Accion sinProceso : ES
Ambiente
FinAccion`

    try {
      new Parser(new Lexer(source).tokenize()).parse()
      throw new Error('Se esperaba que parse lanzara')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.PAR_UNEXPECTED_TOKEN)
    }
  })

  it('error: programa sin FinAccion', () => {
    const source = `Accion sinFin : ES
Ambiente
Proceso
  Escribir("ok")`

    try {
      new Parser(new Lexer(source).tokenize()).parse()
      throw new Error('Se esperaba que parse lanzara')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.PAR_UNEXPECTED_TOKEN)
    }
  })

  it('error: función sin Proceso', () => {
    const source = `Accion fnSinProceso : ES
Ambiente
  Funcion f() : Entero
  FinFuncion
Proceso
FinAccion`

    try {
      new Parser(new Lexer(source).tokenize()).parse()
      throw new Error('Se esperaba que parse lanzara')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.PAR_UNEXPECTED_TOKEN)
    }
  })

  it('error: función sin FinFuncion', () => {
    const source = `Accion fnSinFin : ES
Ambiente
  Funcion f() : Entero
  Proceso
    f := 1
Proceso
FinAccion`

    try {
      new Parser(new Lexer(source).tokenize()).parse()
      throw new Error('Se esperaba que parse lanzara')
    } catch (e: any) {
      expect(e.code).toBe(ErrorCode.PAR_UNEXPECTED_TOKEN)
    }
  })
})
