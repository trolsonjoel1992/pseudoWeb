import { TokenType } from './tokenTypes'

export const KEYWORDS: Readonly<Record<string, TokenType>> = {
  accion: TokenType.Accion,
  finaccion: TokenType.FinAccion,
  si: TokenType.Si,
  sino: TokenType.SiNo,
  finsi: TokenType.FinSi,
  mientras: TokenType.Mientras,
  finmientras: TokenType.FinMientras,
  para: TokenType.Para,
  finpara: TokenType.FinPara,
  hacer: TokenType.Hacer,
  repetir: TokenType.Repetir,
  hasta: TokenType.Hasta,
  hastaque: TokenType.HastaQue,
  entero: TokenType.Entero,
  real: TokenType.Real,
  caracter: TokenType.Caracter,
  alfanumerico: TokenType.Alfanumerico,
  funcion: TokenType.Funcion,
  finfuncion: TokenType.FinFuncion,
  procedimiento: TokenType.Procedimiento,
  finprocedimiento: TokenType.FinProcedimiento,
  segun: TokenType.Segun,
  otro: TokenType.Otro,
  finsegun: TokenType.FinSegun,
  es: TokenType.ES,
  ambiente: TokenType.Ambiente,
  proceso: TokenType.Proceso,
  escribir: TokenType.Escribir,
  leer: TokenType.Leer,
  entonces: TokenType.Entonces,
  verdadero: TokenType.Verdadero,
  falso: TokenType.Falso,
  logico: TokenType.Logico,
  y: TokenType.Y,
  o: TokenType.O,
  no: TokenType.No,
}

export const resolveIdentifierType = (lexeme: string): TokenType => {
  // DIV y MOD son obligatoriamente en mayúsculas.
  if (lexeme === 'DIV') return TokenType.Div
  if (lexeme === 'MOD') return TokenType.Mod

  return KEYWORDS[lexeme.toLowerCase()] ?? TokenType.Identificador;
}