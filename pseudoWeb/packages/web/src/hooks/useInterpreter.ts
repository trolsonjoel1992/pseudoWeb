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
  type SequenceInfo = { elements: unknown[]; elementType?: string | null }
  const [sequenceOutputs, setSequenceOutputs] = useState<Record<string, SequenceInfo>>({})
  const [sequencesRequest, setSequencesRequest] = useState<null | Array<{ name: string; elementType?: unknown }>>(null)
  const sequencesResolverRef = useRef<((data: { name: string; elements: unknown[] }[]) => void) | null>(null)
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
        {
          onSequencesRequired: async (sequences) => {
            // mostrar UI en la app y esperar a que el usuario cargue archivos
            return await new Promise((resolve) => {
              setSequencesRequest(sequences.map((s) => ({ name: s.name, elementType: (s as any).elementType ?? null })))
              sequencesResolverRef.current = resolve
            })
          },
        },
      )
      const execution = await evaluator.evaluate(statements)

      // Extract sequence variables from environment snapshot
      const seqs: Record<string, SequenceInfo> = {}
      for (const [k, v] of Object.entries(execution.variables)) {
        // detect SequenceValue structure produced by core
        if (v && typeof v === 'object' && (v as any).kind === 'Secuencia' && Array.isArray((v as any).elements)) {
          seqs[k] = { elements: (v as any).elements, elementType: (v as any).elementType ?? null }
        }
      }

      setSequenceOutputs(seqs)

      // limpiar cualquier solicitud pendiente
      setSequencesRequest(null)

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
    sequenceOutputs,
    result,
    isExecuting,
    sequencesRequest,
    submitSequences: (data: { name: string; elements: unknown[] }[]) => {
      if (sequencesResolverRef.current) {
        sequencesResolverRef.current(data)
        sequencesResolverRef.current = null
      }
      setSequencesRequest(null)
    },
  }
}
