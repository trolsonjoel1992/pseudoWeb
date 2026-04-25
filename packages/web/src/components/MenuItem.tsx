import type { ReactNode } from 'react'

type MenuItemProps = {
  icon: ReactNode
  label: string
  isActive: boolean
  onClick: () => void
}

export function MenuItem({ icon, label, isActive, onClick }: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-xs font-semibold uppercase tracking-[0.08em] transition ${
        isActive
          ? 'bg-white text-blue-700 shadow-sm ring-1 ring-slate-200'
          : 'text-slate-500 hover:translate-x-0.5 hover:bg-white/60 hover:text-slate-700'
      }`}
      aria-pressed={isActive}
    >
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-bold text-slate-600">
        {icon}
      </span>
      <span>{label}</span>
    </button>
  )
}
