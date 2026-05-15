import { BuiltinRegistry } from './registry.js'
import { createREDOND } from './math.js'

export { BuiltinRegistry } from './registry.js'
export type { BuiltinFunction } from './registry.js'

export function initBuiltins(): BuiltinRegistry {
  const registry = new BuiltinRegistry()
  registry.register(createREDOND())
  return registry
}
