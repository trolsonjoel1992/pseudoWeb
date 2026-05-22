import { useEffect, useRef } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import type * as MonacoEditor from 'monaco-editor'
import { PSEUDOWEB_LANGUAGE_ID, registerPseudoWebLanguage } from '../monaco/pseudoweb-language'
import { PSEUDOWEB_THEME_NAME, registerPseudoWebTheme } from '../monaco/pseudoweb-theme'
import type { ExecutionError } from '../types'

type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  isExecuting: boolean
  fontSize: number
  onIncreaseFontSize: () => void
  onDecreaseFontSize: () => void
  runtimeError: ExecutionError | null
}

export function CodeEditor({
  value,
  onChange,
  onExecute,
  isExecuting,
  fontSize,
  onIncreaseFontSize,
  onDecreaseFontSize,
  runtimeError,
}: CodeEditorProps) {
  const hasCode = value.trim().length > 0
  const editorRef = useRef<MonacoEditor.editor.IStandaloneCodeEditor | null>(null)
  const monacoRef = useRef<typeof MonacoEditor | null>(null)
  const onExecuteRef = useRef(onExecute)

  useEffect(() => {
    onExecuteRef.current = onExecute
  }, [onExecute])

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor
    monacoRef.current = monaco
    registerPseudoWebLanguage(monaco)
    registerPseudoWebTheme(monaco)
    monaco.editor.setTheme(PSEUDOWEB_THEME_NAME)

    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onExecuteRef.current()
    })
  }

  useEffect(() => {
    const editor = editorRef.current
    const monaco = monacoRef.current

    if (!editor || !monaco) return

    const model = editor.getModel()
    if (!model) return

    if (!runtimeError?.line) {
      monaco.editor.setModelMarkers(model, PSEUDOWEB_LANGUAGE_ID, [])
      return
    }

    monaco.editor.setModelMarkers(model, PSEUDOWEB_LANGUAGE_ID, [
      {
        startLineNumber: runtimeError.line,
        endLineNumber: runtimeError.line,
        startColumn: runtimeError.column ?? 1,
        endColumn: 999,
        message: runtimeError.message,
        severity: monaco.MarkerSeverity.Error,
      },
    ])
  }, [runtimeError])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Entrada</p>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Editor</h2>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex items-center gap-1 rounded-md bg-slate-50 px-2 py-1">
            <button
              type="button"
              onClick={onDecreaseFontSize}
              aria-label="Disminuir tamaño de fuente"
              className="text-sm font-bold px-2 py-1 text-slate-600 hover:text-slate-800"
            >
              -
            </button>
            <span className="text-[13px] font-code px-2">{fontSize}px</span>
            <button
              type="button"
              onClick={onIncreaseFontSize}
              aria-label="Aumentar tamaño de fuente"
              className="text-sm font-bold px-2 py-1 text-slate-600 hover:text-slate-800"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className={`inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold transition ${
              hasCode && !isExecuting ? 'run-button' : 'cursor-not-allowed bg-slate-200 text-slate-400'
            }`}
            onClick={onExecute}
            disabled={!hasCode || isExecuting}
            aria-label="Ejecutar código"
          >
            {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
          </button>
        </div>
      </div>

      <div
        className="flex flex-1 overflow-hidden rounded-xl shadow-inner border border-slate-200/70 bg-white flex-nowrap"
      >
        <Editor
          className="h-full w-full"
          loading={<div className="flex h-full items-center justify-center text-sm text-slate-500">Cargando editor...</div>}
          language={PSEUDOWEB_LANGUAGE_ID}
          theme={PSEUDOWEB_THEME_NAME}
          value={value}
          onMount={handleMount}
          onChange={(nextValue) => onChange(nextValue ?? '')}
          options={{
            fontSize,
            fontFamily: 'Cascadia Code, Consolas, monospace',
            fontLigatures: false,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            renderLineHighlight: 'line',
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            bracketPairColorization: { enabled: true },
            overviewRulerBorder: false,
            smoothScrolling: true,
          }}
          aria-label="Editor"
        />
      </div>
    </div>
  )
}