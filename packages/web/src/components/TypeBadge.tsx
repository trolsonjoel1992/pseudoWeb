import type { VariableType } from '../types/ui'

type TypeBadgeProps = {
  type: VariableType
}

export function TypeBadge({ type }: TypeBadgeProps) {
  const classNameByType: Record<VariableType, string> = {
    STRING: 'border-blue-200 text-blue-700 bg-blue-50',
    INT: 'border-orange-200 text-orange-700 bg-orange-50',
    FLOAT: 'border-orange-200 text-orange-700 bg-orange-50',
    BOOL: 'border-emerald-200 text-emerald-700 bg-emerald-50',
    ARRAY: 'border-violet-200 text-violet-700 bg-violet-50',
    UNKNOWN: 'border-slate-200 text-slate-600 bg-slate-50',
  }

  return <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em] ${classNameByType[type]}`}>{type}</span>
}
