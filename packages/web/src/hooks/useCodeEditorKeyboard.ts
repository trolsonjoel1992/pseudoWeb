import { useCallback } from 'react'

const INDENT = '  '

function reduceIndent(text: string, start: number, end: number, indent: string) {
  const startLine = text.lastIndexOf('\n', start - 1) + 1
  const endLine = text.indexOf('\n', end)
  const endsWithNewline = endLine === -1
  const lastLineEnd = endsWithNewline ? text.length : endLine

  const before = text.substring(0, startLine)
  const selected = text.substring(startLine, lastLineEnd)
  const after = text.substring(lastLineEnd)

  const lines = selected.split('\n')
  const newLines = lines.map((line) =>
    line.startsWith(indent) ? line.substring(indent.length) : line
  )
  return before + newLines.join('\n') + after
}

export function useCodeEditorKeyboard(
  value: string,
  onChange: (value: string) => void
) {
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = event.currentTarget
      const start = textarea.selectionStart
      const end = textarea.selectionEnd

      if (event.key === 'Tab') {
        event.preventDefault()
        if (event.shiftKey) {
          const newValue = reduceIndent(value, start, end, INDENT)
          if (newValue !== value) {
            const removed = value.length - newValue.length
            onChange(newValue)
            requestAnimationFrame(() => {
              textarea.selectionStart = Math.max(0, start - removed)
              textarea.selectionEnd = Math.max(0, end - removed)
            })
          }
        } else {
          const newValue = value.substring(0, start) + INDENT + value.substring(end)
          onChange(newValue)
          requestAnimationFrame(() => {
            textarea.selectionStart = textarea.selectionEnd = start + INDENT.length
          })
        }
        return
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        const lineStart = value.lastIndexOf('\n', start - 1) + 1
        const currentLine = value.substring(lineStart, start)
        const indent = currentLine.match(/^\s*/)?.[0] ?? ''
        const newValue = value.substring(0, start) + '\n' + indent + value.substring(end)
        onChange(newValue)
        requestAnimationFrame(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1 + indent.length
        })
      }
    },
    [value, onChange]
  )

  return handleKeyDown
}