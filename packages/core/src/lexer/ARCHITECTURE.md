# Lexer Architecture

## Estructura de carpetas

```
lexer/
├── orchestrator/
│   ├── lexer.ts
│   ├── lexerContext.ts
│   ├── lexerState.ts
│   └── index.ts
├── scanners/
│   ├── commentScanner.ts
│   ├── identifierScanner.ts
│   ├── numberScanner.ts
│   ├── operatorScanner.ts
│   ├── stringScanner.ts
│   └── index.ts
├── types/
│   ├── index.ts
│   ├── lexerError.ts
│   ├── scannerContext.ts
│   ├── token.ts
│   ├── tokenRules.ts
│   └── tokenType.ts
└── utils/
    ├── charUtils.ts
    └── index.ts
```

## Responsabilidad general

El lexer convierte el texto fuente de pseudoWeb en tokens. Su salida alimenta al parser y debe preservar lexemas, tipos y ubicacion para que los errores sintacticos sean precisos.

## Componentes principales

### `orchestrator/`

- `lexer.ts` coordina el analisis completo.
- `lexerState.ts` mantiene el cursor, la linea, la columna y el buffer de tokens.
- `lexerContext.ts` define el contrato consumido por los scanners.

### `scanners/`

- `numberScanner.ts` reconoce enteros y reales.
- `stringScanner.ts` reconoce textos entre comillas con escapes basicos.
- `identifierScanner.ts` reconoce identificadores y palabras reservadas.
- `operatorScanner.ts` reconoce operadores y delimitadores simples.
- `commentScanner.ts` descarta comentarios de linea y bloque.

### `types/`

- `tokenType.ts` centraliza la enumeracion de tokens.
- `token.ts` define la forma comun de un token.
- `tokenRules.ts` resuelve palabras reservadas y casos especiales como DIV y MOD.
- `lexerError.ts` encapsula errores del analizador lexico.
- `scannerContext.ts` reexporta el contrato de contexto.

### `utils/`

- `charUtils.ts` contiene utilidades de clasificacion de caracteres.

## Flujo de trabajo

1. `Lexer.tokenize()` crea el estado de recorrido.
2. El estado avanza por el codigo fuente hasta el final.
3. Cada caracter inicial se clasifica en `scanToken()`.
4. El lexer delega al scanner correspondiente segun el tipo de lexema.
5. El scanner construye o descarta el token segun corresponda.
6. El lexer agrega `EOF` al finalizar.

## Reglas y convenciones

- Los espacios, retornos de carro y tabulaciones se omiten.
- Los saltos de linea se emiten como `SaltoDeLinea`.
- Las palabras reservadas se resuelven de forma case-insensitive mediante `tokenRules.ts`.
- `DIV` y `MOD` en mayusculas se reconocen como operadores especiales.
- Los comentarios no se emiten como tokens.
- Los errores lexico se lanzan con `LexerError`.

## Como extender el lexer

1. Agregar o ajustar el token en `types/tokenType.ts`.
2. Actualizar `types/tokenRules.ts` si la palabra es reservada o tiene una regla especial.
3. Implementar el reconocimiento en el scanner correspondiente o crear uno nuevo.
4. Exportar el nuevo scanner desde `scanners/index.ts` si aplica.

## Dependencias

- `orchestrator/` puede importar de `scanners/`, `types/` y `utils/`.
- `scanners/` dependen del contrato de `types/scannerContext.ts` y de `types/tokenType.ts`.
- `types/` no dependen de los scanners.
- `utils/` solo agrupan helpers puros.