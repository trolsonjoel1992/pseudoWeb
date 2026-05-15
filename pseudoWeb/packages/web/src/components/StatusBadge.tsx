type StatusBadgeProps = {
  status: 'success' | 'warning' | 'error'
  label: string
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const statusStyles: Record<StatusBadgeProps['status'], string> = {
    success: 'bg-emerald-100 text-emerald-700 ring-emerald-200',
    warning: 'bg-amber-100 text-amber-700 ring-amber-200',
    error: 'bg-rose-100 text-rose-700 ring-rose-200',
  }

  const statusDot: Record<StatusBadgeProps['status'], string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-rose-500',
  }

  return (
    <div className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-[0.08em] ring-1 ${statusStyles[status]}`}>
      <span className={`h-2.5 w-2.5 rounded-full ${statusDot[status]}`} aria-hidden="true" />
      <span>{label}</span>
    </div>
  )
}
