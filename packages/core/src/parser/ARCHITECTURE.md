# Parser Architecture

## Estructura

parser/
  constants/     Mensajes de error centralizados
  orchestrator/  Clase Parser, dispatcher y registro de handlers
  syntax/        Analizadores sintácticos especializados
  state/         Estado interno e interfaz pública del parser
  types/         Nodos del AST y utilidades de tipos del lenguaje
  utils/         Utilidades de navegación del stream de tokens

## Analogías con interpreter/

- interpreter/orchestrator/evaluator.ts          -> orchestrator/parser.ts
- interpreter/orchestrator/statementDispatcher   -> orchestrator/dispatcher.ts
- interpreter/orchestrator/statementHandlerReg   -> orchestrator/handlerRegistry.ts
- interpreter/evaluators/*.ts                    -> syntax/*.ts
- interpreter/environment/environment.ts         -> state/parserState.ts
- interpreter/types/evaluatorContext.ts          -> state/parserContext.ts
- interpreter/constants/errorMessages.ts         -> constants/errorMessages.ts
- interpreter/utils/valueUtils.ts                -> utils/tokens.ts

## Reglas de dependencia

- orchestrator/ puede importar de todos los demás módulos.
- syntax/ puede importar de state/, utils/, types/, constants/.
- utils/ puede importar de types/ y constants/.
- state/ puede importar de types/.
- constants/ no importa nada del parser.
- types/ no importa nada del parser.

## Cómo agregar una nueva sentencia

1. Implementar el parser en syntax/<archivo>.ts.
2. Exportarlo desde syntax/index.ts.
3. Registrar el handler en orchestrator/handlerRegistry.ts.
4. No es necesario modificar dispatcher.ts.

## Cómo agregar un nuevo mensaje de error

1. Agregar la constante o función a constants/errorMessages.ts.
2. Importar y usar en el módulo correspondiente.
