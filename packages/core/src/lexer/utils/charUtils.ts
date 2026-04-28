export function isDigit(char: string): boolean {
  return char >= '0' && char <= '9'
}

export function isAlpha(char: string): boolean {
  return /[A-Za-z_ÁÉÍÓÚÜÑáéíóúüñ]/.test(char)
}

export function isAlphaNumeric(char: string): boolean {
  return isAlpha(char) || isDigit(char)
}
