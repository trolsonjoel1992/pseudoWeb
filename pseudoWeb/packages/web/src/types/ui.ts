export type DashboardMenu = 'codigo' | 'consola' | 'errores' | 'nuevoScript'

export type VariableType = 'STRING' | 'INT' | 'FLOAT' | 'BOOL' | 'ARRAY' | 'UNKNOWN'

export type VariableItem = {
  name: string
  value: unknown
  type: VariableType
}

export type MenuViewData = {
  statusLabel: string
  consoleLines: string[]
  variables: VariableItem[]
}

export type MenuItemConfig = {
  id: Exclude<DashboardMenu, 'nuevoScript'>
  label: string
  icon: string
}
