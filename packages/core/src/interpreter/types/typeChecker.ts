/**
 * TypeChecker Façade
 * Unified interface for all type operations
 * Delegates to specialized modules: TypeValidator and TypeCoercer
 */

import { TypeValidator, resolveValueType, resolveSwitchValueType } from './typeValidator'
import { TypeCoercer } from './typeCoercer'

export class TypeChecker {
  private validator = new TypeValidator()
  private coercer = new TypeCoercer()

  // ===== Delegate to TypeValidator =====

  public assertValueMatchesType(value: unknown, expectedType: any, contextLabel: string): void {
    return this.validator.assertValueMatchesType(value, expectedType, contextLabel)
  }

  public canAssign(value: unknown, targetType: any): boolean {
    return this.validator.canAssign(value, targetType)
  }

  public assertVariableExists(name: string, environment: any): void {
    return this.validator.assertVariableExists(name, environment)
  }

  public assertNumberType(value: unknown, operation: string): number {
    return this.validator.assertNumberType(value, operation)
  }

  public assertSwitchCaseCompatible(selectorType: any, caseValue: unknown, isComparison: boolean): void {
    return this.validator.assertSwitchCaseCompatible(selectorType, caseValue, isComparison)
  }

  // ===== Delegate to TypeCoercer =====

  public coerceInputValue(variableName: string, inputValue: unknown, expectedType: any): unknown {
    return this.coercer.coerceInputValue(variableName, inputValue, expectedType)
  }

  // ===== Delegate to TypeRules =====

  public resolveValueType(value: unknown): string {
    return resolveValueType(value)
  }

  public resolveSwitchValueType(value: unknown): any {
    return resolveSwitchValueType(value)
  }

  // ===== Helper methods to reduce boilerplate =====

  /**
   * Assert a value is numeric and return the number
   * Reduces boilerplate: no need to call assertNumberType then cast
   */
  public assertAndGetNumber(value: unknown, operation: string): number {
    this.assertNumberType(value, operation)
    return value as number
  }
}
