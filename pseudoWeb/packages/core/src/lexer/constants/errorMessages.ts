export const ERR_UNTERMINATED_STRING = (line: number, col: number) =>
  `Cadena sin cerrar en línea ${line}, columna ${col}`

export const ERR_UNEXPECTED_CHARACTER = (char: string, line: number, col: number) =>
  `Carácter inesperado '${char}' en línea ${line}, columna ${col}`

export const ERR_UNTERMINATED_BLOCK_COMMENT = (line: number, col: number) =>
  `Comentario de bloque sin cerrar, abierto en línea ${line}, columna ${col}`
