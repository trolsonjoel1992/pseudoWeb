import { Lexer } from '../lexer/index.js'
import { Parser } from '../parser/orchestrator/parser.js'
import type { ActionNode } from '../parser/ast'

export function parseSequenceFile(source: string): ActionNode {
  const tokens = new Lexer(source).tokenize()
  const parser = new Parser(tokens)
  return parser.parse()
}

export default parseSequenceFile
