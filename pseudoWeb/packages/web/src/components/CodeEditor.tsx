import { useRef, useState } from 'react'
import { useCodeEditorKeyboard } from '../hooks/useCodeEditorKeyboard'

type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  isExecuting: boolean
  showLineNumbers?: boolean
}

export function CodeEditor({
  value,
  onChange,
  onExecute,
  isExecuting,
  showLineNumbers = true,
}: CodeEditorProps) {
  const lineCount = Math.max(value.split('\n').length, 1)
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => i + 1)
  const hasCode = value.trim().length > 0
  const handleKeyDown = useCodeEditorKeyboard(value, onChange)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)
  const [fontSize, setFontSize] = useState<number>(15)

  const increaseFont = () => setFontSize((s) => Math.min(28, s + 1))
  const decreaseFont = () => setFontSize((s) => Math.max(12, s - 1))

  const handleScroll = () => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

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
              onClick={decreaseFont}
              aria-label="Disminuir tamaño de fuente"
              className="text-sm font-bold px-2 py-1 text-slate-600 hover:text-slate-800"
            >
              -
            </button>
            <span className="text-[13px] font-code px-2">{fontSize}px</span>
            <button
              type="button"
              onClick={increaseFont}
              aria-label="Aumentar tamaño de fuente"
              className="text-sm font-bold px-2 py-1 text-slate-600 hover:text-slate-800"
            >
              +
            </button>
          </div>

          <button
            type="button"
            className={`inline-flex items-center gap-1 rounded-xl px-4 py-2 text-sm font-bold transition ${
              hasCode && !isExecuting
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'cursor-not-allowed bg-slate-200 text-slate-400'
            }`}
            onClick={onExecute}
            disabled={!hasCode || isExecuting}
            aria-label="Ejecutar código"
          >
            {isExecuting ? 'Ejecutando...' : 'Ejecutar'}
          </button>
        </div>
      </div>

      <div className="flex h-[560px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner xl:h-[600px] flex-nowrap">
        {showLineNumbers && (
          <div
            ref={lineNumbersRef}
            className="min-w-12 overflow-y-hidden border-r border-slate-200 bg-slate-50 px-2 py-3 text-right font-code text-[13px] leading-7 text-slate-400"
          >
            {lineNumbers.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          className="h-full w-full resize-none overflow-x-auto bg-white px-4 py-3 font-code leading-7 text-slate-800 outline-none ring-blue-600 transition focus:ring-2"
          style={{ whiteSpace: 'pre', fontSize: `${fontSize}px` }}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={handleScroll}
          spellCheck={false}
          aria-label="Editor"
        />
      </div>
    </div>
  )
}