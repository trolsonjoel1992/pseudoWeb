import { useState } from 'react'

type SequenceInfo = { name: string; elementType?: any }
type LoadedSequenceData = { name: string; elements: unknown[] }
type LoaderRowState = { status: 'pending' | 'ok' | 'error'; errors: ParseLineError[]; count: number }

type Props = {
  sequences: SequenceInfo[]
  onAllLoaded: (data: LoadedSequenceData[]) => void
}

type ParseLineError = { line: number; raw: string; expected: string }

function typeName(elementType: any): string {
  if (!elementType) return 'Alfanumerico'
  if (typeof elementType === 'string') return elementType
  if (typeof elementType === 'object' && 'kind' in elementType) return (elementType as any).kind
  return String(elementType)
}

function parseContent(content: string, elementType: string): { success: boolean; elements: unknown[]; errors: ParseLineError[] } {
  const lines = content.split(/\r?\n/)
  const elements: unknown[] = []
  const errors: ParseLineError[] = []
  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i]
    const trimmed = raw.trim()
    if (trimmed.length === 0) continue
    const lineNum = i + 1
    switch (elementType) {
      case 'Entero': {
        if (!/^[-+]?\d+$/.test(trimmed)) {
          errors.push({ line: lineNum, raw, expected: 'Entero' })
        } else {
          elements.push(parseInt(trimmed, 10))
        }
        break
      }
      case 'Real': {
        if (!/^[-+]?\d+(?:\.\d+)?$/.test(trimmed)) {
          errors.push({ line: lineNum, raw, expected: 'Real' })
        } else {
          elements.push(parseFloat(trimmed))
        }
        break
      }
      case 'Logico': {
        if (/^(verdadero|true)$/i.test(trimmed)) elements.push(true)
        else if (/^(falso|false)$/i.test(trimmed)) elements.push(false)
        else errors.push({ line: lineNum, raw, expected: 'Logico' })
        break
      }
      case 'Caracter': {
        if (trimmed.length !== 1) errors.push({ line: lineNum, raw, expected: 'Caracter' })
        else elements.push(trimmed)
        break
      }
      case 'Alfanumerico':
      default: {
        if (trimmed.length === 0) errors.push({ line: lineNum, raw, expected: 'Alfanumerico' })
        else elements.push(trimmed)
      }
    }
  }
  return { success: errors.length === 0, elements: errors.length === 0 ? elements : [], errors }
}

export function SequenceLoaderUI({ sequences, onAllLoaded }: Props) {
  const [states, setStates] = useState<LoaderRowState[]>(() => sequences.map(() => ({ status: 'pending', errors: [], count: 0 })))

  const handleFile = async (index: number, f: File) => {
    const text = await f.text()
    const tname = typeName(sequences[index].elementType)
    const res = parseContent(text, tname)
    setStates((s) => {
      const copy = s.slice()
      copy[index] = { status: res.success ? 'ok' : 'error', errors: res.errors, count: res.elements.length }
      return copy
    })
    ;(sequences as any)[index]._parsed = res
  }

  const allOk = states.length > 0 && states.every((s) => s.status === 'ok')

  const handleConfirm = () => {
    const loaded: LoadedSequenceData[] = sequences.map((seq) => {
      const parsed = (seq as any)._parsed
      return { name: seq.name, elements: parsed?.elements ?? [] }
    })
    onAllLoaded(loaded)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl rounded bg-white p-6 shadow">
        <h3 className="mb-4 text-lg font-semibold">Cargar secuencias requeridas</h3>
        <div className="space-y-4">
          {sequences.map((s, i) => (
            <div key={s.name} className="rounded border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{s.name}</div>
                  <div className="text-sm text-slate-500">Tipo: {typeName(s.elementType)}</div>
                </div>
                <div>
                  <input type="file" accept=".txt" onChange={(e) => e.target.files && handleFile(i, e.target.files[0])} />
                </div>
              </div>
              <div className="mt-2 text-sm">
                {states[i].status === 'pending' && <div className="text-slate-500">Sin archivo</div>}
                {states[i].status === 'ok' && <div className="text-green-600">{states[i].count} elementos cargados ✓</div>}
                {states[i].status === 'error' && (
                  <div className="text-red-600">
                    Error(s):
                    <ul className="ml-4 list-disc">
                      {states[i].errors.map((err) => (
                        <li key={err.line}>Linea {err.line}: '{err.raw.trim()}' — se esperaba {err.expected}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button className="rounded bg-slate-100 px-3 py-1" onClick={() => onAllLoaded([])}>Cancelar</button>
          <button className={`rounded px-3 py-1 text-white ${allOk ? 'bg-blue-600' : 'bg-slate-300'}`} disabled={!allOk} onClick={handleConfirm}>
            Continuar ejecución
          </button>
        </div>
      </div>
    </div>
  )
}

export default SequenceLoaderUI
