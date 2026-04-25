export class PseudocodeError extends Error {
  constructor(
    message: string,
    public line?: number,
    public column?: number,
  ) {
    super(message);
    this.name = 'PseudocodeError';
  }
}

export class LexerError extends PseudocodeError {
  name = 'LexerError';
}

export class ParserError extends PseudocodeError {
  name = 'ParserError';
}

export class InterpreterError extends PseudocodeError {
  name = 'InterpreterError';
}

// Agregamos RuntimeError para usarlo en Environment y Evaluator
export class RuntimeError extends PseudocodeError {
  name = 'RuntimeError';
}
