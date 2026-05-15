# CONTEXTO COMPLETO: CARPETA INTERPRETER

## 1. VISIÓN GENERAL

La carpeta `interpreter` es el núcleo de ejecución del lenguaje pseudoWeb. Su responsabilidad es ejecutar el árbol de sintaxis abstracta (AST) generado por el parser transformándolo en comportamiento real.

**Responsabilidades principales:**
- Crear y mantener el entorno de variables (tabla de símbolos)
- Registrar y resolver funciones y procedimientos
- Evaluar expresiones
- Ejecutar estructuras de control (if, while, for, switch, do-while)
- Manejar entrada/salida (Leer/Escribir)
- Validar tipos en tiempo de ejecución
- Prevenir bucles infinitos
- Manejar errores en tiempo de ejecución

---

## 2. ESTRUCTURA DE CARPETAS

```
interpreter/
├── ARCHITECTURE.md              # Documentación arquitectónica
├── descripcion-interpreter.txt  # Descripción general inicial
├── orchestrator/                # Orquestación central
│   ├── evaluator.ts             # Evaluador principal (orquestador)
│   ├── statementDispatcher.ts   # Despachador de sentencias
│   └── index.ts                 # Exportaciones
├── environment/                 # Gestión de variables y scope
│   ├── environment.ts           # Tabla de símbolos (un scope)
│   ├── environmentManager.ts    # Pila de ambientes (scope stack)
│   └── index.ts                 # Exportaciones
├── callables/                   # Funciones y procedimientos
│   ├── callableRegistry.ts      # Registro de funciones/procedimientos
│   ├── callableExecutor.ts      # Ejecutor de funciones/procedimientos
│   ├── callableInvoker.ts       # Invocador (resuelve builtin vs user-defined)
│   └── index.ts                 # Exportaciones
├── evaluators/                  # Evaluadores especializados
│   ├── expressionEvaluator.ts   # Evaluación de expresiones
│   ├── ioEvaluator.ts           # Leer/Escribir
│   ├── controlFlowEvaluator.ts  # If/While/For
│   ├── doWhileEvaluator.ts      # Repetir...Hasta que
│   ├── switchEvaluator.ts       # Segun (switch)
│   ├── loopGuard.ts             # Prevención de bucles infinitos
│   └── index.ts                 # Exportaciones
├── types/                       # Sistema de tipos
│   ├── typeChecker.ts           # Façade unificada de tipos (orquesta los 4 módulos)
│   ├── typeValidator.ts         # Validación y aserciones de tipos
│   ├── typeCoercer.ts           # Coerción/conversión de tipos
│   ├── typeRules.ts             # Resolución de tipos
│   └── index.ts                 # Exportaciones
├── builtins/                    # Funciones incorporadas
│   ├── registry.ts              # Registro extensible de builtins
│   ├── math.ts                  # Builtins matemáticas
│   ├── index.ts                 # Exportaciones e inicialización
│   └── [futuro: string.ts]      # Para funciones de string en el futuro
├── constants/                   # Constantes compartidas
│   ├── errorMessages.ts         # Mensajes de error (globales)
│   └── index.ts                 # Exportaciones
└── utils/                       # Utilidades
    ├── valueUtils.ts            # Conversiones y validaciones de valores
    └── index.ts                 # Exportaciones
```

---

## 3. DESCRIPCIÓN DETALLADA DE CADA MÓDULO

### 3.1 ORCHESTRATOR - Núcleo de Orquestación

#### **evaluator.ts**
**Función:** Orquestador central que coordina todo el flujo de interpretación.

**Responsabilidades:**
- Inicializar dependencias (environment, type checker, registry de builtins, etc.)
- Registrar definiciones de funciones/procedimientos desde bloques ambiente
- Recibir solicitudes de leer variables y escribir salida
- Despachar sentencias a evaluadores especializados
- Mantener el contexto global de ejecución

**Estructura de la clase:**
```typescript
class Evaluator {
  // Dependencias
  private environment: Environment                    // Ambiente actual
  private readonly environmentManager: EnvironmentManager
  private typeChecker: TypeChecker
  private registry: CallableRegistry                  // Funciones/procedimientos del usuario
  private builtinRegistry: BuiltinRegistry            // Funciones built-in
  private callableExecutor: CallableExecutor
  private readonly context: EvaluatorContext         // Contexto adaptado para evaluadores
  private readonly dispatcher: StatementDispatcher
  private readonly invoker: CallableInvoker
  private readonly output: string[] = []
  
  // Métodos principales
  constructor(environment, requestInput, pushOutput)
  public evaluateBlock(statements): Promise<void>
  public getResult(): EvaluationResult
  public evaluateExpression(node): Promise<unknown>
}
```

