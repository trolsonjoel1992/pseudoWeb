// Exportaciones principales del core

export { Lexer } from './lexer/index.js'
export type { Token } from './lexer/types/index.js'
export { TokenType, KEYWORDS, resolveIdentifierType, LexerError } from './lexer/types/index.js'
export * from './parser/ast.js'
export * from './parser/index.js'
export * from './interpreter/orchestrator/index.js'
export * from './interpreter/environment/index.js'
export { PseudocodeError, ParserError, InterpreterError, RuntimeError } from './errors.js'
export { ErrorCode } from './errors.js'
export type { StructuredError } from './errors.js'
export { ErrorMessages, buildMessage } from './constants/errorMessages.js'
