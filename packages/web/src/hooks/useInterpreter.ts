import { useRef, useState } from 'react'
import { Environment, Evaluator, Lexer, Parser } from '@pseudoweb/core'
import type { ExecutionResult, ExecutionError } from '../types'

type InputRequestState = {
  variableName: string
}

export function useInterpreter() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)
  const [outputLines, setOutputLines] = useState<string[]>([])
  const [inputRequest, setInputRequest] = useState<InputRequestState | null>(null)
  const inputResolverRef = useRef<((value: unknown) => void) | null>(null)

  const parseInputValue = (rawValue: string): unknown => {
    const trimmedValue = rawValue.trim()

    if (trimmedValue.length === 0) return null
    if (/^[-+]?\d+(?:\.\d+)?$/.test(trimmedValue)) return Number(trimmedValue)
    if (/^(true|false)$/i.test(trimmedValue)) return trimmedValue.toLowerCase() === 'true'
    if ((trimmedValue.startsWith('"') && trimmedValue.endsWith('"')) || (trimmedValue.startsWith("'") && trimmedValue.endsWith("'"))) {
      return trimmedValue.slice(1, -1)
    }

    return trimmedValue
  }

  const requestInput = async (variableName: string) =>
    await new Promise<unknown>((resolve) => {
      inputResolverRef.current = resolve
      setInputRequest({ variableName })
    })

  const submitInput = (rawValue: string): boolean => {
    if (!inputResolverRef.current) return false

    const resolveInput = inputResolverRef.current
    inputResolverRef.current = null
    setInputRequest(null)
    resolveInput(parseInputValue(rawValue))
    return true
  }

  const clearInputRequest = () => {
    inputResolverRef.current = null
    setInputRequest(null)
  }

  const execute = async (code: string) => {
    setIsExecuting(true)
    const startedAt = performance.now()
    setResult(null)
    setOutputLines([])
    clearInputRequest()

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

      const lexer = new Lexer(code)
      const tokens = lexer.tokenize()
      const parser = new Parser(tokens)
      const statements = parser.parse()
      const evaluator = new Evaluator(
        new Environment(),
        requestInput,
        (line) => {
          setOutputLines((currentLines) => [...currentLines, line])
        },
      )
      const execution = await evaluator.evaluate(statements)

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
      clearInputRequest()
      setIsExecuting(false)
    }
  }

  return {
    execute,
    submitInput,
    inputRequest,
    outputLines,
    result,
    isExecuting,
  }
}
