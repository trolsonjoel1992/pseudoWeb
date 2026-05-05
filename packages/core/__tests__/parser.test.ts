import { describe, expect, it } from 'vitest'
import { Lexer } from '../src/lexer/lexer'
import { Parser } from '../src/parser/parser'

describe('Parser', () => {
  it('parsea una asignación y una escritura', () => {
    const source = `Accion prueba : ES
Ambiente
  a, b : Entero
Proceso
  a := 4 + 2
  Escribir(a)
FinAccion`
    const tokens = new Lexer(source).tokenize()
    const action = new Parser(tokens).parse()
    const statements = action.proceso

    // Ahora el parser retorna ActionNode con el bloque Proceso
    expect(statements).toHaveLength(2)
    expect(statements[0].type).toBe('Assignment')
    expect(statements[1].type).toBe('Write')
  })

  it('parsea un Si con bloque SiNo', () => {
    const source = `Si a < 10 Entonces
  Escribir("menor")
SiNo
  Escribir("mayor")
FinSi`

    const wrapped = `Accion prueba2 : ES
  Ambiente
  Proceso
  ${source}
  FinAccion`
    const tokens = new Lexer(wrapped).tokenize()
    const action = new Parser(tokens).parse()
    const statements = action.proceso

    expect(statements).toHaveLength(1)
    expect(statements[0].type).toBe('If')
  })

  it('respeta precedencia aritmetica', () => {
    const wrapped = `Accion prueba3 : ES
Ambiente
Proceso
  a := 2 + 3 * 4
FinAccion`
    const tokens = new Lexer(wrapped).tokenize()
    const action = new Parser(tokens).parse()
    const statements = action.proceso

    expect(statements).toHaveLength(1)
    expect(statements[0].type).toBe('Assignment')

    const assignment = statements[0]
    if (assignment.type !== 'Assignment') {
      throw new Error('Nodo inesperado')
    }

    expect(assignment.value.type).toBe('BinaryExpression')
    if (assignment.value.type !== 'BinaryExpression') {
      throw new Error('Expresion inesperada')
    }

    expect(assignment.value.operator).toBe('Suma')
    expect(assignment.value.right.type).toBe('BinaryExpression')
  })

  it('mantiene asociatividad derecha de potencia', () => {
    const wrapped = `Accion prueba4 : ES
Ambiente
Proceso
  a := 2 ** 3 ** 2
FinAccion`
    const tokens = new Lexer(wrapped).tokenize()
    const action = new Parser(tokens).parse()
    const statements = action.proceso
    const assignment = statements[0]

    if (assignment.type !== 'Assignment' || assignment.value.type !== 'BinaryExpression') {
      throw new Error('Estructura inesperada')
    }

    expect(assignment.value.operator).toBe('Potencia')
    expect(assignment.value.right.type).toBe('BinaryExpression')
  })

  it('parsea Para con Hasta y paso negativo', () => {
    const source = `Accion paraPrueba : ES
Ambiente
Proceso
Para contador := 100 Hasta 10, -2 Hacer
  Escribir(contador)
FinPara
FinAccion`
    const tokens = new Lexer(source).tokenize()
    const action = new Parser(tokens).parse()
    const statements = action.proceso

    expect(statements).toHaveLength(1)
    if (statements[0].type !== 'For') {
      throw new Error('Se esperaba un nodo For')
    }

    expect(statements[0].step?.type).toBe('UnaryExpression')
  })

  it('parsea llamadas de función en expresiones y llamadas como sentencia', () => {
    const source = `Accion callPrueba : ES
Ambiente
  resultado : Entero
  Funcion suma(a : Entero, b : Entero) : Entero
  Proceso
    suma := a + b
  FinFuncion
  Procedimiento mostrar(valor : Entero)
  Proceso
    Escribir(valor)
  FinProcedimiento
Proceso
  resultado := suma(2, 3)
  mostrar(resultado)
FinAccion`

    const tokens = new Lexer(source).tokenize()
    const action = new Parser(tokens).parse()

    expect(action.proceso).toHaveLength(2)
    expect(action.proceso[0].type).toBe('Assignment')
    expect(action.proceso[1].type).toBe('CallStatement')

    const assignment = action.proceso[0]
    if (assignment.type !== 'Assignment') {
      throw new Error('Se esperaba un Assignment')
    }

    expect(assignment.value.type).toBe('FunctionCall')
  })

  it('parsea declaraciones con tipo AN(n)', () => {
    const source = `Accion anPrueba : ES
Ambiente
  nombre : AN(20)
Proceso
  Escribir(nombre)
FinAccion`

    const tokens = new Lexer(source).tokenize()
    const action = new Parser(tokens).parse()
    const variableDecl = action.ambiente.variables[0]

    expect(variableDecl.dataType).toEqual({ kind: 'AN', maxLength: 20 })
  })

  it('rechaza redeclaraciones en el mismo ambiente', () => {
    const source = `Accion dupPrueba : ES
Ambiente
  a : Entero
  a : Real
Proceso
  Escribir(a)
FinAccion`

    expect(() => new Parser(new Lexer(source).tokenize()).parse()).toThrow('Identificador redeclarado')
  })

  it('rechaza shadowing de variables locales respecto al ambiente externo', () => {
    const source = `Accion shadowPrueba : ES
Ambiente
  valor : Entero
  Funcion f(x : Entero) : Entero
  Ambiente
    valor : Entero
  Proceso
    f := x
  FinFuncion
Proceso
  Escribir(valor)
FinAccion`

    expect(() => new Parser(new Lexer(source).tokenize()).parse()).toThrow('No se permite shadowing')
  })
})