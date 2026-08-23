# pseudoWeb

Motor e interfaz web para ejecutar pseudocódigo en tiempo real.

Este repositorio contiene el núcleo del lenguaje (lexer, parser, intérprete) y una aplicación web que proporciona un editor, consola y visualización de estado en tiempo de ejecución.

Estado actual
- Rama activa: `clean-docs-only` (trabajo en documentación y mejoras)
- Implementaciones destacadas: soporte para `Secuencia<T>` (primitivas: `Crear`, `Arrancar`, `Avanzar`, `Escribir`, `FinDeSecuencia`/`FDS`, `NoFinDeSecuencia`/`NFDS`, `Cerrar`).
- Tests del paquete `core`: 50 tests — todos pasan.

Estructura del repositorio

```
pseudoWeb/
├── packages/
│   ├── core/      # Motor del lenguaje (Lexer, Parser, Interpreter, tests)
│   └── web/       # Aplicación React (editor, UI)
├── docs/          # Documentación y ejemplos (ej. docs/core/sequences.md)
└── README.md      # Este archivo
```

Requisitos
- Node.js v18+ (use la versión indicada en `.nvmrc` si aplica)
- pnpm

Instalación y desarrollo

```bash
# Instalar dependencias en el workspace
pnpm install

# Ejecutar la app web en desarrollo (filtrar por paquete web)
pnpm --filter @pseudoweb/web dev

# Ejecutar solo los tests del motor (core)
pnpm --filter @pseudoweb/core test

# Compilar todo
pnpm -r build
```

Comandos útiles
- `pnpm --filter @pseudoweb/core test` — ejecutar pruebas unitarias del motor.
- `pnpm --filter @pseudoweb/web dev` — iniciar la aplicación web en modo desarrollo.
- `pnpm -r build` — compilar todos los paquetes.

Documentación y ejemplos
- Guía de secuencias: [docs/core/sequences.md](docs/core/sequences.md)
- Ejemplo funcional: [docs/examples/secuencias_ejemplo.pseudo](docs/examples/secuencias_ejemplo.pseudo)

Contribución
- Abra un issue describiendo el cambio propuesto antes de implementar cambios importantes.
- Cree ramas temáticas por característica o corrección y abra un Pull Request hacia `main`.
- Mantenga las pruebas verdes y añada pruebas unitarias para nuevas funcionalidades.

Contacto
- Autor: trolsonjoel1992

Licencia
- MIT
