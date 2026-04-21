// Enumeración de tipos de tokens para el intérprete de pseudocódigo

export enum TokenType {
  // Palabras clave
  Accion = "Accion",
  FinAccion = "FinAccion",
  Si = "Si",
  Sino = "Sino",
  FinSi = "FinSi",
  Mientras = "Mientras",
  FinMientras = "FinMientras",
  Para = "Para",
  FinPara = "FinPara",
  Repetir = "Repetir",
  HastaQue = "HastaQue",
  Segun = "Segun",
  Hacer = "Hacer",
  Otro = "Otro",
  FinSegun = "FinSegun",
  Leer = "Leer",
  Escribir = "Escribir",
  Funcion = "Funcion",
  Procedimiento = "Procedimiento",
  Retornar = "Retornar",
  Entonces = "Entonces",
  Fin = "Fin",
  Verdadero = "Verdadero",
  Falso = "Falso",

  // Operadores
  Asignacion = "Asignacion", // :=
  Suma = "Suma", // +
  Resta = "Resta", // -
  Multiplicacion = "Multiplicacion", // *
  Division = "Division", // /
  Div = "Div", // DIV
  Mod = "Mod", // MOD
  Potencia = "Potencia", // **

  // Operadores relacionales
  Igual = "Igual", // =
  Distinto = "Distinto", // <>
  Menor = "Menor", // <
  Mayor = "Mayor", // >
  MenorIgual = "MenorIgual", // <=
  MayorIgual = "MayorIgual", // >=

  // Operadores lógicos
  Y = "Y",
  O = "O",
  No = "No",

  // Delimitadores
  ParentesisIzquierdo = "ParentesisIzquierdo", // (
  ParentesisDerecho = "ParentesisDerecho", // )
  DosPuntos = "DosPuntos", // :
  Coma = "Coma", // ,
  Rango = "Rango", // ..

  // Literales
  Entero = "Entero",
  Real = "Real",
  Caracter = "Caracter",
  Alfanumerico = "Alfanumerico",

  // Otros
  Identificador = "Identificador",
  Comentario = "Comentario",
  Desconocido = "Desconocido", // Token no reconocido
  EOF = "EOF", // Final del archivo
  PuntoYComa = "PuntoYComa", // ;
  SaltoDeLinea = "SaltoDeLinea", // \n
}