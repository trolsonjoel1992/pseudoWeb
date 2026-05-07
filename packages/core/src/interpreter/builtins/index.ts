import { BuiltinRegistry } from './registry'
import { createREDOND } from './math'

export { BuiltinRegistry } from './registry'
export type { BuiltinFunction } from './registry'

export function initBuiltins(): BuiltinRegistry {
  const registry = new BuiltinRegistry()
  registry.register(createREDOND())
  return registry
}