**Cómo funciona:**
1. Se instancia con un `Environment` raíz
2. En el constructor, se inicializan todos los servicios
3. Se llama a `evaluateBlock()` con el AST
4. Los métodos internos despachan a evaluadores especializados
5. El resultado se obtiene con `getResult()`

#### **statementDispatcher.ts**
**Función:** Despachador de sentencias que rutas cada tipo de sentencia al evaluador correcto.

**Responsabilidades:**
- Recibir una sentencia AST
- Determinar su tipo
- Despachar al evaluador especializado correspondiente
- Soportar bucles con `dispatchBlock()`

**Tipos de sentencias que maneja:**
- `VariableDeclaration` → Manejador directo
- `Assignment` → Manejador directo
- `CallStatement` → Manejador directo
- `Write` → `evaluateWriteNode()`
- `Read` → `evaluateReadNode()`
- `If` → `evaluateIfNode()`
- `While` → `evaluateWhileNode()`
- `For` → `evaluateForNode()`
- `Switch` → `evaluateSwitchNode()`
- `DoWhile` → `evaluateDoWhileNode()`

---

### 3.2 ENVIRONMENT - Gestión de Variables y Scope

#### **environment.ts**
**Función:** Una tabla de símbolos que representa un único nivel de scope.

**Responsabilidades:**
- Almacenar valores de variables
- Almacenar tipos de variables
- Marcar variables como constantes
- Encadenar con entornos padre para scope lexicográfico
- Validar acceso a variables

**Estructura:**
```typescript
class Environment {
  private readonly values: Map<string, unknown>      // Valores almacenados
  private readonly types: Map<string, DataType>      // Tipos de variables
  private readonly constants: Set<string>            // Marcas de constante
  private readonly enclosing: Environment | null     // Entorno padre (para scope)
  
  public define(name, value, type?, isConstant?): void
  public assign(name, value): void
  public lookup(name): unknown
  public lookupType(name): DataType | null
  public has(name): boolean
}
```

**Errores locales:**
- `CANNOT_REASSIGN_CONSTANT` — Intento de modificar una constante
- `VARIABLE_NOT_DEFINED` — Acceso a variable no declarada

#### **environmentManager.ts**
**Función:** Gestor de una pila de ambientes para manejar scopes anidados.

**Responsabilidades:**
- Mantener una pila (stack) de entornos
- Empujar nuevos entornos cuando entra en scope (funciones, bloques)
- Sacar entornos cuando sale de scope
- Devolver el entorno actual

**Uso típico:**
```typescript
const manager = new EnvironmentManager(rootEnv)
manager.pushEnvironment(parentEnv)      // Entra en función
const localEnv = manager.getCurrent()
manager.popEnvironment()                 // Sale de función
```

---

### 3.3 CALLABLES - Funciones y Procedimientos

#### **callableRegistry.ts**
**Función:** Registro de funciones y procedimientos definidas por el usuario.

**Responsabilidades:**
- Registrar todas las funciones y procedimientos de un bloque ambiente
- Evitar nombres duplicados
- Resolver si un nombre es función o procedimiento
- Acceso rápido por nombre

**Métodos principales:**
```typescript
registerFromEnvironment(ambiente): void           // Registra todas las declaraciones
getFunction(name): FunctionDeclarationNode | undefined
getProcedure(name): ProcedureDeclarationNode | undefined
isFunction(name): boolean
isProcedure(name): boolean
hasCallable(name): boolean
```

**Errores locales:**
- `DUPLICATE_CALLABLE` — Nombre ya declarado

#### **callableExecutor.ts**
**Función:** Ejecutor de funciones y procedimientos con scope aislado.

**Responsabilidades:**
- Crear un entorno local aislado para cada llamada
- Validar cantidad de argumentos
- Vincular argumentos a parámetros con validación de tipos
- Ejecutar el bloque del función/procedimiento
- Validar y devolver el valor de retorno (para funciones)
- Restaurar el estado anterior incluso si hay error

**Metodología importantes:**
```typescript
executeFunction(declaration, args): Promise<unknown>
executeProcedure(declaration, args): Promise<void>
```

**Host Interface:**
El ejecutor recibe un "host" que le permite operar sin conocer la clase concreta del evaluador:
```typescript
type CallableExecutorHost = {
  getEnvironment(): Environment
  setEnvironment(env): void
  getRegistry(): CallableRegistry
  setRegistry(reg): void
  evaluateBlock(statements): Promise<void>
  initializeEnvironmentDeclarations(ambiente): void
}
```

#### **callableInvoker.ts**
**Función:** Invocador de funciones y procedimientos (resuelve el nombre a la implementación).

**Responsabilidades:**
- Resolver si es una función builtin o definida por usuario
- Invocación de funciones (busca builtin primero, luego user-defined)
- Invocación de procedimientos (solo user-defined)
- Errores específicos si se mezclan tipos

