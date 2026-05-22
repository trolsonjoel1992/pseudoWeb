import { ErrorCode } from '../errors'

export const ErrorMessages: Record<string, string | ((...args: any[]) => string)> = {
  [ErrorCode.LEX_UNEXPECTED_CHAR]: (char: string) => `Carácter inesperado: '${char}'`,
  [ErrorCode.LEX_UNTERMINATED_STRING]: 'Cadena de texto no cerrada',
  [ErrorCode.LEX_INVALID_NUMBER]: (val: string) => `Número inválido: '${val}'`,

  [ErrorCode.PAR_UNEXPECTED_TOKEN]: (tok: string) => `Token inesperado: '${tok}'`,
  [ErrorCode.PAR_MISSING_CLOSING]: (sym: string) => `Se esperaba '${sym}' de cierre`,
  [ErrorCode.PAR_INVALID_EXPRESSION]: 'Expresión inválida',

  [ErrorCode.RUN_UNDEFINED_IDENTIFIER]: (name: string) => `Identificador no definido: '${name}'`,
  [ErrorCode.RUN_TYPE_MISMATCH]: (exp: string, got: string) =>
    `Se esperaba tipo '${exp}', se recibió '${got}'`,
  [ErrorCode.RUN_DIVISION_BY_ZERO]: 'División por cero',
  [ErrorCode.RUN_STACK_OVERFLOW]: 'Desbordamiento de pila (recursión excesiva)',
  [ErrorCode.RUN_INVALID_ARGUMENT]: (fn: string) => `Argumento inválido en '${fn}'`,
  [ErrorCode.RUN_RETURN_OUTSIDE_FN]: "Instrucción 'retornar' fuera de una función",
}

export function buildMessage(code: string, ...args: any[]) {
  const template = ErrorMessages[code]
  return typeof template === 'function' ? template(...args) : template
}

export default ErrorMessages
