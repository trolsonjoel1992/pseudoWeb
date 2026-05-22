import type { Node } from '../parser/types/core'
import type { FunctionCallNode } from '../parser/types/expressions'

export type SequenceInfo = {
  name: string
  line?: number
  column?: number
  kind: 'create' | 'start' | 'write' | 'close'
}

function isFunctionCall(node: Node | any): node is FunctionCallNode {
  return node && node.type === 'FunctionCall' && typeof node.name === 'string'
}

function extractFromFunctionCall(fc: FunctionCallNode): SequenceInfo | null {
  const name = fc.name
  if (!Array.isArray(fc.arguments) || fc.arguments.length === 0) return null
  const firstArg = fc.arguments[0]
  const seqName = (firstArg as any).name
  if (!seqName) return null
  if (name === 'Crear') return { name: seqName, line: fc.line, column: fc.column, kind: 'create' }
  if (name === 'Arrancar') return { name: seqName, line: fc.line, column: fc.column, kind: 'start' }
  if (name === 'Escribir') return { name: seqName, line: fc.line, column: fc.column, kind: 'write' }
  if (name === 'Cerrar') return { name: seqName, line: fc.line, column: fc.column, kind: 'close' }
  return null
}

export function analyzeSequences(node: Node | Node[] | null): SequenceInfo[] {
  const results: SequenceInfo[] = []
  if (!node) return results

  function visit(n: any) {
    if (!n) return
    if (Array.isArray(n)) return n.forEach(visit)
    if (isFunctionCall(n)) {
      const info = extractFromFunctionCall(n)
      if (info) results.push(info)
    }
    // Some parser forms write I/O as Write nodes (values array) — treat as Escribir
    if (n.type === 'Write' && Array.isArray(n.values) && n.values.length > 0) {
      const first = n.values[0]
      const name = first?.name
      if (name) results.push({ name, line: n.line, column: n.column, kind: 'write' })
    }
    // traverse known child properties generically
    for (const key of Object.keys(n)) {
      const val = n[key]
      if (val && typeof val === 'object') visit(val)
    }
  }

  visit(node)
  return results
}

export default analyzeSequences
