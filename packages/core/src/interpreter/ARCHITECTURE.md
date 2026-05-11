# Interpreter Architecture

## Estructura de Carpetas

```
interpreter/
├── builtins/                 # Funciones integradas extensibles
│   ├── math.ts              # Implementaciones matemáticas integradas
│   ├── registry.ts          # Registro y resolución de integradas
│   └── index.ts             # Exportación centralizada
├── callables/               # Gestión de funciones y procedimientos
│   ├── callableExecutor.ts  # Ejecuta funciones/procedimientos con ámbitos aislados
│   ├── callableInvoker.ts   # Coordina la invocación de funciones
│   ├── callableRegistry.ts  # Registro de funciones/procedimientos definidos por el usuario
│   ├── callableResolver.ts  # Resuelve funciones por nombre
│   └── index.ts             # Exportación centralizada
├── constants/               # Constantes centralizadas
│   ├── errorMessages.ts     # Todas las cadenas de mensajes de error
│   └── index.ts             # Exportación centralizada
├── environment/             # Ámbito de variables y tablas de símbolos
│   ├── environment.ts       # Ámbito único: variables, tipos, inmutabilidad
│   ├── environmentManager.ts # Pila de entornos para anidamiento de ámbitos
│   └── index.ts             # Exportación centralizada
├── evaluators/              # Evaluación especializada de sentencias
│   ├── doWhileEvaluator.ts  # Sentencias Repetir...Hasta que (do-while)
│   ├── expressionEvaluator.ts # Evaluación de expresiones
│   ├── forEvaluator.ts      # Sentencias Para (for)
│   ├── ifEvaluator.ts       # Sentencias Si/Entonces/Sino
│   ├── ioEvaluator.ts       # Sentencias Leer/Escribir
│   ├── loopGuard.ts         # Protección contra bucles infinitos
│   ├── switchEvaluator.ts   # Sentencias Según (switch)
│   ├── whileEvaluator.ts    # Sentencias Mientras
│   └── index.ts             # Exportación centralizada
├── orchestrator/            # Capa principal de orquestación
│   ├── evaluator.ts         # Coordinador principal del intérprete
│   ├── statementDispatcher.ts # Enruta sentencias a manejadores
│   ├── statementHandlerRegistry.ts # Registro de manejadores de sentencias
│   └── index.ts             # Exportación centralizada
├── types/                   # Sistema de tipos y validación
│   ├── evaluatorContext.ts  # Contrato de interfaz de contexto
│   ├── evaluatorContextContracts.ts # Interfaces de contexto especializadas
│   ├── typeChecker.ts       # Fachada de comprobación de tipos
│   ├── typeCoercer.ts       # Conversión y coerción de tipos
│   ├── typeValidator.ts     # Validación y aserciones de tipos
│   └── index.ts             # Exportación centralizada
├── utils/                   # Utilidades compartidas
│   ├── valueUtils.ts        # Conversión y validación de valores
│   └── index.ts             # Exportación centralizada


```

## Patrones Arquitectónicos

### 1. Patrón Estrategia (Evaluación de Sentencias)

**Ubicación:** `orchestrator/`

**Componentes:**
- `statementDispatcher.ts` — Implementa la interfaz de estrategia de enrutamiento
- `statementHandlerRegistry.ts` — Registro de diferentes estrategias
- `evaluators/*.ts` — Implementaciones individuales de estrategia

**Propósito:**  Cada tipo de sentencia (Si, Mientras, Para, etc.) tiene su propio manejador. El despachador identifica el tipo de sentencia y delega al manejador correspondiente.

**Beneficio:**  Agregar nuevos tipos de sentencias no requiere modificar el despachador ni el evaluador principal.

---

### 2. Patrón Fachada (Sistema de Tipos)

# Arquitectura del Intérprete

## Estructura de carpetas

