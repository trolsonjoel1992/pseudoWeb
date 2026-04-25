import { useMemo, useState } from 'react'
import { useInterpreter } from './hooks/useInterpreter'
import { CodeEditor } from './components/CodeEditor'
import { ConsolePanel } from './components/ConsolePanel'
import { VariablesPanel } from './components/VariablesPanel'
import { TopNavBar } from './components/TopNavBar'
import { SideNavBar } from './components/SideNavBar'
import { MetadataHeader } from './components/MetadataHeader'
import { FooterBar } from './components/FooterBar'
import type { DashboardMenu, MenuViewData, VariableItem } from './types/ui'

const DASHBOARD_MOCK_DATA: Record<DashboardMenu, MenuViewData> = {
  codigo: {
    statusLabel: 'Codigo listo',
    consoleLines: [
      '[pseudoWeb] Cargando fragmento de codigo fuente',
      'Codigo principal: function analizarDatos(arr) { return arr.reduce((a,b)=>a+b,0) }',
      'Variables de entorno cargadas: modo=produccion, idioma=es',
      'Analisis estatico completado sin advertencias',
      'Script listo para ejecucion personalizada.',
    ],
    variables: [
      { name: 'codigoFuente', value: 'algoritmo_v3.js', type: 'STRING' },
      { name: 'lenguaje', value: 'JavaScript/ES2022', type: 'STRING' },
      { name: 'optimizado', value: true, type: 'BOOL' },
      { name: 'complejidad', value: 'O(n log n)', type: 'STRING' },
    ],
  },
  paso: {
    statusLabel: 'Paso a paso (demo)',
    consoleLines: [
      '[Paso 1] Inicializacion del motor',
      '[Paso 2] Validacion de entorno',
      '[Paso 3] Ejecucion de ciclo principal',
      '[Paso 4] Calculo de resultados intermedios',
      '[Paso 5] Finalizacion exitosa -> resultado total: 842.12',
      'Funcion en desarrollo: debugger paso a paso real.',
    ],
    variables: [
      { name: 'pasoActual', value: 5, type: 'INT' },
      { name: 'porcentajeCompletado', value: 100, type: 'INT' },
      { name: 'estadoPaso', value: 'completado', type: 'STRING' },
      { name: 'debuggerDisponible', value: false, type: 'BOOL' },
    ],
  },
  errores: {
    statusLabel: 'Advertencias detectadas',
    consoleLines: [
      '[Advertencia] Variable timeout no declarada, usando valor por defecto',
      '[Error leve] Fallo de cache secundaria, reintentando',
      'Reintento 2/3 exitoso',
      '[Excepcion capturada] TypeError en promesa',
      'Consolidacion: 2 errores controlados, sistema estable.',
    ],
    variables: [
      { name: 'contadorErrores', value: 2, type: 'INT' },
      { name: 'ultimoError', value: 'TypeError: fallo en promesa', type: 'STRING' },
      { name: 'nivelCriticidad', value: 'media', type: 'STRING' },
      { name: 'recuperacionOK', value: true, type: 'BOOL' },
    ],
  },
  config: {
    statusLabel: 'Configuracion cargada',
    consoleLines: [
      'Cargando panel de configuracion del dashboard',
      'Tema actual: sistema / notificaciones activadas',
      'Fuente de datos: API mock (simulacion local)',
      'Modo desarrollador: false',
      'Funcion en desarrollo: guardado persistente de preferencias.',
    ],
    variables: [
      { name: 'temaUI', value: 'claro/oscuro auto', type: 'STRING' },
      { name: 'notificaciones', value: true, type: 'BOOL' },
      { name: 'autoguardado', value: true, type: 'BOOL' },
      { name: 'modoDebug', value: false, type: 'BOOL' },
    ],
  },
  soporte: {
    statusLabel: 'Soporte activo',
    consoleLines: [
      'Centro de soporte tecnico - pseudoWeb',
      'Documentacion: docs.pseudoweb.dev/es',
      'Contacto: soporte@pseudoweb.dev',
      'Horario: Lunes a Viernes 9h - 18h (GMT-3)',
      'Funcion en desarrollo: chat en linea integrado.',
    ],
    variables: [
      { name: 'emailSoporte', value: 'ayuda@pseudoweb.dev', type: 'STRING' },
      { name: 'ticketsAbiertos', value: 0, type: 'INT' },
      { name: 'versionDocs', value: '2.1.0', type: 'STRING' },
      { name: 'slaDisponible', value: true, type: 'BOOL' },
    ],
  },
  nuevoScript: {
    statusLabel: 'Nuevo script listo',
    consoleLines: [
      'Creando nuevo script en espanol',
      'Plantilla base_script generada correctamente',
      'Editor listo para modificar el codigo',
      'Sugerencia: define una funcion principal main()',
    ],
    variables: [
      { name: 'nombreScript', value: 'sin_titulo.psc', type: 'STRING' },
      { name: 'fechaCreacion', value: '2026-04-25', type: 'STRING' },
      { name: 'librerias', value: 0, type: 'INT' },
      { name: 'autoria', value: 'usuario_local', type: 'STRING' },
    ],
  },
}

