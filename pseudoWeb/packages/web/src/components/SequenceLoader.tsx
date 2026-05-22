import React from 'react'
import type { SequenceInfo } from '@pseudoweb/core'
import { parseSequenceFile, analyzeSequences } from '@pseudoweb/core'

type Props = {
  onLoad: (sequences: SequenceInfo[]) => void
}

export function SequenceLoader({ onLoad }: Props) {
  const handleFile = async (f: File) => {
    const text = await f.text()
    try {
      const action = parseSequenceFile(text)
      const sequences = analyzeSequences(action)
      onLoad(sequences)
    } catch (e) {
      console.error('Error parsing sequence file', e)
      onLoad([])
    }
  }

  return (
    <div>
      <label>
        Cargar secuencia
        <input type="file" accept=".pseudo,.txt" onChange={e => e.target.files && handleFile(e.target.files[0])} />
      </label>
    </div>
  )
}

export default SequenceLoader
