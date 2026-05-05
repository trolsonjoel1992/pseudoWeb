export const ERROR_MESSAGES = {
  VARIABLE_NOT_FOUND: (name: string) => `Variable '${name}' no declarada.`,
  LOOP_EXCESS: (loopType: 'while' | 'for' | 'do-while' | 'generic') => {
    const labels = {
      while: 'Mientras',
      for: 'Para',
      'do-while': 'Repetir',
      generic: 'generico',
    } as const
    return `Bucle ${labels[loopType]} excedió el límite de seguridad.`
  },
  INVALID_NUMBER: (value: unknown, context: string = 'valor') =>
    `${context} no es un número válido: ${String(value)}`,
  SWITCH_UNSUPPORTED_TYPE: 'Tipo no soportado en evaluación de Segun.',
  SWITCH_COMPARISON_NUMERIC_ONLY:
    'En Segun, los casos de comparación (<, >, <=, >=) solo aceptan valores numéricos.',
  SWITCH_TYPE_MISMATCH: 'En Segun, el tipo de la expresión y el tipo del caso deben coincidir.',
}