**Búsqueda:**
```
invokeFunction(name, args):
  1. Buscar en BuiltinRegistry
  2. Si no existe, buscar en CallableRegistry
  3. Si existe pero es procedimiento, error
  4. Si no existe, error

invokeProcedure(name, args):
  1. Buscar en CallableRegistry
  2. Si existe pero es función, error
  3. Si no existe, error
```

**Errores locales:**
- `FUNCTION_IS_PROCEDURE` — Usar procedimiento como función
- `NO_FUNCTION` — Función no existe
- `PROCEDURE_IS_FUNCTION` — Usar función como procedimiento
- `NO_PROCEDURE` — Procedimiento no existe

---

### 3.4 EVALUATORS - Evaluadores Especializados

#### **expressionEvaluator.ts**
**Función:** Evaluación recursiva de expresiones.

**Tipos de expresiones:**
- `Literal` — Valores constantes (números, strings, booleanos)
- `Identifier` — Búsqueda de variable
- `Grouping` — Paréntesis
- `UnaryExpression` — Operadores unarios (negación, No lógico)
- `BinaryExpression` — Operadores binarios (+, -, *, /, <, >, ==, etc.)
- `FunctionCall` — Llamadas a función

**Operadores soportados:**
- Aritméticos: `+`, `-`, `*`, `/`, `MOD`, `^` (potencia)
- Relacionales: `<`, `>`, `<=`, `>=`, `==`, `<>`
- Lógicos: `Y`, `O`, `No`

#### **ioEvaluator.ts**
**Función:** Evaluación de operaciones de entrada/salida.

**Responsabilidades:**
- Evaluar expresiones y mostrar resultado (Escribir)
- Solicitar entrada, convertir tipo según variable, asignar (Leer)

**Métodos:**
```typescript
evaluateWriteNode(node, context): Promise<void>
evaluateReadNode(node, context): Promise<void>
```

#### **controlFlowEvaluator.ts**
**Función:** Evaluación de estructuras de control (if, while, for).

**Responsabilidades:**
- Evaluar condiciones
- Ejecutar ramas apropiadas
- Prevenir bucles infinitos con LoopGuard
- Manejar inicialización y actualización de variables de bucle

**Métodos:**
```typescript
evaluateIfNode(node, context): Promise<void>
evaluateWhileNode(node, context): Promise<void>
evaluateForNode(node, context): Promise<void>
```

#### **doWhileEvaluator.ts**
**Función:** Evaluación de bucles Repetir...Hasta que (do-while).

**Diferencia con While:**
- Se ejecuta al menos una vez
- La condición se evalúa al final (condición de salida)

#### **switchEvaluator.ts**
**Función:** Evaluación de sentencias Segun (switch).

**Responsabilidades:**
- Evaluar la expresión selector
- Buscar casos que coincidan
- Ejecutar bloque de caso
- Soporte para caso por defecto

#### **loopGuard.ts**
**Función:** Prevención de bucles infinitos.

**Límite:** 10,000 iteraciones

**Uso:**
```typescript
const guard = createLoopGuard()
while (condition) {
  guard.checkIteration('while')  // Lanza error si supera límite
  // ...
}
```

---

### 3.5 TYPES - Sistema de Tipos

#### **typeChecker.ts (Façade)**
**Función:** Interfaz unificada para todas las operaciones de tipos.

**Patrón:** Façade que delega a 4 módulos especializados

**Responsabilidades:**
- Validación de tipos
- Coerción/conversión de tipos
- Resolución de tipos en runtime
- Reglas de tipo

**Métodos expuestos:**
```typescript
// Delegados a TypeValidator
assertValueMatchesType(value, type, context)
canAssign(value, targetType)
assertVariableExists(name, environment)
assertNumberType(value, operation)
assertSwitchCaseCompatible()

// Delegados a TypeCoercer
coerceInputValue(varName, input, expectedType)

// Delegados a TypeRules
resolveValueType(value)
resolveSwitchValueType(value)
```

#### **typeValidator.ts**
**Función:** Validación y aserciones de tipos.

**Responsabilidades:**
- Verificar que un valor coincida con su tipo esperado
- Validar operaciones numéricas
- Validar existencia de variables
- Permitir o rechazar asignaciones

#### **typeCoercer.ts**
**Función:** Conversión de tipos (especialmente entrada de usuario).

**Responsabilidades:**
- Convertir string de entrada a tipo esperado
- String → Entero (parseInt)
- String → Real (parseFloat)
- String → Lógico (booleano)
- Validar restricciones AN(maxLength) para strings

#### **typeRules.ts**
**Función:** Reglas de resolución de tipos.

