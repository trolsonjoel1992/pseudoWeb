## Plan: Modularización del parser del core

TL;DR — Qué, por qué y cómo
- Qué: dividir el parser actual en módulos por responsabilidad sintáctica: orquestador del programa, bloque Ambiente, dispatcher de sentencias y parsers especializados (simples, condicionales, repetitivas, declaraciones). Mantener `parserExpressions` y `parserUtils` como libs compartidas.
- Por qué: reduce la complejidad del archivo único, facilita pruebas unitarias de cada familia de sentencias y permite mantenimiento sin romper la lógica de bloques ni el orden obligatorio de Ambiente.
- Cómo: extraer funciones de `parserStatements.ts` en módulos pequeños; dejar un único dispatcher (`parseStatement`) que delega.

**Estructura propuesta (nueva)**
- packages/core/src/parser/
  - gramars/
    - program.ts                  — parseProgram (encabezado acción + orquestación)
    - environment.ts              — parseEnvironment y parsers de declaraciones del Ambiente (constantes, variables, funciones/procedimientos)
    - dispatcher.ts               — parseStatement (único punto de despacho) y parseBlock
    - statements/
      - index.ts                  — reexporta los parsers concretos
      - simple.ts                 — asignación, leer, escribir, declaración de variables (familia "acciones simples")
      - conditional.ts            — si / según / switch
      - loops.ts                  — mientras, para, repetir, do-while
      - declarations.ts           — (si aplica) declaraciones locales si hay (aunque funciones/procedimientos van en environment)
    - (mantener) parserExpressions.ts
  - utils/
    - parserUtils.ts              — advance/consume/match/skipSeparators (sin cambios)
  - gramars/parserState.ts        — sin cambios
  - ast.ts                        — sin cambios salvo nota si hay que exponer nuevos nodos
  - parser.ts                     — pequeña adaptación para importar parseProgram desde gramars/program.ts

**Responsabilidades concretas**
- program.ts: validar encabezado `Accion <id> : ES`, invocar `parseEnvironment`, invocar `parseBlock` para `Proceso`, consumir `FinAccion`.
- environment.ts: leer constantes, variables, funciones y procedimientos en el orden exigido; exponer `parseEnvironment` usado por `program.ts`.


**Extensión: Modularización completa del `core` (lexer, parser, interpreter)**

Resumen corto
- Objetivo: aplicar el mismo criterio de fronteras sintácticas/funcionales a `lexer`, `parser` e `interpreter` para obtener módulos pequeños, testeables y con dependencias claras.

Lexer — propuesta
- Responsabilidad actual: tokenizar entrada; `lexer.ts` + `tokenRules.ts` + `tokenTypes.ts` + `scanners/*` + `utils/charUtils.ts`.
- Problemas a resolver: monolito de reglas, scanners dispersos, difícil añadir nuevos scanners sin tocar `lexer.ts`.
- Estructura propuesta:
  - `lexer/`
    - `index.ts` — export público (`tokenize`, `Token` types)
    - `lexerCore.ts` — pipeline, contrato con scanners (consume tokens, produce `Token[]`)
    - `tokenRules.ts` — definiciones inmutables de tokens y helpers
    - `tokenTypes.ts` — tipos compartidos
    - `scanners/` — cada scanner como plugin
      - `index.ts` — registro de scanners
      - `scanner.ts` — interfaz `Scanner { scan(state): Token | null }`
      - `commentScanner.ts`, `identifierScanner.ts`, `numberScanner.ts`, `operatorScanner.ts`, `stringScanner.ts` — sin cambios lógicos, adaptados al contrato
    - `utils/charUtils.ts` — sin cambios
- Migración:
  1. Extraer interfaz `Scanner` y `lexerCore.ts` que itera scanners.
  2. Mover scanners a `scanners/` y adaptar export/importe.
  3. Mantener `tokenRules.ts` y `tokenTypes.ts` sin cambios funcionales.
- Verificación: tests de `lexer` existentes + añadir test para pipeline con scanners simulados.

Parser — ya propuesto (resumen)
- Mantener `parserExpressions.ts` y `parserUtils.ts`.
- Crear módulos por frontera sintáctica: `program.ts`, `environment.ts`, `dispatcher.ts`, `statements/{simple,conditional,loops,declarations}`.
- `parseBlock` recomendado en `dispatcher.ts`.
- Migración en fases atómicas con tests tras cada fase.

