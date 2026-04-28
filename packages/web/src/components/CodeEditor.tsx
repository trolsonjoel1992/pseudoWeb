type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  isExecuting: boolean
  showLineNumbers?: boolean
}

export function CodeEditor({ value, onChange, onExecute, isExecuting, showLineNumbers = true }: CodeEditorProps) {
  const lineCount = Math.max(value.split('\n').length, 1)
  const lineNumbers = Array.from({ length: lineCount }, (_, index) => index + 1)

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">pseudoWeb</p>
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-70"
          onClick={onExecute}
          disabled={isExecuting}
          aria-label="Ejecutar codigo"
        >
          {isExecuting ? '...' : '>_'}
        </button>
      </div>

      <div className="flex h-[320px] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner xl:h-[420px]">
        {showLineNumbers ? (
          <div className="min-w-12 border-r border-slate-200 bg-slate-50 px-2 py-3 text-right font-code text-[13px] leading-7 text-slate-400">
            {lineNumbers.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
        ) : null}

        <textarea
          className="h-full w-full resize-none bg-white px-4 py-3 font-code text-[15px] leading-7 text-slate-800 outline-none ring-blue-600 transition focus:ring-2"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          spellCheck={false}
          aria-label="Editor"
        />
      </div>
    </div>
  )
}