```
interpreter/
├── builtins/                 # Funciones integradas extensibles
│   ├── math.ts               # Implementaciones matemáticas integradas
│   ├── registry.ts           # Registro y resolución de integradas
│   └── index.ts              # Exportación centralizada
├── callables/                # Gestión de funciones y procedimientos
│   ├── callableExecutor.ts   # Ejecuta funciones/procedimientos con ámbitos aislados
│   ├── callableInvoker.ts    # Coordina la invocación de funciones
│   ├── callableRegistry.ts   # Registro de funciones/procedimientos definidos por el usuario
│   ├── callableResolver.ts   # Resuelve funciones por nombre
│   └── index.ts              # Exportación centralizada
├── constants/                # Constantes centralizadas
│   ├── errorMessages.ts      # Todas las cadenas de mensajes de error
│   └── index.ts              # Exportación centralizada
├── environment/              # Ámbito de variables y tablas de símbolos
│   ├── environment.ts        # Ámbito único: variables, tipos, inmutabilidad
│   ├── environmentManager.ts # Pila de entornos para anidamiento de ámbitos
│   └── index.ts              # Exportación centralizada
├── evaluators/               # Evaluación especializada de sentencias
│   ├── doWhileEvaluator.ts   # Sentencias Repetir...Hasta que (do-while)
│   ├── expressionEvaluator.ts# Evaluación de expresiones
│   ├── forEvaluator.ts       # Sentencias Para (for)
│   ├── ifEvaluator.ts        # Sentencias Si/Entonces/Sino
│   ├── ioEvaluator.ts        # Sentencias Leer/Escribir
│   ├── loopGuard.ts          # Protección contra bucles infinitos
│   ├── switchEvaluator.ts    # Sentencias Según (switch)
│   ├── whileEvaluator.ts     # Sentencias Mientras
│   └── index.ts              # Exportación centralizada
├── orchestrator/             # Capa principal de orquestación
│   ├── evaluator.ts          # Coordinador principal del intérprete
│   ├── statementDispatcher.ts# Enruta sentencias a manejadores
│   ├── statementHandlerRegistry.ts # Registro de manejadores de sentencias
│   └── index.ts              # Exportación centralizada
├── types/                    # Sistema de tipos y validación
│   ├── evaluatorContext.ts   # Contrato de interfaz de contexto
│   ├── evaluatorContextContracts.ts # Interfaces de contexto especializadas
│   ├── typeChecker.ts        # Fachada de comprobación de tipos
│   ├── typeCoercer.ts        # Conversión y coerción de tipos
│   ├── typeValidator.ts      # Validación y aserciones de tipos
│   └── index.ts              # Exportación centralizada
├── utils/                    # Utilidades compartidas
│   ├── valueUtils.ts         # Conversión y validación de valores
│   └── index.ts              # Exportación centralizada

```

## Patrones arquitectónicos

### 1. Patrón Estrategia (Evaluación de sentencias)

**Ubicación:** `orchestrator/`

**Componentes:**
- `statementDispatcher.ts` — Implementa la interfaz de estrategia de enrutamiento
- `statementHandlerRegistry.ts` — Registro de diferentes estrategias
- `evaluators/*.ts` — Implementaciones individuales de estrategia

**Propósito:** Cada tipo de sentencia (Si, Mientras, Para, etc.) tiene su propio manejador. El despachador identifica el tipo de sentencia y delega al manejador correspondiente.

**Beneficio:** Agregar nuevos tipos de sentencias no requiere modificar el despachador ni el evaluador principal.

---

### 2. Patrón Fachada (Sistema de tipos)

**Ubicación:** `types/`

**Componentes:**
- `typeChecker.ts` — Interfaz unificada (fachada)
- `typeValidator.ts` — Lógica de validación de tipos
- `typeCoercer.ts` — Lógica de conversión de tipos
- `typeValidator.ts` — Reglas adicionales de tipos

**Propósito:** Oculta la complejidad de varios módulos de tipos detrás de una sola interfaz.

**Beneficio:** Permite reorganizar internamente el sistema de tipos sin afectar el código que lo utiliza. Las operaciones de tipos permanecen cohesivas desde la perspectiva del llamador.

---

### 3. Patrón Registro (Integradas y funciones)

**Ubicación:** `builtins/` y `callables/`

**Componentes:**
- `builtins/registry.ts` — Gestiona el registro de funciones integradas
- `callables/callableRegistry.ts` — Gestiona el registro de funciones/procedimientos definidos por el usuario
- `callables/callableResolver.ts` — Resuelve la identidad de funciones (integradas vs usuario)

**Propósito:** Separa el almacenamiento y búsqueda de funciones/procedimientos de su ejecución.

