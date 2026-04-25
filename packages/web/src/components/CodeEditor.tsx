type CodeEditorProps = {
  value: string
  onChange: (value: string) => void
  onExecute: () => void
  isExecuting: boolean
}

export function CodeEditor({ value, onChange, onExecute, isExecuting }: CodeEditorProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Editor</p>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Pseudocodigo</h2>
        </div>
        <button
          type="button"
          className="rounded-full border border-slate-300 px-4 py-2 text-xs font-bold text-slate-700 transition hover:bg-slate-100 disabled:cursor-wait disabled:opacity-70"
          onClick={onExecute}
          disabled={isExecuting}
        >
          {isExecuting ? 'Procesando...' : 'Ejecutar desde editor'}
        </button>
      </div>

      <textarea
        className="h-[260px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 font-code text-[15px] leading-7 text-slate-800 shadow-inner outline-none ring-blue-600 transition focus:ring-2 xl:h-[340px]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        aria-label="Editor de pseudocódigo"
      />
    </div>
  )
}