# Lexer

El lexer convierte el texto fuente en tokens. La entrada principal vive en [packages/core/src/lexer/lexer.ts](../../packages/core/src/lexer/lexer.ts#L9).

## Vista de flujo

```mermaid
flowchart TD
  A[Lexer.tokenize] --> B[scanToken]
  B --> C{Caracter actual}
  C -->|espacio/tab| D[advance]
  C -->|salto de linea| E[addToken SaltoDeLinea]
  C -->|/*| F[skipBlockComment]
  C -->|" o '| G[scanStringToken]
  C -->|digito| H[scanNumberToken]
  C -->|letra o _| I[scanIdentifierToken]
  C -->|operador| J[scanOperatorToken]

  I --> I1[resolveIdentifierType]
  H --> H1[Entero o Real]
  G --> G1[Alfanumerico o Caracter]
  F --> F1[ignora hasta */]
  J --> J1[TokenType segun lexema]
```

## Archivo principal

- [packages/core/src/lexer/lexer.ts](../../packages/core/src/lexer/lexer.ts#L9)
  - [tokenize()](../../packages/core/src/lexer/lexer.ts#L30) recorre todo el source y agrega EOF.
  - [scanToken()](../../packages/core/src/lexer/lexer.ts#L47) decide qué rama tomar según el caracter actual.
  - [addToken()](../../packages/core/src/lexer/lexer.ts#L128) centraliza creación de tokens con posición.
  - [advance()](../../packages/core/src/lexer/lexer.ts#L147), [peek()](../../packages/core/src/lexer/lexer.ts#L161), [peekNext()](../../packages/core/src/lexer/lexer.ts#L165) e [isAtEnd()](../../packages/core/src/lexer/lexer.ts#L169) mantienen el cursor.

## Scanners internos

- [packages/core/src/lexer/scanners/identifierScanner.ts](../../packages/core/src/lexer/scanners/identifierScanner.ts#L1)
  - [scanIdentifierToken()](../../packages/core/src/lexer/scanners/identifierScanner.ts#L17) agrupa letras y clasifica palabras reservadas.
- [packages/core/src/lexer/scanners/numberScanner.ts](../../packages/core/src/lexer/scanners/numberScanner.ts#L1)
  - [scanNumberToken()](../../packages/core/src/lexer/scanners/numberScanner.ts#L17) detecta enteros y reales.
- [packages/core/src/lexer/scanners/stringScanner.ts](../../packages/core/src/lexer/scanners/stringScanner.ts#L1)
  - [scanStringToken()](../../packages/core/src/lexer/scanners/stringScanner.ts#L17) interpreta escapes y cierra comillas.
- [packages/core/src/lexer/scanners/commentScanner.ts](../../packages/core/src/lexer/scanners/commentScanner.ts#L1)
  - [skipBlockComment()](../../packages/core/src/lexer/scanners/commentScanner.ts#L12) avanza hasta `*/`.
- [packages/core/src/lexer/operatorScanner.ts](../../packages/core/src/lexer/operatorScanner.ts#L1)
  - [scanOperatorToken()](../../packages/core/src/lexer/operatorScanner.ts#L15) resuelve `:=`, `..`, `**`, relacionales y separadores.
- [packages/core/src/lexer/utils/charUtils.ts](../../packages/core/src/lexer/utils/charUtils.ts#L1)
  - [isDigit()](../../packages/core/src/lexer/utils/charUtils.ts#L1), [isAlpha()](../../packages/core/src/lexer/utils/charUtils.ts#L5) e [isAlphaNumeric()](../../packages/core/src/lexer/utils/charUtils.ts#L9) encapsulan reglas de caracter.

## Cómo pensar el flujo

1. `Lexer.tokenize()` itera el source completo.
2. `scanToken()` clasifica la próxima unidad léxica.
3. El scanner especializado consume caracteres y llama a `addToken()`.
4. El parser recibe una secuencia limpia y ordenada de tokens.