function getVariableType(value: unknown): VariableItem['type'] {
  if (Array.isArray(value)) {
    return 'ARRAY'
  }

  if (typeof value === 'boolean') {
    return 'BOOL'
  }

  if (typeof value === 'number') {
    return Number.isInteger(value) ? 'INT' : 'FLOAT'
  }

  if (typeof value === 'string') {
    return 'STRING'
  }

  return 'UNKNOWN'
}

function App() {
  const [activeMenu, setActiveMenu] = useState<DashboardMenu>('codigo')
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)
  const [isConsoleCleared, setIsConsoleCleared] = useState(false)
  const [code, setCode] = useState(`Entero a, b
a := 4
b := 6
Si a < b Entonces
  Escribir("a es menor")
Sino
  Escribir("a es mayor")
FinSi
Escribir(a + b)`)
  const { execute, result, isExecuting } = useInterpreter()

  const handleExecute = () => {
    setIsConsoleCleared(false)
    void execute(code)
  }

  const handleClearConsole = () => {
    setIsConsoleCleared(true)
  }

  const coreVariables = useMemo<VariableItem[]>(() => {
    const runtimeVars = result?.variables ?? {}
    return Object.entries(runtimeVars).map(([name, value]) => ({
      name,
      value,
      type: getVariableType(value),
    }))
  }, [result?.variables])

  const viewData = useMemo<MenuViewData>(() => {
    if (isConsoleCleared) {
      return {
        ...DASHBOARD_MOCK_DATA[activeMenu],
        consoleLines: ['Consola limpiada manualmente.', 'Esperando nueva interaccion...'],
      }
    }

    if (activeMenu === 'codigo' && result) {
      return {
        statusLabel: result.success ? 'Exito' : 'Error',
        consoleLines: result.output.length > 0 ? result.output : ['Sin salida por consola para esta ejecucion.'],
        variables: coreVariables,
      }
    }

    return DASHBOARD_MOCK_DATA[activeMenu]
  }, [activeMenu, coreVariables, isConsoleCleared, result])

  const status: 'success' | 'warning' | 'error' = result
    ? result.success
      ? 'success'
      : 'error'
    : activeMenu === 'errores'
      ? 'warning'
      : 'success'

  const executionMs = result ? `${Math.round(result.executionTime)}ms` : `${Math.floor(Math.random() * 130 + 45)}ms`

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_10%_0%,rgba(203,213,225,0.3),transparent_35%),radial-gradient(circle_at_100%_0%,rgba(96,165,250,0.2),transparent_28%),linear-gradient(180deg,#faf8ff_0%,#edf1f7_100%)] font-body text-slate-900">
      <TopNavBar
        isExecuting={isExecuting}
        onClearConsole={handleClearConsole}
        onRerun={handleExecute}
        onOpenSidebar={() => setIsMobileDrawerOpen(true)}
      />

      <main className="mx-auto flex w-full max-w-[1600px] gap-5 px-4 pb-16 pt-5 md:px-6">
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
            setActiveMenu('nuevoScript')
            setIsConsoleCleared(false)
            setIsMobileDrawerOpen(false)
          }}
        />

        <div className="flex min-h-[calc(100vh-130px)] flex-1 flex-col gap-5">
          <MetadataHeader status={status} statusLabel={viewData.statusLabel} executionTime={executionMs} />

          <div className="grid flex-1 grid-cols-1 gap-5 xl:grid-cols-2">
            <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-5 xl:col-span-2">
              <CodeEditor value={code} onChange={setCode} onExecute={handleExecute} isExecuting={isExecuting} />
            </section>

            <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
              <ConsolePanel
                lines={viewData.consoleLines}
                isRuntimeError={Boolean(result?.error) && activeMenu === 'codigo'}
                runtimeError={result?.error}
                onClearConsole={handleClearConsole}
              />
            </section>

            <section className="rounded-2xl border border-slate-200/70 bg-white/70 p-4 shadow-[0_20px_50px_rgba(15,23,42,0.08)] backdrop-blur md:p-5">
              <VariablesPanel variables={viewData.variables} />
            </section>
          </div>
        </div>
      </main>

      <FooterBar />
    </div>
  )
}

export default App
