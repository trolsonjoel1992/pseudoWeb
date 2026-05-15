// Base Node interface for all AST nodes
export interface Node {
  type: string
  line?: number
  column?: number
}
