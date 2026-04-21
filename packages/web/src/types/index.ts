// Tipos globales

export interface ExecutionResult {
  success: boolean
  output: string[]
  variables: Record<string, unknown>
  error?: ExecutionError
  executionTime: number
}

export interface ExecutionError {
  message: string
  line?: number
  type: string
}

export interface PseudocodeScript {
  id: string
  title: string
  code: string
  createdAt: Date
  updatedAt: Date
  ownerId: string
}
