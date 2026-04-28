import { useMemo, useState } from 'react'
import { useInterpreter } from './hooks/useInterpreter'
import { CodeEditor } from './components/CodeEditor'
import { ConsolePanel } from './components/ConsolePanel'
import { SideNavBar } from './components/SideNavBar'
import type { DashboardMenu } from './types/ui'

type AppView = 'codigo' | 'ejecutar'

function App() {
  const [activeView, setActiveView] = useState<AppView>('codigo')
  const [activeMenu, setActiveMenu] = useState<DashboardMenu>('codigo')
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isConsoleCleared, setIsConsoleCleared] = useState(false)
  const [code, setCode] = useState('')
  const { execute, result, isExecuting } = useInterpreter()

  const handleExecute = () => {
    setIsConsoleCleared(false)
    setActiveView('ejecutar')
    setActiveMenu('consola')
    void execute(code)
  }

  const handleClearConsole = () => {
    setIsConsoleCleared(true)
  }

  const consoleLines = useMemo(() => {
    if (isConsoleCleared) {
      return ['Consola limpiada manualmente.', 'Esperando nueva ejecucion...']
    }

    if (!result) {
      return ['Sin salida por consola para esta ejecucion.']
    }

    return result.output.length > 0 ? result.output : ['Sin salida por consola para esta ejecucion.']
  }, [isConsoleCleared, result])

  const errorLines = useMemo(() => {
    if (isConsoleCleared) {
      return ['Panel de errores limpiado.']
    }

    if (!result?.error) {
      return ['Sin errores detectados.']
    }

    return [
      `${result.error.type}: ${result.error.message}`,
      result.error.line ? `Linea: ${result.error.line}` : 'Linea: no disponible',
      result.error.column ? `Columna: ${result.error.column}` : 'Columna: no disponible',
    ]
  }, [isConsoleCleared, result])

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(203,213,225,0.3),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(96,165,250,0.2),transparent_28%),linear-gradient(180deg,#faf8ff_0%,#edf1f7_100%)] font-body text-slate-900">
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-5 px-4 pb-8 pt-5 md:px-6">
        <section className="flex items-center gap-2 rounded-2xl border border-slate-200/70 bg-white/80 p-2 backdrop-blur">
          <button
            type="button"
            onClick={() => setActiveView('codigo')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeView === 'codigo' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Codigo
          </button>
          <button
            type="button"
            onClick={() => setActiveView('ejecutar')}
            className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeView === 'ejecutar' ? 'bg-blue-600 text-white' : 'text-slate-700 hover:bg-slate-100'
            }`}
          >
            Ejecutar
          </button>
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="ml-auto inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
            aria-label="Abrir menu lateral"
          >
            |||
          </button>
        </section>

        <div className="flex min-h-[calc(100vh-140px)] gap-5">
          <div className={`flex w-full flex-1 gap-5 ${activeView === 'ejecutar' ? 'md:grid md:grid-cols-2' : ''}`}>
            {activeView === 'ejecutar' ? (
              <div className="hidden md:block">
                <SideNavBar
                  activeMenu={activeMenu}
                  isMobileOpen={false}
                  onCloseMobile={() => setIsMobileDrawerOpen(false)}
                  onMenuChange={(menu) => {
                    setActiveMenu(menu)
                    setIsConsoleCleared(false)
                    setIsMobileDrawerOpen(false)
                  }}
                  onClearConsole={handleClearConsole}
                  onNewScript={() => {
                    setCode('')
                    setActiveView('codigo')
                    setActiveMenu('nuevoScript')
                    setIsConsoleCleared(false)
                    setIsMobileDrawerOpen(false)
                  }}
                />
              </div>
            ) : null}

            {activeView === 'ejecutar' ? (
              <div className="md:hidden">
                <SideNavBar
                  activeMenu={activeMenu}
                  isMobileOpen={isMobileDrawerOpen}
                  onCloseMobile={() => setIsMobileDrawerOpen(false)}
                  onMenuChange={(menu) => {
                    setActiveMenu(menu)
                    setIsConsoleCleared(false)
                    setIsMobileDrawerOpen(false)
                  }}
                  onClearConsole={handleClearConsole}
                  onNewScript={() => {
                    setCode('')
                    setActiveView('codigo')
                    setActiveMenu('nuevoScript')
                    setIsConsoleCleared(false)
                    setIsMobileDrawerOpen(false)
                  }}
                />
              </div>
            ) : null}

            <div className="flex min-h-[520px] flex-1 flex-col gap-5">
              <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
                {activeView === 'codigo' || activeMenu === 'codigo' ? (
                  <CodeEditor value={code} onChange={setCode} onExecute={handleExecute} isExecuting={isExecuting} showLineNumbers />
                ) : null}

                {activeView === 'ejecutar' && activeMenu === 'consola' ? (
                  <ConsolePanel lines={consoleLines} onClearConsole={handleClearConsole} />
                ) : null}

                {activeView === 'ejecutar' && activeMenu === 'errores' ? (
                  <ConsolePanel
                    lines={errorLines}
                    isRuntimeError={Boolean(result?.error)}
                    runtimeError={result?.error}
                    onClearConsole={handleClearConsole}
                  />
                ) : null}
              </section>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
