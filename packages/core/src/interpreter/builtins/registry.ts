import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors.js'
import { buildMessage } from '../../constants/errorMessages.js'

/**
 * Local Errors - Dynamic builtin registry error messages
 * These messages require interpolation with builtin names, so they live locally
 */
const Errors = {
  DUPLICATE_BUILTIN: (name: string) => `La builtin '${name}' ya está registrada.`,
} as const

export interface BuiltinFunction {
  name: string
  execute: (args: unknown[]) => unknown
}

export class BuiltinRegistry {
  private readonly builtins: Map<string, BuiltinFunction> = new Map()

  public register(builtin: BuiltinFunction): void {
    const lowerCaseName = builtin.name.toLowerCase()
    if (this.builtins.has(lowerCaseName)) {
      throw new RuntimeError({
        code: ErrorCode.RUN_INVALID_ARGUMENT,
        message: Errors.DUPLICATE_BUILTIN(builtin.name),
        module: 'interpreter',
        context: { name: builtin.name },
      })
    }
    this.builtins.set(lowerCaseName, builtin)
  }

  public resolve(name: string): BuiltinFunction | null {
    return this.builtins.get(name.toLowerCase()) ?? null
  }

  public exists(name: string): boolean {
    return this.builtins.has(name.toLowerCase())
  }
}
