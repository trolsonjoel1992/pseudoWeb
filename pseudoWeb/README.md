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

Recomendado:
- Usar la versión de Node indicada en `.nvmrc`.

### Instalación

```bash
# (Opcional) cargar versión de Node recomendada
nvm use

# Instalar dependencias
pnpm setup

# Desarrollo
pnpm dev

# Build
pnpm build

# Verificación de tipos
pnpm typecheck
```

## Recuperación rápida local

Si eliminaste `node_modules` o cambiaste dependencias:

```bash
pnpm clean:deps
pnpm setup
pnpm dev
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
