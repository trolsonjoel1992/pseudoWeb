import type { VariableItem } from '../types/ui'
import { TypeBadge } from './TypeBadge'

type VariablesPanelProps = {
  variables: VariableItem[]
}

export function VariablesPanel({ variables }: VariablesPanelProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">Estado</p>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900">Variables</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 transition hover:bg-slate-100"
          >
            Buscar
          </button>
          <button
            type="button"
            className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500 transition hover:bg-slate-100"
          >
            Filtrar
          </button>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.1em] text-slate-500">
            {variables.length} en scope
          </span>
        </div>
      </div>

      {variables.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Nombre</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Valor</th>
                <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] text-slate-500">Tipo</th>
              </tr>
            </thead>
            <tbody>
              {variables.map((item) => (
                <tr key={item.name} className="border-b border-slate-100 transition hover:bg-blue-50/40">
                  <td className="px-4 py-3 font-code text-sm font-bold text-blue-700">{item.name}</td>
                  <td className="px-4 py-3 font-code text-sm text-slate-700">{String(item.value)}</td>
                  <td className="px-4 py-3">
                    <TypeBadge type={item.type} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          Aun no hay variables definidas para esta vista.
        </p>
      )}

      <button
        type="button"
        className="mt-auto w-fit text-xs font-bold uppercase tracking-[0.08em] text-blue-700 underline-offset-2 transition hover:underline"
      >
        Inspector detallado (en desarrollo)
      </button>
    </div>
  )
}