**Responsabilidades:**
- Determinar el tipo runtime de un valor
- Resolver tipo de valor en switch
- Aplicar reglas de coerción

#### **index.ts**
Exporta la clase `TypeChecker` como punto de entrada único.

---

### 3.6 BUILTINS - Funciones Incorporadas

#### **registry.ts**
**Función:** Registro extensible de funciones incorporadas.

**Estructura:**
```typescript
interface BuiltinFunction {
  name: string
  execute: (args: unknown[]) => unknown
}

class BuiltinRegistry {
  private readonly builtins: Map<string, BuiltinFunction>
  
  register(builtin: BuiltinFunction): void
  resolve(name: string): BuiltinFunction | null
  exists(name: string): boolean
}
```

**Características:**
- Case-insensitive (normaliza a minúsculas)
- Evita duplicados
- Acceso rápido por nombre

#### **math.ts**
**Función:** Funciones matemáticas incorporadas.

**Funciones:**
- `REDOND(valor, decimales)` — Redondeo a N decimales

**Patrón para agregar builtins:**
```typescript
export const REDOND = {
  name: 'REDOND',
  execute: (args: unknown[]) => {
    // Validar argumentos y ejecutar
  }
}
```

#### **index.ts**
**Función:** Inicialización del registro de builtins.

**Responsabilidades:**
- Crear instancia de `BuiltinRegistry`
- Registrar todas las funciones matemáticas
- Retornar el registro inicializado

**Uso:**
```typescript
const builtinRegistry = initBuiltins()
```

---

### 3.7 TYPES/EVALUATORCONTEXT.ts - Contexto Adaptado

**Función:** Interfaz que define el contrato de operaciones que los evaluadores especializados necesitan del evaluador principal.

**Patrón:** Adapter/Façade - expone solo lo necesario

**Métodos:**
```typescript
interface EvaluatorContext {
  evaluateExpression(node: ExpressionNode): Promise<unknown>
  evaluateBlock(statements: StatementNode[]): Promise<void>
  requestInput(name: string): Promise<unknown>
  hasVariable(name: string): boolean
  lookupVariableType(name: string): DataType | null
  assignVariable(name: string, value: unknown): void
  defineVariable(name, value, type?, isConstant?): void
  pushOutput(line: string): void
  lookup(name: string): unknown
  invokeFunction(name: string, args: unknown[]): Promise<unknown>
  environment: Environment
  typeChecker: TypeChecker
}
```

---

### 3.8 UTILS/VALUEUTILS.ts - Utilidades de Valores

**Función:** Funciones auxiliares para conversión y validación de valores.

**Métodos:**
```typescript
stringifyValue(value): string
isTruthy(value): boolean
assertDefinedValue(value, operation): void
toNumber(value): number
toComparable(value): string | number
```

---

### 3.9 CONSTANTS/ERRORMESSAGES.ts - Mensajes de Error

**Función:** Centraliza todos los mensajes de error en tiempo de ejecución.

**Características:**
- Mensajes parametrizables
- Facilita localización
- Único punto de cambio

---

## 4. FLUJO DE EJECUCIÓN COMPLETO

### Ejemplo: Ejecutar un programa simple

```
Programa pseudocódigo:
  Variables
    x Entero
  Inicio
    Leer x
    Si x > 0 Entonces
      Escribir "Positivo"
    Fin Si
  Fin
```

**Flujo de ejecución:**

1. **Parser** → Genera AST
2. **Evaluator.constructor()** → Inicializa servicios
3. **Evaluator.evaluateBlock([statements])**
   - Itera sobre sentencias del programa principal
   - Para `VariableDeclaration` → Crea variable en entorno
   - Para `Read` → StatementDispatcher→ioEvaluator→requestInput→coerceInputValue
   - Para `If` → StatementDispatcher → controlFlowEvaluator
     - Evalúa expresión `x > 0`
     - Si cierto, ejecuta rama then
     - Evalúa `> ` operador con expressionEvaluator
4. **Evaluator.getResult()** → Devuelve salida y variables finales

---

## 5. CÓMO TRABAJAR CON LA CARPETA

### 5.1 Agregar una nueva función builtin

```typescript
// 1. Crear archivo builtins/string.ts
export const LONG = {
  name: 'LONG',
  execute: (args: unknown[]) => {
    if (args.length !== 1) throw new Error('LONG requiere 1 argumento')
    const str = String(args[0])
    return str.length
  }
}

// 2. Modificar builtins/index.ts
import { LONG } from './string'

export function initBuiltins(): BuiltinRegistry {
  const registry = new BuiltinRegistry()
  registry.register(REDOND)
  registry.register(LONG)  // ← Agregar aquí
  return registry
}
```

### 5.2 Agregar un nuevo tipo de sentencia

