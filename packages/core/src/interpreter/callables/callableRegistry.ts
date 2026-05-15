import type { FunctionDeclarationNode, ProcedureDeclarationNode, EnvironmentBlockNode } from '../../parser/ast'
import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors.js'
import { buildMessage } from '../../constants/errorMessages.js'

/**
 * Local Errors - Dynamic callable registry error messages
 * These messages require interpolation with callable names, so they live locally
 */
const Errors = {
  DUPLICATE_CALLABLE: (name: string) => `El nombre '${name}' ya fue declarado en Ambiente.`,
} as const

export class CallableRegistry {
  private functions: Map<string, FunctionDeclarationNode> = new Map()
  private procedures: Map<string, ProcedureDeclarationNode> = new Map()

  public registerFromEnvironment(ambiente: EnvironmentBlockNode): void {
    for (const declaration of ambiente.functions) {
      if (this.functions.has(declaration.name) || this.procedures.has(declaration.name)) {
        throw new RuntimeError({
          code: ErrorCode.RUN_INVALID_ARGUMENT,
          message: Errors.DUPLICATE_CALLABLE(declaration.name),
          module: 'interpreter',
          context: { name: declaration.name },
        })
      }
      this.functions.set(declaration.name, declaration)
    }

    for (const declaration of ambiente.procedures) {
      if (this.functions.has(declaration.name) || this.procedures.has(declaration.name)) {
        throw new RuntimeError({
          code: ErrorCode.RUN_INVALID_ARGUMENT,
          message: Errors.DUPLICATE_CALLABLE(declaration.name),
          module: 'interpreter',
          context: { name: declaration.name },
        })
      }
      this.procedures.set(declaration.name, declaration)
    }
  }

  public getFunction(name: string): FunctionDeclarationNode | undefined {
    return this.functions.get(name)
  }

  public getProcedure(name: string): ProcedureDeclarationNode | undefined {
    return this.procedures.get(name)
  }

  public isFunction(name: string): boolean {
    return this.functions.has(name)
  }

  public isProcedure(name: string): boolean {
    return this.procedures.has(name)
  }

  public hasCallable(name: string): boolean {
    return this.isFunction(name) || this.isProcedure(name)
  }
}