Interpreter — propuesta
- Responsabilidad actual: evaluar AST, manejar ambiente, IO y control de flujo. Archivos: `environment.ts`, `evaluator.ts`, `evaluators/{controlFlowEvaluator,expressionEvaluator,ioEvaluator}`, `utils/valueUtils.ts`.
- Problemas: `evaluator.ts` orquesta todo; evaluadores mezclan responsabilidades; difícil probar evaluadores aislados.
- Estructura propuesta:
  - `interpreter/`
    - `index.ts` — API pública (`run`, `evaluate`, tipos públicos)
    - `environment.ts` — manejo de scope/variables (sin cambios lógicos)
    - `evaluatorCore.ts` — dispatcher de nodos AST: recibe `StatementNode|ExpressionNode` y delega
    - `evaluators/` — evaluadores por familia
      - `controlFlow.ts` — if/while/for/do-while/switch
      - `io.ts` — read/write
      - `expression.ts` — evaluador de expresiones y llamadas a funciones
      - `functions.ts` — llamada/definición de funciones/procedimientos (si aplica)
    - `utils/valueUtils.ts` — sin cambios
- Migración:
  1. Extraer `evaluatorCore.ts` que contiene el dispatcher y firma pública.
  2. Mover funciones de `evaluator.ts` a `evaluators/*` por familia.
  3. Asegurar que `environment.ts` es independiente y testeable.
  4. Mantener `io` aislado para poder simular E/S en tests.
- Verificación: tests unitarios por evaluador y tests de integración usando `run`.

Pasos globales y estrategia de commits
1. Preparar branch `refactor/parser-modularization` (o `refactor/core-modularization`).
2. Migración por paquete y en pequeñas PRs atómicas: `lexer` → `parser` → `interpreter`.
3. Para cada extracción: crear archivo nuevo(s), actualizar imports, ejecutar tests y commit. Mensajes: "refactor(lexer): extraer scanners a lexer/scanners".
4. Añadir `README.md` corto en `packages/core/src/{lexer,parser,interpreter}` explicando convención y contratos públicos.

Verificación final
- Ejecutar la suite de `packages/core` completa y asegurar 100% de tests previos pasan.
- Añadir tests nuevos por módulo para mantener cobertura.

Decisiones rápidas para que confirmes
- Preferís que haga la migración por paquete en este orden: `parser` (ya empezado) → `lexer` → `interpreter`, o querés priorizar `lexer` primero?
- Preferís exports con `export function` (recomendado) y `index.ts` que reexporte, o default exports y clases? Recomiendo funciones nombradas y `index.ts` reexport.
- Querés que aplique la primera extracción ahora (por ejemplo: `statements/simple.ts`) o que genere PRs simulados (patches) para revisión antes de aplicar?

Riesgos residuales
- Imports circulares: buscar y corregir tras cada extracción.
- Ruptura de tests por referencias implícitas (ej.: tokens construidos en tests que dependen de `lexer`). Mitigación: ejecutar tests y ajustar fixtures.

Siguiente paso propuesto
- Si confirmás, empiezo aplicando el primer cambio: extraer `assign/read/write/variableDeclaration` a `packages/core/src/parser/gramars/statements/simple.ts` y crear `statements/index.ts` con reexports. Aplico patch atómico y corro tests en `packages/core`.

