Core (src) — Descripción general

Visión general

El paquete `core/src` agrupa los núcleos del lenguaje: `lexer`, `parser` e `interpreter`.
Su responsabilidad es proporcionar las capas necesarias para convertir código fuente en ejecución: desde el escaneo (tokens), pasando por el análisis sintáctico (AST), hasta la evaluación/ejecución del árbol.

Objetivos principales

- Encapsular la lógica del lenguaje (análisis y ejecución).
- Exponer una API clara para integrar con `web` u otras interfaces (compilación/ejecución, herramientas de diagnóstico, pruebas).
- Mantener alta cohesión entre componentes del lenguaje y bajo acoplamiento hacia consumidoras externas.

Estructura y roles

- `lexer/`: detecta tokens y gestiona reglas léxicas. Responsable únicamente de transformar texto en tokens y reportar errores léxicos.
- `parser/`: transforma la secuencia de tokens en un AST validado. Responsable de la estructura sintáctica, recuperación de errores y producción de mensajes semánticos cuando correspondan.
- `interpreter/`: evalúa el AST en tiempo de ejecución; administra entornos, llamadas, builtins y validaciones de tipos.
- `constants/` (por módulo): agrupa constantes locales (tokens, palabras clave, códigos internos, mensajes específicos del módulo).
- `errors.ts` (centralizado opcional): archivo transversal que puede contener códigos y mensajes de error compartidos.

Principios arquitectónicos

- Modularidad por responsabilidad: cada carpeta representa una capa del pipeline de lenguaje.
- Separación clara de responsabilidades (SRP): cada módulo debe limitarse a su dominio lógico.
- Interfaz estable: exponer funciones de alto nivel (`parse()`, `evaluate()`, `tokenize()`) y tipos para pruebas y consumo.

Extensión y mantenimiento

- Para añadir una nueva sentencia o expresion: modificar `parser/syntax` y proporcionar su evaluador en `interpreter/evaluators`.
- Para añadir builtins: implementar en `interpreter/builtins` y registrar en `builtins/registry`.
- Mantener tests unitarios por módulo en `__tests__/`.

Buenas prácticas recomendadas

- Mantener mensajes y constantes de tokens cerca del código que los usa (misma carpeta) salvo cuando son transversales.
- Evitar importaciones circulares: no permitir que `errors.ts` centralizado importe lógica del parser o interpreter.
- Documentar las APIs públicas en comentarios y en `README.md` dentro de `core`.

Fin del documento.
