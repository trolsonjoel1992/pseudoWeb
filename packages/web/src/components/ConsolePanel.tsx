import type { ExecutionError } from '../types'

type ConsolePanelProps = {
  lines: string[]
  isRuntimeError?: boolean
  runtimeError?: ExecutionError
  onClearConsole: () => void
}

export function ConsolePanel({ lines, isRuntimeError = false, runtimeError, onClearConsole }: ConsolePanelProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Salida</p>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Consola</h2>
        </div>
        <button
          type="button"
          onClick={onClearConsole}
          className="rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 transition hover:bg-slate-100"
        >
          Limpiar
        </button>
      </div>

      <div
        className="relative min-h-[320px] flex-1 overflow-y-auto rounded-xl bg-[#191b24] p-4 font-code text-[14px] leading-7 text-slate-200 shadow-inner"
        role="status"
        aria-live="polite"
      >
        {lines.length > 0 ? (
          <div className="space-y-1">
            {lines.map((line, index) => (
              <p key={`${index}-${line}`}>
                <span className="mr-2 text-blue-400">&gt;</span>
                {line}
              </p>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">La salida aparecera aqui cuando ejecutes el codigo.</p>
        )}

        {isRuntimeError && runtimeError ? (
          <p className="mt-3 rounded-md border border-rose-900/60 bg-rose-950/40 px-3 py-2 text-sm text-rose-200">
            {runtimeError.type}: {runtimeError.message}
          </p>
        ) : null}

        <div className="mt-2 inline-block h-4 w-2 animate-pulse bg-blue-500 align-middle" aria-hidden="true" />
      </div>
    </div>
  )
}