```typescript
// 1. El parser ya genera el AST (ej: RepeatStatementNode)

// 2. Crear evaluators/repeatEvaluator.ts
export async function evaluateRepeatNode(node: RepeatNode, context: EvaluatorContext) {
  // Lógica de evaluación
}

// 3. Modificar orchestrator/statementDispatcher.ts
case 'Repeat':
  await evaluateRepeatNode(node as RepeatNode, this.context)
  return

// 4. Exportar desde evaluators/index.ts
export { evaluateRepeatNode } from './repeatEvaluator'
```

### 5.3 Agregar validación de tipo adicional

```typescript
// Modificar types/typeValidator.ts
public assertCustomValidation(value: unknown, context: string): void {
  // Implementar lógica
  if (!isValid) {
    throw new RuntimeError(...)
  }
}

// Luego exponer en typeChecker.ts
public assertCustomValidation = this.validator.assertCustomValidation.bind(this.validator)
```

### 5.4 Debuguear una ejecución

```typescript
// En Evaluator, agregar logs
public evaluateBlock(statements: StatementNode[]) {
  for (const stmt of statements) {
    console.log('Executing statement:', stmt.type)  // ← Debug
    await this.dispatcher.dispatch(stmt)
  }
}
```

---

## 6. MEJORAS ESTRUCTURALES PROPUESTAS

### 6.1 Mejoras de Alto Impacto

#### **1. Eliminar la duplicación entre FunctionCall y CallStatement**
**Problema:** 
- `expressionEvaluator.ts` maneja `FunctionCall` (expresión)
- `orchestrator/evaluator.ts` maneja `CallStatement` (sentencia)
- Existe duplicación de lógica de invocación

**Solución propuesta:**
```typescript
// Crear callables/callableResolver.ts
export class CallableResolver {
  public async resolve(name: string, args: ExpressionNode[]): Promise<unknown> {
    // Lógica unificada de resolución
  }
}

// Usar en ambos lugares
```

**Beneficio:** Reducir código duplicado ~20 líneas

---

#### **2. Unificar resolución de tipos en TypeChecker**
**Problema:**
- Cada módulo de tipos (validator, coercer, rules) mantiene su lógica
- Cast de tipo es repetitivo: `context.typeChecker.assertNumberType()`

**Solución propuesta:**
```typescript
// Crear types/typeCheckerAdvanced.ts con métodos helper
export class TypeChecker {
  // Métodos helper para reducir boilerplate
  public assertAndNumber(value: unknown, context: string): number {
    this.assertNumberType(value, context)
    return value as number
  }
}
```

---

#### **3. Crear HandlerRegistry para diferentes tipos de sentencias**
**Problema:**
- `StatementDispatcher.dispatch()` es muy largo (10+ casos)
- Agregar nuevo tipo requiere modificar dispatcher

**Solución propuesta:**
```typescript
export class StatementHandlerRegistry {
  private handlers = new Map<StatementType, Handler>()
  
  public register(type: StatementType, handler: Handler) {
    this.handlers.set(type, handler)
  }
  
  public dispatch(node: StatementNode, context: EvaluatorContext) {
    const handler = this.handlers.get(node.type as StatementType)
    return handler?.(node, context)
  }
}

// El dispatcher se convierte en:
class StatementDispatcher {
  constructor(private registry: StatementHandlerRegistry) {}
}
```

**Beneficio:** Open/Closed principle - extensible sin modificar código existente

---

#### **4. Separar BUILTIN_REGISTRY del Evaluator**
**Problema:**
- El Evaluator instancia y mantiene BuiltinRegistry
- Los builtins están acoplados al evaluador

**Solución propuesta:**
```typescript
// Crear builtins/builtinService.ts
export interface BuiltinService {
  initializeBuiltins(registry: BuiltinRegistry): void
}

export class MathBuiltinService implements BuiltinService {
  initializeBuiltins(registry: BuiltinRegistry) {
    registry.register(REDOND)
  }
}

// Evaluator solo carga servicios
const mathService = new MathBuiltinService()
mathService.initializeBuiltins(this.builtinRegistry)
```

---

#### **5. Extraer lógica de vinculación de parámetros**
**Problema:**
- `CallableExecutor.bindParameters()` es específica de callables
- Similar a lógica de asignación de variables

**Solución propuesta:**
```typescript
// Crear callables/parameterBinder.ts
export class ParameterBinder {
  bind(parameters: Parameter[], args: unknown[], environment: Environment, typeChecker: TypeChecker) {
    // Lógica de vinculación
  }
}
```

---

### 6.2 Mejoras de Mantenimiento

#### **6. Documentar contratos de contexto**
**Problema:**
- `EvaluatorContext` es una interfaz grande sin documentación clara
- No está claro cuáles métodos son obligatorios para cada evaluador

