import { useMemo, useState, useEffect } from 'react'
import { useInterpreter } from './hooks/useInterpreter'
import { CodeEditor } from './components/CodeEditor'
import { ConsolePanel } from './components/ConsolePanel'
import { SideNavBar } from './components/SideNavBar'
import type { DashboardMenu } from './types/ui'

function App() {
  const [activeMenu, setActiveMenu] = useState<DashboardMenu>('codigo')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isConsoleCleared, setIsConsoleCleared] = useState(false)
  const [consoleInput, setConsoleInput] = useState('')
  const [code, setCode] = useState('')
  const [fontSize, setFontSize] = useState(15)
  const { execute, submitInput, inputRequest, outputLines, result, isExecuting, sequenceOutputs } = useInterpreter()

  const handleExecute = () => {
    setIsConsoleCleared(false)
    setActiveMenu('consola')
    setConsoleInput('')
    void execute(code)
  }

  const handleSubmitInput = () => {
    if (!inputRequest) return

    const accepted = submitInput(consoleInput)
    if (accepted) {
      setConsoleInput('')
    }
  }

  const handleClearConsole = () => {
    setConsoleInput('')
    setIsConsoleCleared(true)
  }

  const increaseFontSize = () => {
    setFontSize((currentSize) => Math.min(28, currentSize + 1))
  }

  const decreaseFontSize = () => {
    setFontSize((currentSize) => Math.max(12, currentSize - 1))
  }

  // Si hay error en el resultado de la ejecución, redirigir siempre a la pantalla de errores
  useEffect(() => {
    if (result && result.success === false) {
      setActiveMenu('errores')
    }
  }, [result])

  // Datos de consola y errores
  const consoleLines = useMemo(() => {
    if (isConsoleCleared)
      return ['Consola limpiada manualmente.', 'Esperando nueva ejecución...']
    if (outputLines.length > 0) return outputLines
    if (isExecuting) return ['Ejecución en curso...']
    if (!result)
      return ['Sin salida por consola para esta ejecución.']
    return result.output.length > 0 ? result.output : ['Sin salida por consola para esta ejecución.']
  }, [isConsoleCleared, isExecuting, outputLines, result])

  const errorLines = useMemo(() => {
    if (isConsoleCleared) return ['Panel de errores limpiado.']
    if (!result?.error) return ['Sin errores detectados.']
    return [
      `${result.error.type}: ${result.error.message}`,
      result.error.line ? `Línea: ${result.error.line}` : 'Línea: no disponible',
      result.error.column ? `Columna: ${result.error.column}` : 'Columna: no disponible',
    ]
  }, [isConsoleCleared, result])

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(203,213,225,0.3),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(96,165,250,0.2),transparent_28%),linear-gradient(180deg,#faf8ff_0%,#edf1f7_100%)]">
      {/* Barra superior fija */}
      <header className="flex items-center gap-3 border-b border-slate-200/70 bg-white/80 px-4 py-3 backdrop-blur flex-shrink-0">
        {/* Botón hamburguesa escritorio: colapsa/expande sidebar */}
        <button
          type="button"
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden md:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition hover:bg-slate-100"
          aria-label={isSidebarCollapsed ? 'Expandir menú' : 'Contraer menú'}
        >
          ☰
        </button>

        {/* Botón hamburguesa móvil: abre drawer */}
        <button
          type="button"
          onClick={() => setIsMobileDrawerOpen(true)}
          className="inline-flex md:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600"
          aria-label="Abrir menú lateral"
        >
          ☰
        </button>

        <span className="text-sm font-bold text-slate-700">pseudoWeb</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <div
          className={`hidden md:block h-full transition-all duration-300 ${
            isSidebarCollapsed ? 'w-0 overflow-hidden' : 'w-64'
          }`}
        >
          <SideNavBar
            activeMenu={activeMenu}
            isMobileOpen={false}
            onCloseMobile={() => setIsMobileDrawerOpen(false)}
            onMenuChange={(menu) => {
              setActiveMenu(menu)
              setIsConsoleCleared(false)
              setIsMobileDrawerOpen(false)
            }}
            onNewScript={() => {
              setCode('')
              setActiveMenu('codigo')
              setIsConsoleCleared(false)
              setIsMobileDrawerOpen(false)
            }}
          />
        </div>

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
            onNewScript={() => {
              setCode('')
              setActiveMenu('codigo')
              setIsConsoleCleared(false)
              setIsMobileDrawerOpen(false)
            }}
          />
        </div>

        {/* Contenido dinámico */}
        <section className="flex-1 overflow-hidden p-4 md:p-5">
          <div className="h-full flex flex-col rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
            {activeMenu === 'codigo' && (
              <CodeEditor
                value={code}
                onChange={setCode}
                onExecute={handleExecute}
                isExecuting={isExecuting}
                fontSize={fontSize}
                onIncreaseFontSize={increaseFontSize}
                onDecreaseFontSize={decreaseFontSize}
                runtimeError={result?.error ?? null}
              />
            )}
            {activeMenu === 'consola' && (
              <ConsolePanel
                lines={consoleLines}
                sequences={sequenceOutputs}
                inputValue={consoleInput}
                onInputChange={setConsoleInput}
                onSubmitInput={handleSubmitInput}
                isAwaitingInput={Boolean(inputRequest)}
                onClearConsole={handleClearConsole}
                onRestart={handleExecute}
              />
            )}
            {activeMenu === 'errores' && (
              <ConsolePanel
                lines={errorLines}
                isRuntimeError={Boolean(result?.error)}
                runtimeError={result?.error}
                inputValue={consoleInput}
                onInputChange={setConsoleInput}
                onSubmitInput={handleSubmitInput}
                isAwaitingInput={Boolean(inputRequest)}
                onClearConsole={handleClearConsole}
                onRestart={handleExecute}
              />
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

export default App