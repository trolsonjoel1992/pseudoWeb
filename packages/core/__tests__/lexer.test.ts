import { describe, expect, it } from 'vitest'
import { Lexer } from '../src/lexer/lexer'
import { TokenType } from '../src/lexer/tokenTypes'

describe('Lexer', () => {
  it('tokeniza declaraciones y operadores básicos', () => {
    const tokens = new Lexer.Lexer('a, b : Entero\na := 4 + 2').tokenize()

    expect(tokens.map((token) => token.type)).toContain(TokenType.Identificador)
    expect(tokens.some((token) => token.type === TokenType.Asignacion)).toBe(true)
    expect(tokens.some((token) => token.type === TokenType.Suma)).toBe(true)
  })

  it('reconoce cadenas y comparaciones compuestas', () => {
    const tokens = new Lexer.Lexer('Escribir("hola")\nSi a <= 10 Entonces').tokenize()

    expect(tokens.some((token) => token.type === TokenType.Alfanumerico)).toBe(true)
    expect(tokens.some((token) => token.type === TokenType.MenorIgual)).toBe(true)
    expect(tokens.some((token) => token.type === TokenType.Si)).toBe(true)
  })

  it('interpreta escapes en cadenas', () => {
    const tokens = new Lexer.Lexer('Escribir("hola\\n\tmundo")').tokenize()
    const literal = tokens.find((token) => token.type === TokenType.Alfanumerico)?.literal

    expect(literal).toBe('hola\n\tmundo')
  })

  it('prioriza rango sobre punto decimal en bucles', () => {
    const tokens = new Lexer.Lexer('Para i := 1 .. 3 Hacer').tokenize()

    expect(tokens.some((token) => token.type === TokenType.Rango)).toBe(true)
  })

  it('falla con comentario sin cerrar', () => {
    expect(() => new Lexer.Lexer('/* comentario').tokenize()).toThrow('Comentario sin cerrar')
  })
})