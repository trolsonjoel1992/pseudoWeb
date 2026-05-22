import { useEffect, useRef } from 'react'
import type { ExecutionError } from '../types'

type ConsolePanelProps = {
  lines: string[]
  sequences?: Record<string, { elements: unknown[]; elementType?: string | null }>
  inputValue: string
  onInputChange: (value: string) => void
  onSubmitInput: () => void
  isAwaitingInput: boolean
  isRuntimeError?: boolean
  runtimeError?: ExecutionError
  onClearConsole: () => void
  onRestart?: () => void
}

export function ConsolePanel({
  lines,
  sequences = {},
  inputValue,
  onInputChange,
  onSubmitInput,
  isAwaitingInput,
  isRuntimeError = false,
  runtimeError,
  onClearConsole,
  onRestart,
}: ConsolePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const consoleRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (isAwaitingInput) {
      inputRef.current?.focus()
    }
  }, [isAwaitingInput])

  useEffect(() => {
    if (consoleRef.current) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [lines, isAwaitingInput])

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Salida</p>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Consola</h2>
        </div>
        <div className="flex items-center gap-2">
          {onRestart ? (
            <button
              type="button"
              onClick={onRestart}
              className="rounded-full border border-slate-300 bg-slate-50 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-700 transition hover:bg-slate-100"
            >
              Reiniciar
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('sequence-output-panel')
              if (el) el.classList.toggle('hidden')
            }}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 transition hover:bg-slate-100"
          >
            Mostrar salida
          </button>
          <button
            type="button"
            onClick={onClearConsole}
            className="rounded-full border border-slate-300 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-slate-600 transition hover:bg-slate-100"
          >
            Limpiar
          </button>
        </div>
      </div>

      <div
        ref={consoleRef}
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

        {isAwaitingInput ? (
          <div className="mt-3 flex items-center gap-2 text-slate-100">
            <span className="text-blue-400">&gt;</span>
            <input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  event.preventDefault()
                  onSubmitInput()
                }
              }}
              autoComplete="off"
              spellCheck={false}
              className="w-full bg-transparent font-code text-[14px] leading-7 text-slate-100 outline-none placeholder:text-slate-600"
              aria-label="Entrada de consola"
            />
            <span className="select-none text-slate-100 animate-pulse" aria-hidden="true">
              _
            </span>
          </div>
        ) : null}

        {/* Sequence output panel (hidden by default) */}
        <div id="sequence-output-panel" className="mt-4 hidden">
          {Object.keys(sequences).length === 0 ? (
            <p className="text-slate-400">No hay secuencias generadas en esta ejecución.</p>
          ) : (
            <div className="space-y-2">
                {Object.entries(sequences).map(([name, info]) => (
                  <div key={name} className="break-words rounded-md border border-slate-700/40 bg-slate-900/20 px-3 py-2 text-sm text-slate-100">
                    <div className="mb-1 flex items-center gap-2">
                      <div className="text-xs text-slate-300">{name}</div>
                      <div className="ml-1 inline-flex items-center rounded-full bg-amber-600/90 px-2 py-0.5 text-[11px] font-semibold text-white">
                        Secuencia{info?.elementType ? ` de ${info.elementType}` : ''}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {info.elements.map((el, i) => (
                        <div
                          key={i}
                          className="min-w-0 rounded border border-slate-600/70 bg-slate-800 px-2 py-1 text-[13px] text-slate-100"
                        >
                          {String(el)}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}