**Beneficio:** Las funciones pueden registrarse, descubrirse y resolverse sin acoplamiento fuerte. Se pueden añadir nuevas integradas sin modificar el evaluador.

---

### 4. Patrón Adaptador (Paso de contexto)

**Ubicación:** `types/evaluatorContext.ts`

**Componentes:**
- `evaluatorContext.ts` — Define la interfaz de contexto
- `evaluatorContextContracts.ts` — Interfaces de contexto especializadas para diferentes evaluadores

**Propósito:** Proporciona vistas especializadas del evaluador a diferentes componentes sin exponer toda la implementación.

**Beneficio:** Los componentes dependen solo de los métodos que necesitan, no de toda la interfaz del evaluador. Reduce el acoplamiento entre orquestador y evaluadores especializados.

---

### 5. Inyección de dependencias

**Ubicación:** `orchestrator/evaluator.ts`

**Patrón:** Inyección de dependencias por constructor

**Componentes inyectados:**
- `Environment` — Gestión del ámbito de variables
- `EnvironmentManager` — Pila de ámbitos
- `TypeChecker` — Validación y coerción de tipos
- `CallableRegistry` — Funciones/procedimientos definidos por el usuario
- `BuiltinRegistry` — Funciones integradas
- `StatementDispatcher` — Enrutamiento de sentencias

**Propósito:** Desacoplar el orquestador de sus dependencias, facilitando pruebas y refactorización.

**Beneficio:** Cada dependencia puede ser sustituida, simulada o extendida sin modificar el evaluador.

---

### 6. Cadena de responsabilidad (Resolución e invocación de funciones)

**Ubicación:** `callables/`

**Componentes:**
- `callableResolver.ts` — Determina la fuente de la función (integrada o usuario)
- `callableInvoker.ts` — Enruta al ejecutor apropiado
- `callableExecutor.ts` — Ejecuta la función resuelta

**Propósito:** Una solicitud (llamada de función) pasa por una cadena de manejadores hasta que uno la procesa.

**Beneficio:** Separación clara de responsabilidades: resolver → invocar → ejecutar.

---

## Detalles por subcarpeta

### `builtins/`
**Responsabilidad:** Almacenar y proporcionar acceso a las funciones integradas del lenguaje.

**Clases/Funciones clave:**
- `BuiltinRegistry` — Singleton que almacena todas las integradas disponibles
- `initBuiltins()` — Función de inicialización del registro de integradas
- Funciones matemáticas — REDOND, TRUNCAR, RAIZ, SENO, COSENO, etc.

**Cómo funciona:** Cuando se encuentra una llamada a función, el resolvedor comprueba primero las integradas antes de buscar funciones definidas por el usuario.

---

### `callables/`
**Responsabilidad:** Gestionar el ciclo de vida de llamadas a funciones y procedimientos (resolución, invocación, ejecución).

**Clases clave:**
- `CallableRegistry` — Almacena funciones y procedimientos definidos por el usuario
- `CallableResolver` — Determina si un nombre es una integrada o está definida por el usuario
- `CallableInvoker` — Enruta al ejecutor correcto (integrada o definida por el usuario)
- `CallableExecutor` — Crea un ámbito aislado y ejecuta el cuerpo de la función

**Cómo funciona:**
1. El resolvedor identifica la fuente del callable.
2. El invocador enruta al ejecutor correcto.
3. El ejecutor crea un nuevo entorno (ámbito hijo) y ejecuta el cuerpo.
4. El entorno se restaura después de la ejecución.

---

### `environment/`
**Responsabilidad:** Gestionar el almacenamiento de variables y la jerarquía de ámbitos.

**Clases clave:**
- `Environment` — Ámbito único: almacena valores de variables, tipos y banderas de inmutabilidad
- `EnvironmentManager` — Pila de entornos para ámbitos anidados

**Cómo funciona:**
- `environment.ts` gestiona operaciones de ámbito local (declarar, asignar, buscar)
- `environmentManager.ts` gestiona la entrada/salida de ámbitos (push/pop en la pila)
- Las variables se buscan a través de la cadena de padres si no se encuentran localmente

---

### `evaluators/`
**Responsabilidad:** Ejecutar tipos de sentencias y expresiones específicas.

