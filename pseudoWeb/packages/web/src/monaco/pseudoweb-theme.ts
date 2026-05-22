import type * as MonacoEditor from 'monaco-editor'

export const PSEUDOWEB_THEME_NAME = 'pseudoweb-theme'

let isThemeRegistered = false

export function registerPseudoWebTheme(monaco: typeof MonacoEditor): void {
  if (isThemeRegistered) return

  monaco.editor.defineTheme(PSEUDOWEB_THEME_NAME, {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'keyword', foreground: '569CD6', fontStyle: 'bold' },
      { token: 'type', foreground: '4EC9B0' },
      { token: 'operator', foreground: 'D4D4D4' },
      { token: 'number', foreground: 'B5CEA8' },
      { token: 'number.float', foreground: 'B5CEA8' },
      { token: 'string', foreground: 'CE9178' },
      { token: 'string.escape', foreground: '4EC9B0' },
      { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
      { token: 'constant.language', foreground: '4FC1FF' },
      { token: 'identifier', foreground: 'DCDCDC' },
      { token: 'invalid', foreground: 'F44747', fontStyle: 'underline' },
      { token: 'delimiter.bracket', foreground: 'D4D4D4' },
      { token: 'delimiter', foreground: 'D4D4D4' },
    ],
    colors: {
      'editor.background': '#1e1e1e',
      'editor.foreground': '#d4d4d4',
      'editor.lineHighlightBackground': '#2a2a2a',
      'editorLineNumber.foreground': '#858585',
      'editorLineNumber.activeForeground': '#d4d4d4',
      'editorCursor.foreground': '#aeafad',
      'editor.selectionBackground': '#264f78',
      'editor.inactiveSelectionBackground': '#3a3d41',
      'editorIndentGuide.background': '#2b2b2b',
      'editorIndentGuide.activeBackground': '#404040',
      'editorWidget.background': '#252526',
      'editorWidget.border': '#454545',
    },
  })

  isThemeRegistered = true
}