/**
 * TypeChecker Façade
 * Unified interface for all type operations
 * Delegates to specialized modules: TypeValidator, TypeCoercer, TypeRules
 */

import { TypeValidator } from './typeValidator'
import { TypeCoercer } from './typeCoercer'
import { TypeRules } from './typeRules'

export class TypeChecker {
  private validator = new TypeValidator()
  private coercer = new TypeCoercer()
  private rules = new TypeRules()

  // Delegate to TypeValidator
  public assertValueMatchesType = this.validator.assertValueMatchesType.bind(this.validator)
  public canAssign = this.validator.canAssign.bind(this.validator)
  public assertVariableExists = this.validator.assertVariableExists.bind(this.validator)
  public assertNumberType = this.validator.assertNumberType.bind(this.validator)
  public assertSwitchCaseCompatible = this.validator.assertSwitchCaseCompatible.bind(this.validator)

  // Delegate to TypeCoercer
  public coerceInputValue = this.coercer.coerceInputValue.bind(this.coercer)

  // Delegate to TypeRules
  public resolveValueType = this.rules.resolveValueType.bind(this.rules)
  public resolveSwitchValueType = this.rules.resolveSwitchValueType.bind(this.rules)
}
