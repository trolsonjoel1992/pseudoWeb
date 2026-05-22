/**
 * Callable Resolution
 * 
 * Separates the concern of resolving a callable (builtin vs user-defined)
 * from the concern of invoking it.
 * 
 * This simplifies CallableInvoker and provides a clean resolution interface.
 */

import { RuntimeError } from '../../errors'
import { ErrorCode } from '../../errors.js'
import { buildMessage } from '../../constants/errorMessages.js'
import type { FunctionDeclarationNode, ProcedureDeclarationNode } from '../../parser/ast'
import { BuiltinRegistry, type BuiltinFunction } from '../builtins'
import { CallableRegistry } from './callableRegistry'

/**
 * Local Errors - Dynamic callable resolution error messages
 */
const Errors = {
  FUNCTION_IS_PROCEDURE: (name: string) => `'${name}' es un procedimiento y no puede usarse dentro de una expresión.`,
  NO_FUNCTION: (name: string) => `No existe una función llamada '${name}'.`,
  PROCEDURE_IS_FUNCTION: (name: string) => `'${name}' es una función y debe usarse dentro de una expresión.`,
  NO_PROCEDURE: (name: string) => `No existe un procedimiento llamado '${name}'.`,
} as const

export type ResolvedFunction = 
  | { kind: 'builtin'; callable: BuiltinFunction }
  | { kind: 'user-defined'; declaration: FunctionDeclarationNode }

export type ResolvedProcedure = { kind: 'user-defined'; declaration: ProcedureDeclarationNode }

/**
 * CallableResolver
 * 
 * Resolves whether a name refers to a builtin or user-defined callable,
 * and returns the resolved callable or an error.
 */
export class CallableResolver {
  constructor(
    private readonly builtinRegistry: BuiltinRegistry,
    private readonly registry: CallableRegistry,
  ) {}

  /**
   * Resolve a function by name
   * @param name Function name
   * @returns ResolvedFunction or throws RuntimeError
   */
  public resolveFunction(name: string): ResolvedFunction {
    // Search builtins first
    const builtin = this.builtinRegistry.resolve(name)
    if (builtin) {
      return { kind: 'builtin', callable: builtin }
    }

    // Then search user-defined functions
    const declaration = this.registry.getFunction(name)
    if (declaration) {
      return { kind: 'user-defined', declaration }
    }

    // Check if it's a procedure (wrong kind error)
    if (this.registry.isProcedure(name)) {
      throw new RuntimeError({
        code: ErrorCode.RUN_INVALID_ARGUMENT,
        message: Errors.FUNCTION_IS_PROCEDURE(name),
        module: 'interpreter',
        context: { name },
      })
    }

    // Not found at all
    throw new RuntimeError({
      code: ErrorCode.RUN_UNDEFINED_IDENTIFIER,
      message: Errors.NO_FUNCTION(name),
      module: 'interpreter',
      context: { name },
    })
  }

  /**
   * Resolve a procedure by name
   * @param name Procedure name
   * @returns ResolvedProcedure or throws RuntimeError
   */
  public resolveProcedure(name: string): ResolvedProcedure {
    // Search user-defined procedures
    const declaration = this.registry.getProcedure(name)
    if (declaration) {
      return { kind: 'user-defined', declaration }
    }

    // Check if it's a function (wrong kind error)
    if (this.registry.isFunction(name)) {
      throw new RuntimeError({
        code: ErrorCode.RUN_INVALID_ARGUMENT,
        message: Errors.PROCEDURE_IS_FUNCTION(name),
        module: 'interpreter',
        context: { name },
      })
    }

    // Not found at all
    throw new RuntimeError({
      code: ErrorCode.RUN_UNDEFINED_IDENTIFIER,
      message: Errors.NO_PROCEDURE(name),
      module: 'interpreter',
      context: { name },
    })
  }
}