- dispatcher.ts: exponer `parseStatement(state): StatementNode` y `parseBlock(state, stoppers)`; implementa la lógica de reconocimiento (match tokens iniciales) y delega a statements/*. Mantener tolerancia a separadores aquí.
- statements/simple.ts: parseAssignment, parseRead, parseWrite, parseVariableDeclaration.
- statements/conditional.ts: parseIf, parseSwitch. Debe devolver nodos `IfNode`, `SwitchNode`.
- statements/loops.ts: parseWhile, parseFor, parseDoWhile, parseRepetir.
- statements/declarations.ts: (opcional) helpers para parsear firmas de función/procedimiento si alguna parte queda compartida.
- parserExpressions.ts: sin cambios.
- parserUtils.ts & parserState.ts: sin cambios.

**Pasos de migración (ordenados, atómicos)**
1. Crear la carpeta `statements` y mover/extraer `parseAssignment`, `parseRead`, `parseWrite`, `parseVariableDeclaration` a `simple.ts`. Dejar exportadas las funciones.
2. Extraer `parseIf` y casos relacionados a `conditional.ts`.
3. Extraer `parseWhile`, `parseFor`, `parseDoWhile` a `loops.ts`.
4. Crear `dispatcher.ts` con la implementación de `parseStatement` que solo importa y delega a los módulos de `statements`.
5. Extraer `parseEnvironment` a `environment.ts` (mover parseFunction/parseProcedure allí). Verificar orden estricto de fases.
6. Extraer `parseProgram` a `program.ts` y actualizar `parser.ts` para importar desde allí.
7. Ejecutar tests existentes: `pnpm test` en `packages/core` (o el comando de test que use el repo). Corregir importes y tipos.
8. Crear tests unitarios nuevos para cada archivo de `statements` (tomas pequeñas con tokens construidos) y mantener integración completa.

**Cambios mínimos en API/AST**
- No cambiar tipos en `ast.ts`. Los módulos solo exportan funciones de parseo que retornan los mismos nodos existentes.

**Verificación (checks automáticos y manuales)**
1. Ejecutar la suite de tests en `packages/core` y asegurarse de que todos pasen.
2. Añadir 3 tests de humo: parseo de un programa mínimo, parseo de un ambiente con función, parseo de un bloque con condicional y bucle.
3. Revisar cobertura por archivo para asegurar que cada nuevo módulo tenga tests básicos.
4. Verificar que `parseBlock` preserve el comportamiento de `skipSeparators` y el reconocimiento de stoppers.

**Riesgos y mitigaciones**
- Riesgo: romper el orden obligatorio en `Ambiente` al mover parseFunction/parseProcedure. Mitigación: extraer con tests que validen fases (constantes antes que variables antes que funciones).
- Riesgo: referencias cruzadas entre parsers (ej.: declaración de función usando parseExpression). Mitigación: mantener `parserExpressions.ts` y `parserUtils.ts` como libs importadas por todos.

**Archivos a tocar (lista precisa)**
- [packages/core/src/parser/gramars/parserStatements.ts](packages/core/src/parser/gramars/parserStatements.ts) — refactor: dividir y quedará reducido a exports o eliminar según migración.
- [packages/core/src/parser/gramars/parserExpressions.ts](packages/core/src/parser/gramars/parserExpressions.ts) — sin cambios.
- [packages/core/src/parser/utils/parserUtils.ts](packages/core/src/parser/utils/parserUtils.ts) — sin cambios.
- [packages/core/src/parser/gramars/parserState.ts](packages/core/src/parser/gramars/parserState.ts) — sin cambios.
- [packages/core/src/parser/parser.ts](packages/core/src/parser/parser.ts) — actualizar import a program.ts.
+ Nuevos archivos propuestos:
- [packages/core/src/parser/gramars/program.ts](packages/core/src/parser/gramars/program.ts)
- [packages/core/src/parser/gramars/environment.ts](packages/core/src/parser/gramars/environment.ts)
- [packages/core/src/parser/gramars/dispatcher.ts](packages/core/src/parser/gramars/dispatcher.ts)
- [packages/core/src/parser/gramars/statements/index.ts](packages/core/src/parser/gramars/statements/index.ts)
- [packages/core/src/parser/gramars/statements/simple.ts](packages/core/src/parser/gramars/statements/simple.ts)
- [packages/core/src/parser/gramars/statements/conditional.ts](packages/core/src/parser/gramars/statements/conditional.ts)
- [packages/core/src/parser/gramars/statements/loops.ts](packages/core/src/parser/gramars/statements/loops.ts)

**Tareas de calidad y seguimiento**
1. Hacer commits atómicos por cada extracción (un PR por fase 1–6). Mensajes claros: "parser: extraer sentencias simples a statements/simple.ts".
2. Revisar imports circulares; busca `import { parseExpression } from './parserExpressions'` en cada módulo.
3. Añadir README corto en `packages/core/src/parser/` explicando la convención: "módulos = fronteras sintácticas".

