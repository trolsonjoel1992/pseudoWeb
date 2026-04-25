# Plan de implementación web (pseudoWeb)

## Objetivo
Construir la interfaz web de pseudoWeb en React con alta fidelidad respecto al prototipo, manteniendo arquitectura limpia y componentes reutilizables.

## Decisiones acordadas
- Estilos con Tailwind CSS.
- Sidebar mobile con drawer colapsable.
- Equilibrio entre fidelidad visual y mantenibilidad.
- No implementar por ahora funcionalidades no soportadas por core.

## Alcance de esta etapa
1. Integrar Tailwind en packages/web.
2. Crear layout principal (TopNav, SideNav, MainContent, Footer).
3. Refactorizar App para orquestar estado de UI y ejecución.
4. Crear componentes reutilizables para consola y variables.
5. Dejar acciones no soportadas como placeholders visibles.
6. Validar typecheck y build.

## Fuera de alcance temporal
- Debugger paso a paso real.
- Inspector avanzado funcional.
- Filtro/búsqueda de variables con lógica completa.
- Integración con autenticación real para avatar.

## Arquitectura propuesta
- src/components
  - TopNavBar
  - SideNavBar
  - MenuItem
  - MetadataHeader
  - StatusBadge
  - CodeEditor
  - ConsolePanel
  - VariablesPanel
  - TypeBadge
  - FooterBar
- src/constants
  - menuConfig
- src/types
  - ui
- src/App.tsx
  - Estado y orquestación

## Integración con core
- Se mantiene hook useInterpreter como punto único de ejecución.
- La UI consume ExecutionResult y ExecutionError.
- En menús sin soporte real del core, se muestra contenido simulado/placeholder en UI.

## Checklist
- [x] Crear planweb.md.
- [ ] Integrar Tailwind en packages/web.
- [ ] Implementar shell de layout responsive.
- [ ] Refactorizar componentes a estructura reutilizable.
- [ ] Agregar placeholders para funciones en desarrollo.
- [ ] Ejecutar validaciones de compilación y tipos.

## Criterios de aceptación
- La web replica visualmente el prototipo de referencia.
- La navegación principal y sidebar funcionan en desktop y mobile.
- La ejecución actual del core sigue operativa.
- El proyecto compila sin errores de TypeScript.
