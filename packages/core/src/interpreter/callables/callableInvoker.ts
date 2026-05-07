import { RuntimeError } from '../../errors'
import { BuiltinRegistry } from '../builtins'
import { CallableRegistry } from './callableRegistry'
import { CallableExecutor } from './callableExecutor'

/**
 * Local Errors - Dynamic callable invocation error messages
 * These messages require interpolation with callable names, so they live locally
 */
const Errors = {
  FUNCTION_IS_PROCEDURE: (name: string) => `'${name}' es un procedimiento y no puede usarse dentro de una expresión.`,
  NO_FUNCTION: (name: string) => `No existe una función llamada '${name}'.`,
  PROCEDURE_IS_FUNCTION: (name: string) => `'${name}' es una función y debe usarse dentro de una expresión.`,
  NO_PROCEDURE: (name: string) => `No existe un procedimiento llamado '${name}'.`,
} as const

/**
 * Callable Invocation - Resolution and execution of functions and procedures
 * Handles the logic of determining whether to invoke builtins or user-defined callables
 * Centralizes the semantic knowledge of callable lookup order and error messages
 */
export class CallableInvoker {
  constructor(
    private readonly builtinRegistry: BuiltinRegistry,
    private readonly registry: CallableRegistry,
    private readonly executor: CallableExecutor,
  ) {}

  /**
   * Invoke a function - searches builtins first, then user-defined functions
   * @param name Function name
   * @param args Arguments to pass
   * @returns The result of function execution
   * @throws RuntimeError if name is a procedure or doesn't exist
   */
  public async invokeFunction(name: string, args: unknown[]): Promise<unknown> {
    // Buscar primero en builtins
    const builtin = this.builtinRegistry.resolve(name)
    if (builtin) {
      return builtin.execute(args)
    }

    // Luego buscar en funciones de usuario
    const declaration = this.registry.getFunction(name)
    if (!declaration) {
      if (this.registry.isProcedure(name)) {
        throw new RuntimeError(Errors.FUNCTION_IS_PROCEDURE(name))
      }
      throw new RuntimeError(Errors.NO_FUNCTION(name))
    }

    return await this.executor.executeFunction(declaration, args)
  }

  /**
   * Invoke a procedure - searches user-defined procedures only
   * @param name Procedure name
   * @param args Arguments to pass
   * @throws RuntimeError if name is a function or doesn't exist
   */
  public async invokeProcedure(name: string, args: unknown[]): Promise<void> {
    const declaration = this.registry.getProcedure(name)
    if (!declaration) {
      if (this.registry.isFunction(name)) {
        throw new RuntimeError(Errors.PROCEDURE_IS_FUNCTION(name))
      }
      throw new RuntimeError(Errors.NO_PROCEDURE(name))
    }

    await this.executor.executeProcedure(declaration, args)
  }
}
