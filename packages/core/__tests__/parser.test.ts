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

  it('parsea un Si con bloque SiNo', () => {
    const source = `Si a < 10 Entonces
  Escribir("menor")
SiNo
  Escribir("mayor")
FinSi`

    const tokens = new Lexer.Lexer(source).tokenize()
    const statements = new Parser.Parser(tokens).parse()

    expect(statements).toHaveLength(1)
    expect(statements[0].type).toBe('If')
  })

  it('respeta precedencia aritmetica', () => {
    const tokens = new Lexer.Lexer('a := 2 + 3 * 4').tokenize()
    const statements = new Parser.Parser(tokens).parse()

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
    const tokens = new Lexer.Lexer('a := 2 ** 3 ** 2').tokenize()
    const statements = new Parser.Parser(tokens).parse()
    const assignment = statements[0]

    if (assignment.type !== 'Assignment' || assignment.value.type !== 'BinaryExpression') {
      throw new Error('Estructura inesperada')
    }

    expect(assignment.value.operator).toBe('Potencia')
    expect(assignment.value.right.type).toBe('BinaryExpression')
  })
})