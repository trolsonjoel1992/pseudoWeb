import { BuiltinRegistry } from './registry.js'
import { createREDOND } from './math.js'
import { createFDS, createNFDS, createArrancar, createCerrar } from './sequences.js'
import { createAvanzarBuiltin } from './sequences.js'

export { BuiltinRegistry } from './registry.js'
export type { BuiltinFunction } from './registry.js'

export function initBuiltins(): BuiltinRegistry {
  const registry = new BuiltinRegistry()
  registry.register(createREDOND())
  registry.register(createFDS())
  registry.register(createNFDS())
  registry.register(createArrancar())
  registry.register(createCerrar())
  registry.register(createAvanzarBuiltin())
  return registry
}
