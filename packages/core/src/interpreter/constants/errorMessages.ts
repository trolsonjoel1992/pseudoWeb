export const ERROR_MESSAGES = {
  // Variable and access errors
  VARIABLE_NOT_FOUND: (name: string) => `Variable '${name}' no declarada.`,

  // Loop errors
  LOOP_EXCESS: (loopType: 'while' | 'for' | 'do-while' | 'generic') => {
    const labels = {
      while: 'Mientras',
      for: 'Para',
      'do-while': 'Repetir',
      generic: 'generico',
    } as const
    return `Bucle ${labels[loopType]} excedió el límite de seguridad.`
  },
  FOR_STEP_ZERO: 'El paso del Para no puede ser cero.',

  // Type and value errors
  INVALID_NUMBER: (value: unknown, context: string = 'valor') =>
    `${context} no es un número válido: ${String(value)}`,

  // Expression evaluation errors
  UNKNOWN_EXPRESSION: (type: string) => `Expresión desconocida: ${type}`,
  UNKNOWN_UNARY_OPERATOR: (op: string) => `Operador unario no soportado: ${op}`,
  UNKNOWN_BINARY_OPERATOR: (op: string) => `Operador binario no soportado: ${op}`,
  UNKNOWN_STATEMENT_NODE: (type: string) => `Nodo de sentencia desconocido: ${type}`,

  // Arithmetic errors
  DIVISION_BY_ZERO: 'División por cero.',
  INTEGER_DIVISION_BY_ZERO: 'División entera por cero.',
  MODULO_BY_ZERO: 'Módulo por cero.',

  // Function/Procedure call errors
  NO_FUNCTION_OR_PROCEDURE: (name: string) => `No existe una función o procedimiento llamado '${name}'.`,
  INVALID_ARGUMENT_COUNT: (name: string, expected: number, received: number) =>
    `Cantidad de argumentos inválida en '${name}'. Esperados: ${expected}, recibidos: ${received}.`,

  // Switch statement errors
  SWITCH_UNSUPPORTED_TYPE: 'Tipo no soportado en evaluación de Segun.',
  SWITCH_COMPARISON_NUMERIC_ONLY:
    'En Segun, los casos de comparación (<, >, <=, >=) solo aceptan valores numéricos.',
  SWITCH_TYPE_MISMATCH: 'En Segun, el tipo de la expresión y el tipo del caso deben coincidir.',
} as const
