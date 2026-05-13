// Program structure errors
export const ERR_EXPECTED_ACTION_HEADER = 'Se esperaba el encabezado "Accion <nombre> : ES"'
export const ERR_EXPECTED_ACTION_NAME = 'Se esperaba un identificador para el nombre de la Accion'
export const ERR_EXPECTED_COLON_AFTER_ACTION = "Se esperaba ':' después del nombre de la Accion"
export const ERR_EXPECTED_ES_KEYWORD = "Se esperaba 'ES' después de ':' en el encabezado de la Accion"
export const ERR_EXPECTED_AMBIENTE_BLOCK = 'Se esperaba el bloque "Ambiente" tras el encabezado de la Accion'
export const ERR_EXPECTED_PROCESO_BLOCK = 'Se esperaba el bloque "Proceso" después de Ambiente'
export const ERR_EXPECTED_FIN_ACCION = "Se esperaba 'FinAccion' al final de la Accion"

// Environment declaration errors
export const ERR_CONSTANTS_BEFORE_VARIABLES = 'Constantes deben declararse antes que las variables y funciones en Ambiente'
export const ERR_VARIABLES_BEFORE_CALLABLES = 'Las variables deben declararse antes que funciones y procedimientos en Ambiente'
export const ERR_INVALID_AMBIENTE_DECLARATION = 'Declaración no válida en Ambiente'

// Identifier errors
export const ERR_EXPECTED_IDENTIFIER = 'Se esperaba un identificador'
export const ERR_EXPECTED_EQUAL = "Se esperaba '='"
export const ERR_EXPECTED_LITERAL_IN_CONSTANT_DECLARATION = 'Se esperaba un literal al declarar una constante'
export const ERR_EXPECTED_VARIABLE = 'Se esperaba una variable'
export const ERR_EXPECTED_VARIABLE_NAME_IN_READ = 'Se esperaba un identificador en Leer'

// Function/Procedure errors
export const ERR_EXPECTED_FUNCTION_NAME = 'Se esperaba nombre de función'
export const ERR_EXPECTED_PROCEDURE_NAME = 'Se esperaba nombre de procedimiento'
export const ERR_EXPECTED_OPEN_PAREN_AFTER_FUNCTION = "Se esperaba '(' después del nombre de la función"
export const ERR_EXPECTED_PARAMETER_NAME = 'Se esperaba nombre de parámetro'
export const ERR_EXPECTED_COLON_IN_PARAMETER = "Se esperaba ':' al declarar parámetro"
export const ERR_EXPECTED_CLOSE_PAREN_AFTER_PARAMS = "Se esperaba ')' después de parámetros"
export const ERR_EXPECTED_COLON_BEFORE_RETURN_TYPE = "Se esperaba ':' antes del tipo de retorno"
export const ERR_EXPECTED_PROCESO_IN_FUNCTION = "Se esperaba 'Proceso' en la función"
export const ERR_EXPECTED_PROCESO_IN_PROCEDURE = "Se esperaba 'Proceso' en el procedimiento"
export const ERR_EXPECTED_FIN_FUNCTION = "Se esperaba 'FinFuncion'"
export const ERR_EXPECTED_FIN_PROCEDURE = "Se esperaba 'FinProcedimiento'"

// Variable declaration errors
export const ERR_EXPECTED_COLON_AFTER_VARIABLES = "Se esperaba ':' después de las variables"

// Assignment errors
export const ERR_EXPECTED_ASSIGN_OP = "Se esperaba ':=' en la asignación"

// Call statement errors
export const ERR_EXPECTED_CALL_NAME = 'Se esperaba el nombre de la llamada'
export const ERR_EXPECTED_OPEN_PAREN_IN_CALL = "Se esperaba '(' en la llamada"
export const ERR_EXPECTED_CLOSE_PAREN_IN_CALL = "Se esperaba ')' al cerrar la llamada"

// Expression errors
export const ERR_EXPECTED_EXPRESSION = 'Se esperaba una expresión'
export const ERR_EXPECTED_CLOSE_PAREN_AFTER_ARGS = "Se esperaba ')' después de los argumentos"
export const ERR_EXPECTED_CLOSE_PAREN_AFTER_EXPR = "Se esperaba ')' después de la expresión"
export const ERR_EXPECTED_CLOSE_PAREN_IN_LIST = "Se esperaba ')' al cerrar la lista"
export const ERR_UNSUPPORTED_BINARY_OPERATOR = 'Operador binario no soportado'
export const ERR_UNSUPPORTED_UNARY_OPERATOR = 'Operador unario no soportado'

// Data type errors
export const ERR_EXPECTED_DATA_TYPE = 'Se esperaba un tipo de dato'
export const ERR_EXPECTED_OPEN_PAREN_AN_TYPE = "Se esperaba '(' en el tipo AN(n)"
export const ERR_EXPECTED_INTEGER_LENGTH_AN_TYPE = 'Se esperaba una longitud entera positiva en AN(n)'
export const ERR_EXPECTED_CLOSE_PAREN_AN_TYPE = "Se esperaba ')' al cerrar AN(n)"
export const ERR_INVALID_AN_LENGTH = 'La longitud en AN(n) debe ser un entero positivo'

// Control flow errors
export const ERR_EXPECTED_COLON_AFTER_CASE = "Se esperaba ':' después del valor o rango en Segun"
export const ERR_EXPECTED_FIN_SEGUN = "Se esperaba 'FinSegun'"
export const ERR_EXPECTED_HASTA_QUE = "Se esperaba 'HastaQue' después del bloque Repetir"
export const ERR_EXPECTED_ENTONCES = "Se esperaba 'Entonces' tras la condición Si"
export const ERR_EXPECTED_FIN_SI = 'Se esperaba FinSi'
export const ERR_EXPECTED_HACER_IN_WHILE = "Se esperaba 'Hacer' en Mientras"
export const ERR_EXPECTED_FIN_MIENTRAS = 'Se esperaba FinMientras'
export const ERR_EXPECTED_COUNTER_NAME = 'Se esperaba el nombre del contador'
export const ERR_EXPECTED_ASSIGN_IN_FOR = "Se esperaba ':=' en el Para"
export const ERR_EXPECTED_UNTIL_IN_FOR = "Se esperaba 'Hasta' en el Para"
export const ERR_EXPECTED_HACER_IN_FOR = "Se esperaba 'Hacer' en el Para"
export const ERR_EXPECTED_FIN_PARA = 'Se esperaba FinPara'

// Statement errors
export const ERR_INVALID_STATEMENT = 'Sentencia no válida'
export const ERR_NO_DECLARATIONS_IN_PROCESO = 'Las declaraciones de variables solo se permiten en el bloque Ambiente, no en Proceso'

// Scope errors
export function ERR_REDECLARED_IDENTIFIER(name: string): string {
  return `Identificador redeclarado en el mismo alcance: '${name}'`
}

export function ERR_SHADOWING_NOT_ALLOWED(name: string): string {
  return `No se permite shadowing: '${name}' ya existe en el alcance externo`
}

// Error formatting helpers
export const ERR_LOCATION_EOF = 'al final del archivo'
export function ERR_LOCATION_TOKEN(lexeme: string): string {
  return `en '${lexeme}'`
}