**Archivos clave:**
- `expressionEvaluator.ts` — Evalúa todos los tipos de expresiones (binarias, unarias, literales, identificadores)
- `ifEvaluator.ts` — Sentencias Si/Entonces/Sino
- `whileEvaluator.ts` — Sentencias Mientras
- `forEvaluator.ts` — Sentencias Para
- `doWhileEvaluator.ts` — Sentencias Repetir...Hasta que
- `switchEvaluator.ts` — Sentencias Según
- `ioEvaluator.ts` — Leer/Escribir
- `loopGuard.ts` — Previene bucles infinitos contando iteraciones

**Cómo funciona:** Cada evaluador es una función pura que recibe un nodo y el contexto, y devuelve void o un valor. No hay modificaciones de estado fuera del ámbito de evaluación.

---

### `orchestrator/`
**Responsabilidad:** Coordinar la ejecución global del programa (orquestación de alto nivel).

**Clases clave:**
- `Evaluator` — Fachada principal del intérprete
- `StatementDispatcher` — Enruta sentencias a los manejadores
- `StatementHandlerRegistry` — Mapea tipo de sentencia → función manejadora

**Cómo funciona:**
1. `Evaluator` inicializa todas las dependencias.
2. `Evaluator` registra declaraciones (variables, funciones, procedimientos).
3. `Evaluator` itera por las sentencias del programa.
4. `StatementDispatcher` enruta cada sentencia al manejador apropiado.
5. Los manejadores ejecutan y pueden modificar el estado (variables, ámbitos) a través del contexto.

---

### `types/`
**Responsabilidad:** Validar y convertir tipos de datos durante la ejecución.

**Clases clave:**
- `TypeValidator` — Valida que los valores coincidan con los tipos declarados
- `TypeCoercer` — Convierte entradas al tipo destino
- `TypeChecker` — Fachada que coordina validadores y coercers

**Cómo funciona:**
- Sentencias como `Leer` usan `TypeCoercer` para convertir la entrada tipo string al tipo de la variable destino.
- Las asignaciones usan `TypeValidator` para asegurar compatibilidad de tipos.
- Las estructuras de control usan `TypeValidator` para evaluar condiciones.

---

### `constants/`
**Responsabilidad:** Centralizar las cadenas de mensajes de error (fuente única de verdad).

**Contenido:** Todas las cadenas de error usadas en el intérprete.

**Cómo funciona:** Las funciones de error se invocan con información de contexto (nombre de variable, tipo, etc.) para generar mensajes descriptivos.

---

### `utils/`
**Responsabilidad:** Proveer utilidades de bajo nivel para manejo de valores.

**Funciones clave:**
- `stringifyValue()` — Convierte valores a cadenas legibles
- `isTruthy()` — Coerción booleana
- `assertDefinedValue()` — Valida valores no nulos/indefinidos
- `toNumber()` — Convierte a número con validación
- `toComparable()` — Asegura que un valor sea comparable numéricamente

---

## Flujo de datos

```
Programa (AST)
    ↓
Evaluator (orchestrator/evaluator.ts)
    ↓
StatementDispatcher (orchestrator/statementDispatcher.ts)
    ↓
Evaluador específico (evaluators/*.ts)
    ├─→ ExpressionEvaluator (evaluators/expressionEvaluator.ts)
    │   ├─→ CallableInvoker (callables/callableInvoker.ts)
    │   └─→ CallableResolver (callables/callableResolver.ts)
    │
    ├─→ TypeChecker (types/typeChecker.ts)
    │   ├─→ TypeValidator (types/typeValidator.ts)
    │   └─→ TypeCoercer (types/typeCoercer.ts)
    │
    └─→ Environment/EnvironmentManager (environment/environment.ts)
        └─→ Almacenamiento y recuperación de variables
```

---

## Principios de diseño

1. **Separación de responsabilidades** — Cada módulo tiene una responsabilidad clara y única
2. **Modularidad** — Los módulos están poco acoplados y son testables de forma independiente
3. **Extensibilidad** — Se pueden añadir nuevos tipos de sentencias, integradas y evaluadores sin modificar el código existente
4. **Inmutabilidad** — Los mensajes de error y constantes no se modifican
5. **Límites claros** — Cada carpeta representa una capa o preocupación arquitectónica distinta
