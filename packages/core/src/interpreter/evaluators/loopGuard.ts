import { RuntimeError } from '../../errors'
import { ERROR_MESSAGES } from '../constants/errorMessages'

export class LoopGuard {
  private static readonly LIMIT = 10000
  private iterations = 0

  public checkIteration(loopType: 'while' | 'for' | 'do-while' | 'generic' = 'generic'): void {
    this.iterations += 1
    if (this.iterations > LoopGuard.LIMIT) {
      throw new RuntimeError(ERROR_MESSAGES.LOOP_EXCESS(loopType))
    }
  }

  public reset(): void {
    this.iterations = 0
  }
}

export function createLoopGuard(): LoopGuard {
  return new LoopGuard()
}
