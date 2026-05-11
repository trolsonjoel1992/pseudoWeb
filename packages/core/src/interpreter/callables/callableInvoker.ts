import { CallableResolver } from './callableResolver'
import { CallableExecutor } from './callableExecutor'

/**
 * Callable Invocation - Execution of resolved callables
 * 
 * Simplified invoker that only handles invocation after
 * resolution is done by CallableResolver.
 * 
 * Removed: resolution logic (moved to CallableResolver)
 * This separation improves testability and follows Single Responsibility Principle
 */
export class CallableInvoker {
  constructor(
    private readonly resolver: CallableResolver,
    private readonly executor: CallableExecutor,
  ) {}

  /**
   * Invoke a resolved function
   * @param name Function name
   * @param args Arguments to pass
   * @returns The result of function execution
   * @throws RuntimeError if name is not found or is a procedure
   */
  public async invokeFunction(name: string, args: unknown[]): Promise<unknown> {
    const resolved = this.resolver.resolveFunction(name)

    // If it's a builtin, execute directly
    if (resolved.kind === 'builtin') {
      return resolved.callable.execute(args)
    }

    // If it's user-defined, use executor
    return await this.executor.executeFunction(resolved.declaration, args)
  }

  /**
   * Invoke a resolved procedure
   * @param name Procedure name
   * @param args Arguments to pass
   * @throws RuntimeError if name is not found or is a function
   */
  public async invokeProcedure(name: string, args: unknown[]): Promise<void> {
    const resolved = this.resolver.resolveProcedure(name)
    await this.executor.executeProcedure(resolved.declaration, args)
  }
}
