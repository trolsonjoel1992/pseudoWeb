import { Environment } from './environment'

export class EnvironmentManager {
  private readonly envStack: Environment[]

  constructor(rootEnvironment: Environment) {
    this.envStack = [rootEnvironment]
  }

  public pushEnvironment(parent?: Environment): Environment {
    const environment = parent ? new Environment(parent) : new Environment()
    this.envStack.push(environment)
    return environment
  }

  public popEnvironment(): Environment {
    if (this.envStack.length === 1) {
      throw new Error('Cannot pop root environment')
    }

    return this.envStack.pop() as Environment
  }

  public getCurrent(): Environment {
    return this.envStack[this.envStack.length - 1]
  }
}
