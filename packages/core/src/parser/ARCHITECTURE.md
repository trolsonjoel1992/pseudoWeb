# Parser Architecture

## Estructura de carpetas

```
parser/
├── ast.ts
├── constants/
│   ├── errorMessages.ts
│   └── index.ts
├── orchestrator/
│   ├── dispatcher.ts
│   ├── handlerRegistry.ts
│   ├── index.ts
│   └── parser.ts
├── state/
│   ├── index.ts
│   ├── parserContext.ts
│   └── parserState.ts
├── syntax/
│   ├── callables.ts
│   ├── controlFlow.ts
│   ├── declarations.ts
│   ├── environment.ts
│   ├── expressions.ts
│   ├── index.ts
│   ├── io.ts
│   └── statements.ts
├── types/
│   ├── control.ts
│   ├── core.ts
│   ├── data.ts
│   ├── dataTypes.ts
│   ├── declarations.ts
│   ├── environment.ts
│   ├── expressions.ts
│   ├── index.ts
│   ├── operations.ts
│   └── statements.ts
└── utils/
    ├── index.ts
    └── tokens.ts
```

## Responsabilidad general

El parser convierte la secuencia de tokens producida por el lexer en un AST con la estructura de la accion, el bloque Ambiente, el bloque Proceso y las sentencias anidadas.

## Componentes principales

### `orchestrator/`

- `parser.ts` expone la clase `Parser` y actua como fachada de entrada.
- `dispatcher.ts` clasifica la sentencia actual y la envia al handler correcto.
- `handlerRegistry.ts` mantiene el registro de handlers sintacticos.

### `syntax/`

- `statements.ts` parsea la estructura general del programa y los bloques de sentencias.
- `environment.ts` parsea el bloque `Ambiente`.
- `callables.ts` parsea funciones y procedimientos.
- `declarations.ts` parsea variables, asignaciones y llamadas como sentencia.
- `expressions.ts` parsea expresiones con precedencia.
- `controlFlow.ts` parsea las estructuras de control.
- `io.ts` parsea `Leer` y `Escribir`.

### `state/`

- `parserContext.ts` define el contrato de navegacion por tokens.
- `parserState.ts` implementa ese contrato sobre el arreglo de tokens.

### `types/`

- `core.ts` y `environment.ts` definen los nodos base del AST.
- `data.ts` y `dataTypes.ts` definen tipos de datos y literales.
- `declarations.ts`, `expressions.ts`, `control.ts` y `statements.ts` agrupan los nodos del lenguaje.
- `operations.ts` modela operadores unarios y binarios.

### `constants/`

- `errorMessages.ts` centraliza mensajes de error reutilizables.

### `utils/`

- `tokens.ts` agrupa helpers de navegacion y consulta sobre tokens.

## Flujo de parseo

1. `Parser.parse()` recibe los tokens ya generados por el lexer.
2. `parseProgram()` valida el encabezado de la accion.
3. `parseEnvironment()` consume el bloque de declaraciones.
4. `parseBlock()` consume el bloque de proceso.
5. `parseStatement()` y el dispatcher resuelven cada sentencia especializada.

## Reglas de dependencia

- `orchestrator/` puede importar de cualquier modulo del parser.
- `syntax/` puede importar de `state/`, `types/`, `utils/`, `constants/` y de los tipos del lexer cuando lo necesita.
- `state/` puede importar de `types/`.
- `utils/` puede importar de `types/` y `constants/`.
- `constants/` no depende de otros modulos del parser.
- `types/` no depende de otros modulos del parser.

## Como extender el parser

1. Agregar o modificar los tipos AST en `types/` si el nuevo nodo lo requiere.
2. Implementar la logica sintactica en `syntax/`.
3. Registrar el handler en `orchestrator/handlerRegistry.ts` si la sentencia se despacha dinamicamente.
4. Exportar el nuevo parser desde `syntax/index.ts`.

## Errores

Los errores sintacticos se mantienen centralizados en `constants/errorMessages.ts`. Cada modulo lanza errores con ubicacion a traves del `ParserContext`, lo que mantiene mensajes consistentes y facilita el diagnostico.
