import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: 'var(--color-primary)',
        surface: 'var(--color-surface)',
        accent: 'var(--color-accent)',
        muted: 'var(--color-muted)',
        bg: 'var(--color-bg)',
      },
      fontFamily: {
        body: ['Manrope', 'ui-sans-serif', 'system-ui'],
        code: ['JetBrains Mono', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
