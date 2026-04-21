import { useState } from 'react'
import type { ExecutionResult } from '../types'

export function useInterpreter() {
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<ExecutionResult | null>(null)

  const execute = async (code: string) => {
    setIsExecuting(true)
    try {
      const normalizedCode = code.trim()
      const output =
        normalizedCode.length > 0
          ? ['Ejecucion simulada completada', `Caracteres recibidos: ${normalizedCode.length}`]
          : ['No hay codigo para ejecutar']

      setResult({
        success: normalizedCode.length > 0,
        output,
        variables: {},
        executionTime: 0,
      })
    } catch (error) {
      console.error('Error ejecutando código:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido durante la ejecucion'

      setResult({
        success: false,
        output: [],
        variables: {},
        executionTime: 0,
        error: {
          message: errorMessage,
          type: 'RuntimeError',
        },
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
