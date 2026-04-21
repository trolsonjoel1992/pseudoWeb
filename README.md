# pseudoWeb

Aplicación web para ejecutar pseudocódigo en tiempo real. Construida con React, TypeScript y Firebase.

## 📁 Estructura

```
pseudoWeb/
├── packages/
│   ├── core/      # Motor del lenguaje (Lexer, Parser, Interpreter)
│   └── web/       # Aplicación React
├── firebase.json  # Configuración Firebase
└── README.md      # Este archivo
```

## 🚀 Inicio Rápido

### Requisitos
- Node.js v18+
- pnpm

### Instalación

```bash
# Instalar dependencias
pnpm install

# Desarrollo
pnpm dev

# Build
pnpm build
```

## 📦 Packages

### `packages/core`
Motor del lenguaje pseudocódigo:
- **Lexer**: Tokenización
- **Parser**: Análisis sintáctico
- **Interpreter**: Ejecución

### `packages/web`
Aplicación React:
- Editor de código
- Consola de salida
- Visualizador de variables
- Integración con Firebase

## 🔧 Herramientas

- React 18
- TypeScript
- Vite
- Firebase
- pnpm workspaces

## 📝 Licencia

MIT
