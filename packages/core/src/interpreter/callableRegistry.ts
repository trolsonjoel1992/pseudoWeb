import type { FunctionDeclarationNode, ProcedureDeclarationNode, EnvironmentBlockNode } from '../parser/ast'
import { RuntimeError } from '../errors'

export class CallableRegistry {
  private functions: Map<string, FunctionDeclarationNode> = new Map()
  private procedures: Map<string, ProcedureDeclarationNode> = new Map()

  public registerFromEnvironment(ambiente: EnvironmentBlockNode): void {
    for (const declaration of ambiente.functions) {
      if (this.functions.has(declaration.name) || this.procedures.has(declaration.name)) {
        throw new RuntimeError(`El nombre '${declaration.name}' ya fue declarado en Ambiente.`)
      }
      this.functions.set(declaration.name, declaration)
    }

    for (const declaration of ambiente.procedures) {
      if (this.functions.has(declaration.name) || this.procedures.has(declaration.name)) {
        throw new RuntimeError(`El nombre '${declaration.name}' ya fue declarado en Ambiente.`)
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
