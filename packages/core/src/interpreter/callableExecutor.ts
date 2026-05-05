import type { FunctionDeclarationNode, ProcedureDeclarationNode, StatementNode } from '../parser/ast'
import { RuntimeError } from '../errors'
import { CallableRegistry } from './callableRegistry'
import { Environment } from './environment'
import { EnvironmentManager } from './environmentManager'
import type { TypeChecker } from './typeSystem'
import { assertDefinedValue } from './utils/valueUtils'

export type CallableExecutorHost = {
  getEnvironment: () => Environment
  setEnvironment: (environment: Environment) => void
  getRegistry: () => CallableRegistry
  setRegistry: (registry: CallableRegistry) => void
  evaluateBlock: (statements: StatementNode[]) => Promise<void>
  initializeEnvironmentDeclarations: (ambiente: FunctionDeclarationNode['ambiente']) => void
}

export class CallableExecutor {
  constructor(
    private readonly host: CallableExecutorHost,
    private readonly typeChecker: TypeChecker,
    private readonly environmentManager: EnvironmentManager,
  ) {}

  public async executeFunction(declaration: FunctionDeclarationNode, args: unknown[]): Promise<unknown> {
    this.assertArgumentCount(declaration.name, declaration.parameters.length, args.length)

    const previousEnvironment = this.host.getEnvironment()
    const previousRegistry = this.host.getRegistry()
    const callEnvironment = this.environmentManager.pushEnvironment(previousEnvironment)
    const localRegistry = new CallableRegistry()

    this.host.setEnvironment(callEnvironment)
    this.host.setRegistry(localRegistry)

    try {
      this.bindParameters(declaration.parameters, args, callEnvironment)

      if (declaration.ambiente) {
        localRegistry.registerFromEnvironment(declaration.ambiente)
        this.host.initializeEnvironmentDeclarations(declaration.ambiente)
      }

      callEnvironment.define(declaration.name, null, declaration.returnType)

      await this.host.evaluateBlock(declaration.proceso)

      const returnValue = callEnvironment.lookup(declaration.name)
      assertDefinedValue(returnValue, `el retorno de la función '${declaration.name}'`)
      this.typeChecker.assertValueMatchesType(returnValue, declaration.returnType, `el retorno de la función '${declaration.name}'`)
      return returnValue
    } finally {
      this.environmentManager.popEnvironment()
      this.host.setEnvironment(previousEnvironment)
      this.host.setRegistry(previousRegistry)
    }
  }

  public async executeProcedure(declaration: ProcedureDeclarationNode, args: unknown[]): Promise<void> {
    this.assertArgumentCount(declaration.name, declaration.parameters.length, args.length)

    const previousEnvironment = this.host.getEnvironment()
    const previousRegistry = this.host.getRegistry()
    const callEnvironment = this.environmentManager.pushEnvironment(previousEnvironment)
    const localRegistry = new CallableRegistry()

    this.host.setEnvironment(callEnvironment)
    this.host.setRegistry(localRegistry)

    try {
      this.bindParameters(declaration.parameters, args, callEnvironment)

      if (declaration.ambiente) {
        localRegistry.registerFromEnvironment(declaration.ambiente)
        this.host.initializeEnvironmentDeclarations(declaration.ambiente)
      }

      await this.host.evaluateBlock(declaration.proceso)
    } finally {
      this.environmentManager.popEnvironment()
      this.host.setEnvironment(previousEnvironment)
      this.host.setRegistry(previousRegistry)
    }
  }

  private bindParameters(
    parameters: FunctionDeclarationNode['parameters'] | ProcedureDeclarationNode['parameters'],
    args: unknown[],
    environment: Environment,
  ): void {
    for (let index = 0; index < parameters.length; index += 1) {
      const parameter = parameters[index]
      const argument = args[index]
      this.typeChecker.assertValueMatchesType(argument, parameter.dataType, `el parámetro '${parameter.name}'`)
      environment.define(parameter.name, argument, parameter.dataType)
    }
  }

  private assertArgumentCount(name: string, expected: number, received: number): void {
    if (expected === received) {
      return
    }

    throw new RuntimeError(
      `Cantidad de argumentos inválida en '${name}'. Esperados: ${expected}, recibidos: ${received}.`,
    )
  }
}
