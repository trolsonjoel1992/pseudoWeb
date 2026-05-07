# Interpreter Architecture

## Overview

The interpreter module has been refactored from a flat, monolithic structure into a well-organized, domain-based architecture with clear separation of concerns.

## Core Components

### 1. Core Orchestrator (`core/`)
- **evaluator.ts** — Main orchestrator that coordinates all interpreter operations
  - Initializes dependencies (environment, builtins, type checker, callable registry)
  - Registers user-defined functions and procedures
  - Dispatches statements to specialized evaluators
  - **Pure orchestration** — no domain logic

### 2. Domain Modules

#### `callables/`
Manages function and procedure invocation:
- **callableExecutor.ts** — Executes functions/procedures with isolated scopes
- **callableRegistry.ts** — Registry for user-defined functions and procedures
- **index.ts** — Barrel export

#### `environment/`
Manages variable scope and symbol tables:
- **environment.ts** — Single scope: variable values, types, and immutability flags
- **environmentManager.ts** — Stack of environments for scope management
- **index.ts** — Barrel export

#### `context/`
Adapter pattern for context passing to evaluators:
- **contextFactory.ts** — Creates EvaluatorContext for specialized evaluators
- **types/evaluatorContext.ts** — Interface contract for context operations
- **index.ts** — Barrel export

#### `builtins/`
Extensible builtin functions registry:
- **registry.ts** — `BuiltinRegistry` class for registering and resolving builtins
- **math.ts** — Mathematical builtins (currently: REDOND/rounding)
- **index.ts** — `initBuiltins()` function for initialization

**Key Benefit:** New builtins can be added without modifying `evaluator.ts`

#### `evaluators/`
Specialized evaluation logic for statement types:
- **controlFlowEvaluator.ts** — If, While, For statements
- **doWhileEvaluator.ts** — Repetir...Hasta que (do-while) statements
- **switchEvaluator.ts** — Segun (switch) statement
- **expressionEvaluator.ts** — Expression evaluation
- **ioEvaluator.ts** — Read/Write statements
- **loopGuard.ts** — Prevents infinite loop execution (max 10,000 iterations)
- **index.ts** — Barrel export

#### `constants/`
Centralized error messages:
- **errorMessages.ts** — All runtime error messages (immutable contract)
- **index.ts** — Barrel export

#### `utils/`
Utility functions for value handling:
- **valueUtils.ts** — Value conversion and validation helpers
- **index.ts** — Barrel export

### 3. Type System (`types/`)

Separated into three specialized modules with a façade interface:

#### **typeValidator.ts** (`TypeValidator`)
Type validation and assertions:
- `assertValueMatchesType()` — Validates value matches expected type
- `assertNumberType()` — Validates numeric type
- `assertVariableExists()` — Validates variable is defined
- `assertSwitchCaseCompatible()` — Validates switch case compatibility
- `canAssign()` — Checks safe assignment

#### **typeCoercer.ts** (`TypeCoercer`)
Input conversion and coercion:
- `coerceInputValue()` — Converts input strings to expected types
  - String → Integer / Real (numeric parsing)
  - String → Logico (boolean conversion)
  - Validates AN(maxLength) alfanumerico constraints

#### **typeRules.ts** (`TypeRules`)
Type resolution and rules:
- `resolveValueType()` — Determines runtime type from value
- `resolveSwitchValueType()` — Resolves switch expression type

#### **typeChecker.ts** (`TypeChecker` Façade)
Unified interface delegating to all three modules:
- All public methods from TypeValidator, TypeCoercer, and TypeRules
- Single entry point for backward compatibility
- Enables future refactoring without affecting callsites

#### **index.ts**
Barrel export for all type modules

## Refactoring Phases (Completed)

### Phase 1: Structural Reorganization ✅
- Moved related files into domain folders
- Created barrel exports (index.ts) for each domain
- Updated all imports across codebase
- All tests pass; no behavioral changes

### Phase 2: Extract Builtins ✅
- Created `builtins/` folder with extensible registry
- Extracted REDOND logic from evaluator.ts
- `evaluator.ts` now pure orchestrator (no domain logic)
- REDOND continues to work exactly as before

### Phase 3: Type Check & Stabilization ✅
- Verified no TypeScript errors after reorganization
- All imports correctly resolved
- All tests (37/37) pass

### Phase 4: Type System Refactoring ✅
- Separated typeSystem.ts into three focused modules
- Created TypeChecker façade for backward compatibility
- All type operations remain functionally identical
- All tests (37/37) pass; TypeScript clean

## Import Patterns

### Recommended (using barrel exports)
```typescript
import { TypeChecker } from './types'
import { CallableExecutor } from './callables'
import { Environment } from './environment'
```

### Also valid (specific imports)
```typescript
import { TypeValidator } from './types/typeValidator'
import { TypeCoercer } from './types/typeCoercer'
import { CallableExecutor } from './callables/callableExecutor'
```

## Adding New Builtins

1. Create a factory function in `builtins/math.ts` (or new builtins file)
2. Export from `builtins/index.ts`
3. Register in `initBuiltins()` function
4. No changes to `evaluator.ts` needed

Example:
```typescript
// builtins/math.ts
export function createABS(): BuiltinFunction {
  return {
    name: 'ABS',
    execute: (args) => Math.abs(args[0])
  }
}

// builtins/index.ts - in initBuiltins()
registry.register(createABS())
```

## Future Improvements

**Phase 5 (Not yet implemented):**
- Further decompose ioEvaluator.ts if needed
- Consider separating controlFlowEvaluator.ts by statement type
- Input/output abstraction layer for better testability
- Expand type coercion capabilities

## Testing Strategy

- All tests are in `__tests__/interpreter.test.ts`
- Run with: `pnpm --filter @pseudoweb/core exec vitest run`
- After structural changes, run TypeCheck: `pnpm exec tsc --noEmit`
- Error message strings are part of the public contract — do not modify

## Key Principles

1. **One change type per phase** — Structure changes separate from logic changes
2. **Tests must pass 100%** after each phase before proceeding
3. **Barrel exports** prevent import fragility during refactoring
4. **Dependency injection** keeps modules loosely coupled
5. **Façade pattern** enables safe decomposition with backward compatibility

---

**Last updated:** May 6, 2026  
**Status:** Phases 1-4 complete; all tests passing
