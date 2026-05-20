import type * as MonacoEditor from 'monaco-editor'

export const PSEUDOWEB_THEME_NAME = 'pseudoweb-theme'

let isThemeRegistered = false

export function registerPseudoWebTheme(monaco: typeof MonacoEditor): void {
  if (isThemeRegistered) return

  monaco.editor.defineTheme(PSEUDOWEB_THEME_NAME, {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '7c3aed', fontStyle: 'bold' },
      { token: 'type', foreground: '0f766e' },
      { token: 'operator', foreground: 'c2410c' },
      { token: 'number', foreground: '0369a1' },
      { token: 'number.float', foreground: '0369a1' },
      { token: 'string', foreground: '15803d' },
      { token: 'string.escape', foreground: '0f766e' },
      { token: 'comment', foreground: '64748b', fontStyle: 'italic' },
      { token: 'constant.language', foreground: 'b45309' },
      { token: 'identifier', foreground: '1e293b' },
      { token: 'invalid', foreground: 'dc2626', fontStyle: 'underline' },
      { token: 'delimiter.bracket', foreground: '334155' },
      { token: 'delimiter', foreground: '475569' },
    ],
    colors: {
      'editor.background': '#ffffff',
      'editor.foreground': '#0f172a',
      'editor.lineHighlightBackground': '#f8fafc',
      'editorLineNumber.foreground': '#94a3b8',
      'editorLineNumber.activeForeground': '#0f172a',
      'editorCursor.foreground': '#0f172a',
      'editor.selectionBackground': '#dbeafe',
      'editor.inactiveSelectionBackground': '#e2e8f0',
      'editorIndentGuide.background': '#e2e8f0',
      'editorIndentGuide.activeBackground': '#cbd5e1',
      'editorWidget.background': '#ffffff',
      'editorWidget.border': '#cbd5e1',
    },
  })

  isThemeRegistered = true
}