**Solución propuesta:**
```typescript
// Crear types/evaluatorContextTypings.ts
type ExpressionEvaluatorContext = Pick<EvaluatorContext, 
  'evaluateExpression' | 'lookup' | 'invokeFunction' | 'typeChecker'
>

type IOEvaluatorContext = Pick<EvaluatorContext,
  'evaluateExpression' | 'requestInput' | 'lookupVariableType' | 'assignVariable' | 'pushOutput'
>

// Usar en evaluadores
export function evaluateExpressionNode(node: ExpressionNode, context: ExpressionEvaluatorContext) {
  // El IDE ahora sabe exactamente qué métodos están disponibles
}
```

---

#### **7. Crear logger centralizado**
**Problema:**
- No hay forma consistente de debuguear
- Los logs están dispersos o no existen

**Solución propuesta:**
```typescript
// Crear utils/logger.ts
export interface InterpreterLogger {
  debug(message: string, data?: unknown): void
  warn(message: string, data?: unknown): void
  error(message: string, error: Error): void
}

export class ConsoleLogger implements InterpreterLogger { }

// Inyectar en Evaluator
const evaluator = new Evaluator(env, inputHandler, outputHandler, logger)
```

---

#### **8. Crear tests para cada evaluador**
**Problema:**
- Los evaluadores son difíciles de testear de forma aislada
- No hay tests unitarios puros

**Solución propuesta:**
```typescript
// __tests__/evaluators/expressionEvaluator.test.ts
describe('expressionEvaluator', () => {
  const mockContext: ExpressionEvaluatorContext = {
    evaluateExpression: jest.fn(),
    lookup: jest.fn(),
    invokeFunction: jest.fn(),
    typeChecker: createMockTypeChecker()
  }
  
  it('should evaluate binary expression', async () => {
    // Test
  })
})
```

---

### 6.3 Mejoras de Performance

#### **9. Cached type resolution**
**Problema:**
- `TypeChecker.resolveValueType()` se llama múltiples veces para el mismo valor
- Las conversiones de tipo son O(1) pero se hacen innecesariamente

**Solución propuesta:**
```typescript
export class CachedTypeChecker extends TypeChecker {
  private cache = new WeakMap<object, DataType>()
  
  public resolveValueType(value: unknown): DataType {
    if (typeof value === 'object' && value !== null) {
      if (this.cache.has(value)) {
        return this.cache.get(value)!
      }
    }
    const type = super.resolveValueType(value)
    if (typeof value === 'object' && value !== null) {
      this.cache.set(value, type)
    }
    return type
  }
}
```

---

#### **10. Loop guard optimization**
**Problema:**
- `LoopGuard` cuenta iteraciones pero el límite es global
- Para testing, puede ser inconveniente

**Solución propuesta:**
```typescript
export class ConfigurableLoopGuard {
  constructor(private limit: number = 10_000) {}
  
  public setLimit(limit: number) {
    this.limit = limit
  }
}

// En tests: guard.setLimit(100)
```

---

---

## 7. DETECCIÓN DE SOBREINGENIERÍA

### 7.1 Posible Sobreingeniería Detectada

#### **1. ✓ CONFIRMADO: ContextFactory es innecesaria**
**Ubicación:** `orchestrator/evaluator.ts` (líneas del contexto)

**Problema:**
- `ContextFactory` se menciona en ARCHITECTURE.md pero NO EXISTE en el código
- El contexto es created directamente inline en `evaluator.ts`
- Se gasta complejidad creando un objeto

**Análisis:**
- La interfaz `EvaluatorContext` es útil (Single Responsibility)
- PERO: crear un objeto contexto por cada evaluación es costoso
- El contexto se reutiliza en varias evaluaciones

**Recomendación:** ✓ ACEPTABLE (no es sobreingeniería)
- Sin embargo, considerar pasar solo métodos necesarios (ya se hace con Pick<> en evaluadores)

---

#### **2. ✓ CONFIRMADO: TypeChecker Façade es ligeramente sobre-ingeniada**
**Ubicación:** `types/typeChecker.ts`

**Problema:**
- Façade que solo delega a 3-4 módulos
- Cada `public method = this.module.method.bind()` es verbose

**Análisis:**
- La separación de concerns es BUENA (validator, coercer, rules)
- PERO: el façade agrega una capa indirecta

**Recomendación:** OPTIMIZABLE
```typescript
// Actual (actual actual):
public assertValueMatchesType = this.validator.assertValueMatchesType.bind(this.validator)

// Mejor:
public assertValueMatchesType(value: unknown, type: DataType, context: string) {
  return this.validator.assertValueMatchesType(value, type, context)
}
```

---

#### **3. ✗ EVITABLE: Demasiadas clases pequeñas en `callables/`**
**Ubicación:** `callables/` (3 clases + interfaces)

