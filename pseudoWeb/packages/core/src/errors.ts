export const ErrorCode = {
  // Generic
  GEN_UNKNOWN: "GEN_000",

  // Lexer
  LEX_UNEXPECTED_CHAR: "LEX_001",
  LEX_UNTERMINATED_STRING: "LEX_002",
  LEX_INVALID_NUMBER: "LEX_003",

  // Parser
  PAR_UNEXPECTED_TOKEN: "PAR_001",
  PAR_MISSING_CLOSING: "PAR_002",
  PAR_INVALID_EXPRESSION: "PAR_003",

  // Interpreter / Runtime
  RUN_UNDEFINED_IDENTIFIER: "RUN_001",
  RUN_TYPE_MISMATCH: "RUN_002",
  RUN_DIVISION_BY_ZERO: "RUN_003",
  RUN_STACK_OVERFLOW: "RUN_004",
  RUN_INVALID_ARGUMENT: "RUN_005",
  RUN_RETURN_OUTSIDE_FN: "RUN_006",
  RUN_NO_SEQUENCE_DATA: "RUN_007",
} as const;

export type ErrorCode = typeof ErrorCode[keyof typeof ErrorCode];

export interface StructuredError {
  code: ErrorCode;
  message: string;
  line?: number;
  column?: number;
  module: "lexer" | "parser" | "interpreter";
  context?: Record<string, unknown>;
}

export class PseudocodeError extends Error {
  readonly code: ErrorCode;
  readonly line?: number;
  readonly column?: number;
  readonly module: StructuredError["module"];
  readonly context?: Record<string, unknown>;

  constructor(paramsOrMessage: StructuredError | string, line?: number, column?: number) {
    if (typeof paramsOrMessage === 'string') {
      // Retrocompatibilidad: aceptar (message, line?, column?)
      super(paramsOrMessage);
      this.name = 'PseudocodeError';
      this.code = ErrorCode.GEN_UNKNOWN;
      this.line = line;
      this.column = column;
      this.module = 'interpreter';
      this.context = undefined;
    } else {
      super(paramsOrMessage.message);
      this.name = 'PseudocodeError';
      this.code = paramsOrMessage.code;
      this.line = paramsOrMessage.line;
      this.column = paramsOrMessage.column;
      this.module = paramsOrMessage.module;
      this.context = paramsOrMessage.context;
    }
  }
}

export class LexerError extends PseudocodeError {
  name = 'LexerError';
  readonly module: StructuredError['module'] = 'lexer';
}

export class ParserError extends PseudocodeError {
  name = 'ParserError';
  readonly module: StructuredError['module'] = 'parser';
}

export class InterpreterError extends PseudocodeError {
  name = 'InterpreterError';
  readonly module: StructuredError['module'] = 'interpreter';
}

// Agregamos RuntimeError para usarlo en Environment y Evaluator
export class RuntimeError extends PseudocodeError {
  name = 'RuntimeError';
  readonly module: StructuredError['module'] = 'interpreter';
}
