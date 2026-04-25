import { useState } from 'react'
import { Environment, Evaluator, Lexer, Parser } from '@pseudoweb/core'
import type { ExecutionResult, ExecutionError } from '../types'

export function useInterpreter() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)

  const execute = async (code: string) => {
    setIsExecuting(true)
    const startedAt = performance.now()

    try {
      const normalizedCode = code.trim()

      if (normalizedCode.length === 0) {
        setResult({
          success: false,
          output: ['No hay codigo para ejecutar'],
          variables: {},
          executionTime: 0,
        })
        return
      }

      const lexer = new Lexer.Lexer(code)
      const tokens = lexer.tokenize()
      const parser = new Parser.Parser(tokens)
      const statements = parser.parse()
      const evaluator = new Evaluator(new Environment())
      const execution = evaluator.evaluate(statements)

      setResult({
        success: true,
        output: execution.output,
        variables: execution.variables,
        executionTime: Math.max(0, performance.now() - startedAt),
      })
    } catch (error) {
      console.error('Error ejecutando código:', error)
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido durante la ejecucion'
      const executionError: ExecutionError = {
        message: errorMessage,
        type: error instanceof Error ? error.name : 'RuntimeError',
      }

      if (error && typeof error === 'object' && 'line' in error && typeof (error as { line?: unknown }).line === 'number') {
        executionError.line = (error as { line: number }).line
      }

      setResult({
        success: false,
        output: [],
        variables: {},
        executionTime: Math.max(0, performance.now() - startedAt),
        error: executionError,
      })
    } finally {
      setIsExecuting(false)
    }
  }

  return {
    execute,
    result,
    isExecuting,
  }
}