**Problema:**
```
callables/
├── callableRegistry.ts    (pequeña)
├── callableExecutor.ts    (mediana)
├── callableInvoker.ts     (pequeña)
├── index.ts              (barrel)

Total: 4 archivos para ~200 líneas de código
```

**Análisis:**
- Cada clase tiene 1-2 responsabilidades claras ✓
- PERO: fácilmente podrían combinarse en 2 archivos:
  - `callableRegistry.ts` (búsqueda de callables)
  - `callableExecutor.ts` (ejecución)

**Recomendación:** CONSOLIDAR (opcional)
```typescript
// callables/index.ts podría reexportar ambas
export { CallableRegistry, CallableExecutor }
```

---

#### **4. ✓ BORDERLINE: EnvironmentManager es necesaria pero simple**
**Ubicación:** `environment/environmentManager.ts`

**Problema:**
```typescript
class EnvironmentManager {
  private readonly envStack: Environment[]
  
  public pushEnvironment(parent?: Environment): Environment {
    const environment = parent ? new Environment(parent) : new Environment()
    this.envStack.push(environment)
    return environment
  }
}
```

**Análisis:**
- Clase con 3 métodos triviales (push, pop, getCurrent)
- Podría ser un helper function

**Recomendación:** ACEPTABLE
- Aunque simple, proporciona un lugar para lógica futura de scope
- Mantener como clase (abstracción clara)

---

#### **5. ✓ CONFIRMADO: StatementDispatcher es necesario**
**Ubicación:** `orchestrator/statementDispatcher.ts`

**Problema:**
- Podría estar inline en Evaluator

**Análisis:**
- Separa concern de clasificación de sentencias
- Facilita testing
- Potencial para mejora #3 (registry pattern)

**Recomendación:** MANTENER (buen diseño)

---

#### **6. ✓ CONFIRMADO: Demasiada granularidad en `types/`**
**Ubicación:** `types/` (5 archivos)

**Problema:**
```
types/
├── typeChecker.ts       (façade)
├── typeValidator.ts     (~150 líneas)
├── typeCoercer.ts       (~80 líneas)
├── typeRules.ts         (~50 líneas)
├── typeValidator.ts     (~100 líneas)
├── index.ts            (barrel)

Total: 6 archivos para ~500 líneas
```

**Análisis:**
- Separación de concerns es CLARA ✓
- PERO: búsqueda frecuente en archivos relacionados
- Compilación podría ser más lenta (5 archivos importados)

**Recomendación:** TOLERABLE
- Si crece mucho, consolidar a 2-3 archivos:
  - `types/validator.ts` (validator + rules)
  - `types/coercer.ts` (coercion)
  - `types/index.ts` (façade + barrel export)

---

#### **7. ✗ PROBLEMA: CallableInvoker y CallableRegistry tienen overlap**
**Ubicación:** `callables/callableInvoker.ts` vs `callables/callableRegistry.ts`

**Problema:**
```typescript
// En CallableInvoker:
const declaration = this.registry.getFunction(name)
if (!declaration) {
  if (this.registry.isProcedure(name)) { ... }
}

// La lógica de "¿es nombre un callable?" está en registry
// Pero la lógica de "¿cuál tipo es?" está en invoker
```

**Análisis:**
- `CallableInvoker` tiene demasiada responsabilidad
- Mezcla resolución (búsqueda) con invocación (ejecución)

**Recomendación:** REFACTORIZAR
```typescript
// Crear callables/callableResolver.ts
export class CallableResolver {
  constructor(private registry: CallableRegistry, private invoker: CallableInvoker) {}
  
  public resolveFunction(name: string): FunctionDeclarationNode | Error
  public resolveProcedure(name: string): ProcedureDeclarationNode | Error
}

// CallableInvoker solo invoca:
export class CallableInvoker {
  public async invokeResolved(declaration: FunctionDeclarationNode | ProcedureDeclarationNode, args: unknown[])
}
```

---

#### **8. ✓ ACEPTABLE: LoopGuard es simple pero útil**
**Ubicación:** `evaluators/loopGuard.ts`

**Problema:**
- Clase con 2 métodos simples

**Análisis:**
- Previene problemas serios (bucles infinitos)
- PERO: podría ser función + closure

**Recomendación:** MANTENER
```typescript
// Actual es mejor que:
function createLoopGuard(limit = 10000) {
  let iterations = 0
  return {
    checkIteration: () => {
      if (++iterations > limit) throw new Error(...)
    },
    reset: () => { iterations = 0 }
  }
}
// Porque es más testeable como clase
```

---

### 7.2 Sobreingeniería por Módulo

