# Arquitectura del Intérprete

## Estructura de carpetas

```
interpreter/
├── builtins/
│   ├── index.ts
│   ├── math.ts
│   └── registry.ts
├── callables/
│   ├── callableExecutor.ts
│   ├── callableInvoker.ts
│   ├── callableRegistry.ts
│   ├── callableResolver.ts
│   └── index.ts
├── constants/
│   ├── errorMessages.ts
│   └── index.ts
├── environment/
│   ├── environment.ts
│   ├── environmentManager.ts
│   └── index.ts
├── evaluators/
│   ├── doWhileEvaluator.ts
│   ├── expressionEvaluator.ts
│   ├── forEvaluator.ts
│   ├── ifEvaluator.ts
│   ├── ioEvaluator.ts
│   ├── loopGuard.ts
│   ├── switchEvaluator.ts
│   ├── whileEvaluator.ts
│   └── index.ts
├── orchestrator/
│   ├── evaluator.ts
│   ├── statementDispatcher.ts
│   ├── statementHandlerRegistry.ts
│   └── index.ts
├── types/
│   ├── evaluatorContext.ts
│   ├── evaluatorContextContracts.ts
│   ├── typeChecker.ts
│   ├── typeCoercer.ts
│   ├── typeValidator.ts
│   └── index.ts
└── utils/
    ├── valueUtils.ts
    └── index.ts
```

## Responsabilidad general

El interprete ejecuta el AST generado por el parser. Para hacerlo, combina un entorno de variables, un registro de callables, un sistema de tipos, evaluadores especializados y un despachador de sentencias.

## Componentes principales

### `orchestrator/`

- `evaluator.ts` es la fachada principal del interprete.
- `statementDispatcher.ts` enruta cada sentencia al evaluador correspondiente.
- `statementHandlerRegistry.ts` almacena los handlers de sentencias.

### `builtins/`

- `math.ts` define funciones integradas como REDOND.
- `registry.ts` resuelve y registra builtins.

### `callables/`

- `callableRegistry.ts` registra funciones y procedimientos de usuario.
- `callableResolver.ts` determina si un nombre es builtin o de usuario.
- `callableInvoker.ts` coordina la invocacion.
- `callableExecutor.ts` ejecuta callables con entorno aislado.

### `environment/`

- `environment.ts` implementa la tabla de simbolos en ejecucion.
- `environmentManager.ts` administra la pila de entornos.

### `evaluators/`

- `expressionEvaluator.ts` evalua expresiones.
- `ifEvaluator.ts`, `whileEvaluator.ts`, `forEvaluator.ts`, `doWhileEvaluator.ts` y `switchEvaluator.ts` evaluan estructuras de control.
- `ioEvaluator.ts` maneja entrada y salida.
- `loopGuard.ts` protege contra bucles demasiado largos.

### `types/`

- `evaluatorContext.ts` define el contrato que consumen los evaluadores.
- `evaluatorContextContracts.ts` define variantes mas especificas.
- `typeChecker.ts` actua como fachada para validacion de tipos.
- `typeValidator.ts` contiene las reglas de compatibilidad.
- `typeCoercer.ts` aplica conversiones controladas.

### `utils/`

- `valueUtils.ts` agrupa helpers de conversion y formateo de valores.

## Flujo de ejecucion

1. El AST llega a `Evaluator`.
2. Se inicializan builtins, entorno, manager de entornos, type checker y registro de callables.
3. Se registran las declaraciones del bloque Ambiente.
4. Se ejecuta el bloque Proceso mediante el dispatcher.
5. Las expresiones, llamadas y estructuras de control delegan a evaluadores especializados.

## Patrones arquitectonicos

### 1. Fachada

`orchestrator/evaluator.ts` expone una entrada unica al interprete y oculta la complejidad interna.

### 2. Estrategia

`statementDispatcher.ts` y los archivos de `evaluators/` implementan el despacho por tipo de sentencia.

### 3. Registro

`builtins/registry.ts` y `callables/callableRegistry.ts` guardan elementos resolubles por nombre.

### 4. Inyeccion de dependencias

`Evaluator` construye su contexto con dependencias concretas y las entrega a los evaluadores especializados.

## Reglas de dependencia

- `orchestrator/` puede importar de todos los demas modulos.
- `evaluators/` puede importar de `types/`, `utils/`, `environment/`, `callables/`, `builtins/` y `constants/`.
- `callables/` puede importar de `builtins/`, `environment/`, `types/` y `constants/`.
- `environment/` no depende de los evaluadores.
- `types/` y `constants/` se mantienen aislados.

## Como extender el interprete

Para agregar una nueva sentencia:

1. Crear el evaluador en `evaluators/`.
2. Registrar el handler en `orchestrator/statementHandlerRegistry.ts`.
3. Ajustar `statementDispatcher.ts` solo si cambia la clasificacion de entrada.

Para agregar una nueva funcion integrada:

1. Implementarla en `builtins/`.
2. Registrarla en `builtins/registry.ts`.

Para agregar una nueva regla de tipos:

1. Actualizar `types/typeValidator.ts`, `types/typeCoercer.ts` o `types/typeChecker.ts` segun corresponda.
