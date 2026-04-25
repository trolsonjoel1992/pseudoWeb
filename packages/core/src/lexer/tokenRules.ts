// Reglas de reconocimiento de tokens para el intérprete de pseudocódigo
import { TokenType } from "./tokenTypes";

export const tokenRules: { regex: RegExp; type: TokenType }[] = [
  // Palabras clave
  { regex: /^Accion\b/, type: TokenType.Accion },
  { regex: /^FinAccion\b/, type: TokenType.FinAccion },
  { regex: /^Si\b/, type: TokenType.Si },
  { regex: /^Sino\b/, type: TokenType.Sino },
  { regex: /^FinSi\b/, type: TokenType.FinSi },
  { regex: /^Mientras\b/, type: TokenType.Mientras },
  { regex: /^FinMientras\b/, type: TokenType.FinMientras },
  { regex: /^Para\b/, type: TokenType.Para },
  { regex: /^FinPara\b/, type: TokenType.FinPara },
  { regex: /^Repetir\b/, type: TokenType.Repetir },
  { regex: /^Hasta que\b/, type: TokenType.HastaQue },
  { regex: /^Segun\b/, type: TokenType.Segun },
  { regex: /^Hacer\b/, type: TokenType.Hacer },
  { regex: /^Otro\b/, type: TokenType.Otro },
  { regex: /^FinSegun\b/, type: TokenType.FinSegun },
  { regex: /^Leer\b/, type: TokenType.Leer },
  { regex: /^Escribir\b/, type: TokenType.Escribir },

  // Operadores
  { regex: /^:=/, type: TokenType.Asignacion },
  { regex: /^\+/, type: TokenType.Suma },
  { regex: /^-/, type: TokenType.Resta },
  { regex: /^\*/, type: TokenType.Multiplicacion },
  { regex: /^\//, type: TokenType.Division },
  { regex: /^DIV\b/, type: TokenType.Div },
  { regex: /^MOD\b/, type: TokenType.Mod },
  { regex: /^\*\*/, type: TokenType.Potencia },

  // Operadores relacionales
  { regex: /^=/, type: TokenType.Igual },
  { regex: /^<>/, type: TokenType.Distinto },
  { regex: /^</, type: TokenType.Menor },
  { regex: /^>/, type: TokenType.Mayor },
  { regex: /^<=/, type: TokenType.MenorIgual },
  { regex: /^>=/, type: TokenType.MayorIgual },

  // Operadores lógicos
  { regex: /^Y\b/, type: TokenType.Y },
  { regex: /^O\b/, type: TokenType.O },
  { regex: /^NO\b/, type: TokenType.No },

  // Delimitadores
  { regex: /^\(/, type: TokenType.ParentesisIzquierdo },
  { regex: /^\)/, type: TokenType.ParentesisDerecho },
  { regex: /^:/, type: TokenType.DosPuntos },
  { regex: /^,/, type: TokenType.Coma },
  { regex: /^\.\./, type: TokenType.Rango },

  // Separadores
  { regex: /^;/, type: TokenType.PuntoYComa },
  { regex: /^\n/, type: TokenType.SaltoDeLinea },

  // Literales
  { regex: /^\d+/, type: TokenType.Entero },
  { regex: /^\d+\.\d+/, type: TokenType.Real },
  { regex: /^'[^']*'/, type: TokenType.Caracter },
  { regex: /^"[^"]*"/, type: TokenType.Alfanumerico },

  // Identificadores
  { regex: /^[a-zA-Z_][a-zA-Z0-9_]*/, type: TokenType.Identificador },

  // Comentarios
  { regex: /^\/\*[\s\S]*?\*\//, type: TokenType.Comentario },

  // Desconocido
  { regex: /^./, type: TokenType.Desconocido }
];

// Palabras clave
export const KEYWORDS: Readonly<Record<string, TokenType>> = {
  accion: TokenType.Accion,
  finaccion: TokenType.FinAccion,
  si: TokenType.Si,
  sino: TokenType.Sino,
  finsi: TokenType.FinSi,
  mientras: TokenType.Mientras,
  finmientras: TokenType.FinMientras,
  para: TokenType.Para,
  finpara: TokenType.FinPara,
  hacer: TokenType.Hacer,
  repetir: TokenType.Repetir,
  hastaque: TokenType.HastaQue,
  funcion: TokenType.Funcion,
  procedimiento: TokenType.Procedimiento,
  retornar: TokenType.Retornar,
  segun: TokenType.Segun,
  otro: TokenType.Otro,
  fisegun: TokenType.FinSegun,
  escribir: TokenType.Escribir,
  leer: TokenType.Leer,
  entonces: TokenType.Entonces,
  fin: TokenType.Fin,
  verdadero: TokenType.Verdadero,
  falso: TokenType.Falso,
  div: TokenType.Div,
  mod: TokenType.Mod,
  y: TokenType.Y,
  o: TokenType.O,
  no: TokenType.No,
};

// Función para resolver identificadores
export const resolveIdentifierType = (lexeme: string): TokenType => {
  return KEYWORDS[lexeme.toLowerCase()] ?? TokenType.Identificador;
};