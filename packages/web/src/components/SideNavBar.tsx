import { DASHBOARD_MENU_ITEMS } from '../constants/menuConfig'
import type { DashboardMenu } from '../types/ui'
import { MenuItem } from './MenuItem'

type SideNavBarProps = {
  activeMenu: DashboardMenu
  isMobileOpen: boolean
  onMenuChange: (menu: Exclude<DashboardMenu, 'nuevoScript'>) => void
  onNewScript: () => void
  onCloseMobile: () => void
}

export function SideNavBar({
  activeMenu,
  isMobileOpen,
  onMenuChange,
  onNewScript,
  onCloseMobile,
}: SideNavBarProps) {
  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-slate-950/40 transition md:hidden ${isMobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col gap-6 border-r border-slate-200/70 bg-slate-50/90 p-4 backdrop-blur transition md:static md:z-10 md:h-full md:w-full md:translate-x-0 md:rounded-2xl ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between md:justify-start">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold text-blue-700">Menú</h2>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 md:hidden"
            aria-label="Cerrar menu"
          >
            X
          </button>
        </div>

        <div className="space-y-1">
          {DASHBOARD_MENU_ITEMS.map((item) => (
            <MenuItem
              key={item.id}
              icon={item.icon}
              label={item.label}
              isActive={activeMenu === item.id}
              onClick={() => onMenuChange(item.id)}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={onNewScript}
          className="w-full rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-bold text-blue-700 transition hover:bg-blue-100"
        >
          Nuevo Pseudocódigo
        </button>
        
      </aside>
    </>
  )
}
