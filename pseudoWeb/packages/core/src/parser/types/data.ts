// Data types and literal values

export type DataType =
  | 'Entero'
  | 'Real'
  | 'Caracter'
  | 'Alfanumerico'
  | 'Logico'
  | { kind: 'AN'; maxLength: number }
  | { kind: 'Secuencia'; elementType: DataType }

export type LiteralValue = string | number | boolean | null
