type TopNavBarProps = {
  isExecuting: boolean
  onClearConsole: () => void
  onRerun: () => void
  onOpenSidebar: () => void
}

export function TopNavBar({ isExecuting, onClearConsole, onRerun, onOpenSidebar }: TopNavBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/70 bg-white/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3 md:gap-8">
          <button
            type="button"
            onClick={onOpenSidebar}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
            aria-label="Abrir menu"
          >
            |||
          </button>
          <span className="text-lg font-black tracking-tight text-slate-900">pseudoWeb</span>
          <nav className="hidden items-center gap-6 md:flex">
            <a href="#" className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">
              Editor
            </a>
            <a href="#" className="border-b-2 border-blue-600 pb-1 text-sm font-bold text-blue-600">
              Resultados
            </a>
            <a href="#" className="text-sm font-semibold text-slate-500 transition hover:text-slate-900">
              Historial
            </a>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onClearConsole}
            className="rounded-full border border-blue-600 px-4 py-2 text-xs font-bold text-blue-600 transition hover:bg-blue-50"
          >
            Limpiar consola
          </button>
          <button
            type="button"
            onClick={onRerun}
            disabled={isExecuting}
            className="rounded-full bg-blue-600 px-5 py-2 text-xs font-bold text-white shadow-[0_8px_30px_rgba(37,99,235,0.28)] transition hover:bg-blue-700 disabled:cursor-wait disabled:opacity-70"
          >
            {isExecuting ? 'Ejecutando...' : 'Re-ejecutar'}
          </button>
        </div>
      </div>
    </header>
  )
}
