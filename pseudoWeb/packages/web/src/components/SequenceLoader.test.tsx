import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import SequenceLoader from './SequenceLoader'

describe('SequenceLoader componente', () => {
  it('carga archivo y llama onLoad con secuencias detectadas', async () => {
    const onLoad = vi.fn()
    render(<SequenceLoader onLoad={onLoad} />)

    const file = new File([
      `Accion prueba : ES\nAmbiente\nProceso\n  Escribir(datos, 1)\nFinAccion`,
    ], 'seq.pseudo', { type: 'text/plain' })

    const input = screen.getByLabelText(/Cargar secuencia/i)
    // fire change event with files
    Object.defineProperty(input, 'files', { value: [file] })
    fireEvent.change(input)

    await waitFor(() => {
      expect(onLoad).toHaveBeenCalled()
      const arg = onLoad.mock.calls[0][0]
      expect(Array.isArray(arg)).toBe(true)
      expect(arg.some((s: any) => s.kind === 'write' && s.name === 'datos')).toBe(true)
    })
  })
})
