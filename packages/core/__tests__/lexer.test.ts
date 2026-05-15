import { describe, expect, it } from 'vitest'
import { Lexer } from '../src/lexer'
import { TokenType } from '../src/lexer/types'

describe('Lexer', () => {
  it('tokeniza declaraciones y operadores básicos', () => {
    const tokens = new Lexer('a, b : Entero\na := 4 + 2').tokenize()

    expect(tokens.map((token) => token.type)).toContain(TokenType.Identificador)
    expect(tokens.some((token) => token.type === TokenType.Asignacion)).toBe(true)
    expect(tokens.some((token) => token.type === TokenType.Suma)).toBe(true)
  })

  it('reconoce cadenas y comparaciones compuestas', () => {
    const tokens = new Lexer('Escribir("hola")\nSi a <= 10 Entonces').tokenize()

    expect(tokens.some((token) => token.type === TokenType.Alfanumerico)).toBe(true)
    expect(tokens.some((token) => token.type === TokenType.MenorIgual)).toBe(true)
    expect(tokens.some((token) => token.type === TokenType.Si)).toBe(true)
  })

  it('interpreta escapes en cadenas', () => {
    const tokens = new Lexer('Escribir("hola\\n\tmundo")').tokenize()
    const literal = tokens.find((token) => token.type === TokenType.Alfanumerico)?.literal

    expect(literal).toBe('hola\n\tmundo')
  })

  it('prioriza rango sobre punto decimal en bucles', () => {
    const tokens = new Lexer('Para i := 1 .. 3 Hacer').tokenize()

    expect(tokens.some((token) => token.type === TokenType.Rango)).toBe(true)
  })

  it('reconoce Hasta como palabra reservada del Para', () => {
    const tokens = new Lexer('Para i := 1 Hasta 3 Hacer').tokenize()

    expect(tokens.some((token) => token.type === TokenType.Hasta)).toBe(true)
    expect(tokens.some((token) => token.type === TokenType.Hacer)).toBe(true)
  })

  it('falla con comentario sin cerrar', () => {
    expect(() => new Lexer('/* comentario').tokenize()).toThrow('Comentario de bloque sin cerrar')
  })

  it('reconoce DIV/MOD en mayúscula y rechaza minúscula como operador', () => {
    const tokensUpper = new Lexer('a := 10 DIV 3\nb := 10 MOD 3').tokenize()
    expect(tokensUpper.some((token) => token.type === TokenType.Div)).toBe(true)
    expect(tokensUpper.some((token) => token.type === TokenType.Mod)).toBe(true)

    const tokensLower = new Lexer('a := 10 div 3').tokenize()
    expect(tokensLower.some((token) => token.type === TokenType.Div)).toBe(false)
    expect(tokensLower.some((token) => token.lexeme === 'div' && token.type === TokenType.Identificador)).toBe(true)
  })
})