| Módulo | Sobreingeniería | Severidad | Recomendación |
|--------|-----------------|-----------|--------------|
| `orchestrator/` | Bajo | ✓ | Mantener |
| `environment/` | Bajo | ✓ | Mantener |
| `callables/` | Medio (3 clases) | ⚠ | Tolerable, documentar |
| `evaluators/` | Bajo | ✓ | Mantener |
| `types/` | Medio (5+ archivos) | ⚠ | Tolerable, monitorear |
| `builtins/` | Bajo | ✓ | Extensible, bueno |
| `constants/` | Bajo | ✓ | Mantener |
| `utils/` | Bajo | ✓ | Mantener |

---

### 7.3 Patrones de Sobreingeniería Evitados

✓ **No hay:**
- Patrones Decorator sin propósito
- Herencia profunda
- Mixins innecesarios
- Inversión de dependencias excesiva
- Over-abstraction de métodos simples

✓ **Hay buen uso de:**
- Separación de concerns
- Single Responsibility Principle
- Interfaces minimalistas
- Inyección de dependencias
- Patrones probados (Registry, Facade, Strategy)

---

## 8. DIAGNÓSTICO GENERAL

### Salud del Código: 7/10

**Fortalezas:**
1. ✓ Excelente separación de concerns
2. ✓ Bajo acoplamiento entre módulos
3. ✓ Interfaces claras
4. ✓ Nombres descriptivos
5. ✓ Manejo de errores consistente

**Debilidades:**
1. ⚠ Algunos módulos podrían consolidarse (`callables/`, `types/`)
2. ⚠ Falta documentación de contratos de contexto
3. ⚠ Sin logger centralizado
4. ⚠ Cobertura de tests limitada
5. ⚠ Overlap funcional entre `CallableInvoker` y `CallableRegistry`

**Recomendaciones Prioritarias:**
1. **Alta:** Refactorizar #7 (CallableInvoker/Registry overlap)
2. **Alta:** Implementar mejora #3 (HandlerRegistry para statements)
3. **Media:** Documentar contextos (mejora #6)
4. **Baja:** Consolidar archivos tipo (mejora de estética)

---

## 9. MATRIZ DE DECISIÓN: QUÉ MEJORAR AHORA

| Mejora | Esfuerzo | Impacto | Prioridad | ROI |
|--------|----------|---------|-----------|-----|
| 1. Eliminar duplicación FunctionCall | Bajo | Medio | Media | 7/10 |
| 2. Unificar resolución tipos | Medio | Bajo | Baja | 4/10 |
| 3. HandlerRegistry para statements | **Alto** | **Alto** | **Alta** | **9/10** |
| 4. Separar BUILTIN_REGISTRY | Bajo | Bajo | Baja | 5/10 |
| 5. Extraer ParamBinder | Bajo | Bajo | Baja | 3/10 |
| 6. Documentar contextos | Bajo | Alto | Alta | 8/10 |
| 7. Refactorizar CallableInvoker | Medio | Alto | Alta | 8/10 |
| 8. Logger centralizado | Medio | Alto | Media | 7/10 |
| 9. Cache tipo resolver | Bajo | Muy Bajo | Baja | 2/10 |
| 10. ConfigurableLoopGuard | Bajo | Bajo | Baja | 3/10 |

**Top 3 a implementar:**
1. **Mejora #3** (HandlerRegistry) - Abre el código a extensión
2. **Mejora #7** (CallableInvoker refactor) - Elimina confusión
3. **Mejora #6** (Documentación) - Facilita onboarding

---

## 10. GUÍA RÁPIDA DE REFERENCIA

### Para agregar...

**Una nueva función builtin:**
→ `builtins/math.ts` + registrar en `builtins/index.ts`

**Un nuevo tipo de sentencia:**
→ Crear `evaluators/newTypeEvaluator.ts` + agregar caso en `StatementDispatcher`

**Una nueva regla de tipo:**
→ `types/typeValidator.ts` + exponer en `types/typeChecker.ts`

**Debuguear ejecución:**
→ Agregar logs en `orchestrator/evaluator.ts` o evaluadores específicos

**Cambiar límite de bucles:**
→ `evaluators/loopGuard.ts` línea `private static readonly LIMIT`

**Cambiar mensaje de error:**
→ `constants/errorMessages.ts` o errores locales en archivo específico

---

## 11. CONCLUSIÓN

La carpeta `interpreter` tiene **una arquitectura sólida** con buen equilibrio entre:
- Separación de concerns
- Extensibilidad
- Mantenibilidad

Las oportunidades de mejora son **reales pero opcionales**. El código es funcional y estructurado. Las mejoras propuestas son para:
- Facilitar agregación de nuevas características
- Mejorar clarity para nuevos desarrolladores
- Optimizar casos de edge (loops, tipos)

**El módulo es listo para producción con mejoras progresivas.**

