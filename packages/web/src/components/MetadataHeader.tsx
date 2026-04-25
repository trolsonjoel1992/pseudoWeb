import { StatusBadge } from './StatusBadge'

type MetadataHeaderProps = {
  status: 'success' | 'warning' | 'error'
  statusLabel: string
  executionTime: string
}

export function MetadataHeader({ status, statusLabel, executionTime }: MetadataHeaderProps) {
  return (
    <section className="rounded-2xl border border-slate-200/70 bg-white/70 px-4 py-4 shadow-[0_12px_35px_rgba(15,23,42,0.07)] backdrop-blur md:px-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-5">
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Estado</p>
            <StatusBadge status={status} label={statusLabel} />
          </div>
          <div className="h-8 w-px bg-slate-300" />
          <div>
            <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Tiempo de ejecucion</p>
            <p className="font-code text-base font-bold text-blue-700">{executionTime}</p>
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <div className="h-10 w-10 rounded-full bg-[linear-gradient(140deg,#0f172a,#2563eb)] ring-2 ring-white" />
          <div>
            <p className="text-xs font-semibold text-slate-700">Usuario local</p>
            <p className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-400">Sesion activa</p>
          </div>
        </div>
      </div>
    </section>
  )
}
