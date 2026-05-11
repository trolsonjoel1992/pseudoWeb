import { RuntimeError } from '../../errors'
import { ERROR_MESSAGES } from '../constants/errorMessages'

export class LoopGuard {
  private static readonly DEFAULT_LIMIT = 10_000
  private iterations = 0

  constructor(private readonly limit: number = LoopGuard.DEFAULT_LIMIT) {}

  public checkIteration(loopType: 'while' | 'for' | 'do-while' | 'generic' = 'generic'): void {
    this.iterations += 1
    if (this.iterations > this.limit) {
      throw new RuntimeError(ERROR_MESSAGES.LOOP_EXCESS(loopType, this.limit))
    }
  }

  public reset(): void {
    this.iterations = 0
  }

  public getIterations(): number {
    return this.iterations
  }

  /**
   * Factory method for testing with smaller limit
   * @param limit - The iteration limit (default: 100 for tests)
   * @returns New LoopGuard with specified limit
   */
  public static forTesting(limit: number = 100): LoopGuard {
    return new LoopGuard(limit)
  }
}

export function createLoopGuard(limit?: number): LoopGuard {
  return new LoopGuard(limit)
}
