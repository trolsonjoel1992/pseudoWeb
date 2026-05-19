import { TokenType } from '@pseudoweb/core'

export type EditorThemeName = 'quiet' | 'githubDark'

export type EditorTheme = {
  name: EditorThemeName
  label: string
  surface: string
  surfaceSoft: string
  border: string
  text: string
  mutedText: string
  caret: string
  selection: string
  selectionText: string
  keyword: string
  type: string
  operator: string
  number: string
  string: string
  comment: string
  literal: string
  identifier: string
}

export const EDITOR_THEMES: Record<EditorThemeName, EditorTheme> = {
  quiet: {
    name: 'quiet',
    label: 'Quiet Color',
    surface: '#ffffff',
    surfaceSoft: '#f8fafc',
    border: '#dbe4ef',
    text: '#0f172a',
    mutedText: '#64748b',
    caret: '#0f172a',
    selection: '#dbeafe',
    selectionText: '#0f172a',
    keyword: '#c0abe4',
    type: '#0f766e',
    operator: '#ea580c',
    number: '#0891b2',
    string: '#15803d',
    comment: '#4a93fa',
    literal: '#b45309',
    identifier: '#334155',
  },
  githubDark: {
    name: 'githubDark',
    label: 'GitHub Dark Default',
    surface: '#0d1117',
    surfaceSoft: '#161b22',
    border: '#30363d',
    text: '#c9d1d9',
    mutedText: '#8b949e',
    caret: '#c9d1d9',
    selection: '#264f78',
    selectionText: '#f0f6fc',
    keyword: '#ff7b72',
    type: '#79c0ff',
    operator: '#d2a8ff',
    number: '#a5d6ff',
    string: '#a5d6ff',
    comment: '#8b949e',
    literal: '#ffa657',
    identifier: '#c9d1d9',
  },
}

export const TOKEN_COLOR_GROUPS = {
  keyword: new Set<TokenType>([
    TokenType.Accion,
    TokenType.FinAccion,
    TokenType.Si,
    TokenType.SiNo,
    TokenType.FinSi,
    TokenType.Mientras,
    TokenType.FinMientras,
    TokenType.Para,
    TokenType.FinPara,
    TokenType.Repetir,
    TokenType.Hasta,
    TokenType.HastaQue,
    TokenType.Segun,
    TokenType.Hacer,
    TokenType.Otro,
    TokenType.FinSegun,
    TokenType.FinFuncion,
    TokenType.FinProcedimiento,
    TokenType.Leer,
    TokenType.Escribir,
    TokenType.Funcion,
    TokenType.Procedimiento,
    TokenType.Entonces,
    TokenType.ES,
    TokenType.Ambiente,
    TokenType.Proceso,
  ]),
  type: new Set<TokenType>([TokenType.Entero, TokenType.Real, TokenType.Caracter, TokenType.Logico, TokenType.Alfanumerico]),
  operator: new Set<TokenType>([
    TokenType.Asignacion,
    TokenType.Suma,
    TokenType.Resta,
    TokenType.Multiplicacion,
    TokenType.Division,
    TokenType.Div,
    TokenType.Mod,
    TokenType.Potencia,
    TokenType.Igual,
    TokenType.Distinto,
    TokenType.Menor,
    TokenType.Mayor,
    TokenType.MenorIgual,
    TokenType.MayorIgual,
    TokenType.Y,
    TokenType.O,
    TokenType.No,
    TokenType.ParentesisIzquierdo,
    TokenType.ParentesisDerecho,
    TokenType.DosPuntos,
    TokenType.Coma,
    TokenType.Rango,
    TokenType.PuntoYComa,
  ]),
  literal: new Set<TokenType>([TokenType.Verdadero, TokenType.Falso]),
}
