import { useMemo } from 'react'
import { Lexer, TokenType } from '@pseudoweb/core'
import { EDITOR_THEMES, TOKEN_COLOR_GROUPS, type EditorThemeName } from '../constants/editorThemes'

export type HighlightSegment = {
  text: string
  color: string
  fontWeight?: number
}

function getLineStartOffsets(code: string) {
  const offsets = [0]

  for (let index = 0; index < code.length; index += 1) {
    if (code[index] === '\n') offsets.push(index + 1)
  }

  return offsets
}

function resolveTokenStart(code: string, _tokenLexeme: string, column: number, lineOffset: number, cursor: number) {
  // column is now consistently the start position across all scanners
  const start = lineOffset + Math.max(0, column - 1)
  return Math.max(cursor, start)
}

function getTokenColor(tokenType: TokenType, themeName: EditorThemeName) {
  const theme = EDITOR_THEMES[themeName]

  if (TOKEN_COLOR_GROUPS.keyword.has(tokenType)) return theme.keyword
  if (TOKEN_COLOR_GROUPS.type.has(tokenType)) return theme.type
  if (TOKEN_COLOR_GROUPS.operator.has(tokenType)) return theme.operator
  if (TOKEN_COLOR_GROUPS.literal.has(tokenType)) return theme.literal
  if (tokenType === TokenType.Entero || tokenType === TokenType.Real) return theme.number
  if (tokenType === TokenType.Caracter || tokenType === TokenType.Alfanumerico) return theme.string
  if (tokenType === TokenType.Comentario) return theme.comment

  return theme.identifier
}

function fallbackSegment(code: string, themeName: EditorThemeName): HighlightSegment[] {
  return [{ text: code, color: EDITOR_THEMES[themeName].identifier }]
}

export function useSyntaxHighlight(code: string, themeName: EditorThemeName) {
  return useMemo(() => {
    if (code.length === 0) return []

    try {
      const lexer = new Lexer(code)
      const tokens = lexer.tokenize()
      const lineStartOffsets = getLineStartOffsets(code)
      const segments: HighlightSegment[] = []
      let cursor = 0

      for (const token of tokens) {
        if (token.type === TokenType.EOF || token.type === TokenType.SaltoDeLinea) continue

        const lineOffset = lineStartOffsets[token.line - 1] ?? 0
        const start = resolveTokenStart(code, token.lexeme, token.column, lineOffset, cursor)
        const end = start + token.lexeme.length

        if (start > cursor) {
          segments.push({
            text: code.slice(cursor, start),
            color: EDITOR_THEMES[themeName].identifier,
          })
        }

        if (start < cursor || end <= start) continue

        segments.push({
          text: code.slice(start, end),
          color: getTokenColor(token.type, themeName),
          fontWeight: TOKEN_COLOR_GROUPS.keyword.has(token.type) ? 700 : 400,
        })

        cursor = Math.max(cursor, end)
      }

      if (cursor < code.length) {
        segments.push({
          text: code.slice(cursor),
          color: EDITOR_THEMES[themeName].identifier,
        })
      }

      return segments.length > 0 ? segments : fallbackSegment(code, themeName)
    } catch {
      return fallbackSegment(code, themeName)
    }
  }, [code, themeName])
}
