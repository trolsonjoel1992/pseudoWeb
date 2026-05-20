# Plan: Implementar Secuencias de Datos Elementales

## TL;DR
Extender el sistema de tipos del intérprete de pseudocódigo para soportar **secuencias tipadas** (`Secuencia<Entero>`, `Secuencia<Caracter>`, etc.) con operaciones de lectura/escritura secuencial. Incluir 6 operaciones clave (Arrancar, Crear, Avanzar, Escribir, FDS, Cerrar) como built-ins, y sobrecargar `Escribir()` para detectar si el primer parámetro es una secuencia o salida estándar.

## Decisiones Clave
- **Tipo parametrizado**: Secuencias tipadas `Secuencia<Tipo>` (no genérico simple)
- **Sintaxis de declaración**: `[nombre]: Secuencia de [tipo]` (ej: `datos: Secuencia de Entero`)
- **Escribir() sobrecargado**: Misma función con distinto comportamiento según primer argumento
- **Archivos**: Dejar diseño inicial flexible (stdin/parámetro); primera versión genera en memoria
- **Todas las operaciones son built-ins**: Registradas en `BuiltinRegistry`

## Decisiones Pendientes
1. **Carga de archivos**: ¿Arrancar() lee de stdin, de un archivo en `data/` o recibe ruta como parámetro? → *Recomendación: stdin para MVP, luego extensible a archivos*
2. **Posición interna**: ¿Cada secuencia mantiene su posición actual o es parámetro? → *Recomendación: posición en la secuencia (state interno)*
3. **Errores en secuencias**: ¿Lanzar error o retornar boolean al leer fuera de límites? → *Recomendación: error tipado específico*

## Steps

### Fase 1: Extensión del Sistema de Tipos (Blockers para todo lo demás)

1. **Extender parser/types/data.ts**:
   - Agregar nuevo tipo compuesto: `{ kind: 'Secuencia'; elementType: DataType }`
   - Actualizar `DataType` union para incluir `Secuencia`
   - Ej: `{ kind: 'Secuencia', elementType: 'Entero' }`

2. **Crear tipo runtime para Secuencia**:
   - Nuevo archivo: `interpreter/types/SequenceValue.ts`
   - Interfaz:
     ```typescript
     interface SequenceValue {
       kind: 'Secuencia'
       elementType: DataType
       elements: unknown[]
       position: number        // Posición de lectura actual (0-based)
       mode: 'idle' | 'read' | 'write'  // Estados: sin iniciar, lectura, escritura
     }
     ```
   - Helper: `isSequence(value): boolean` y `asSequence(value): SequenceValue`
   - **Nota**: `mode` solo puede transicionar `idle` → `read` (Arrancar) o `idle` → `write` (Crear). Transiciones inválidas lanzan error.

3. **Actualizar TypeValidator**:
   - Agregar método `assertSequenceType(value, expectedType)` - valida que el elemento sea del tipo correcto
   - Actualizar `canAssign()` para soportar `Secuencia<T>`
   - Actualizar `resolveValueType()` para retornar tipo de secuencia

4. **Actualizar el parser para reconocer sintaxis**:
   - En `parser/types/`, agregar parseador de declaración: `[nombre]: Secuencia de [tipo]`
   - Ejemplo: `datos: Secuencia de Entero` → AST con tipo `{ kind: 'Secuencia', elementType: 'Entero' }`

### Fase 2: Implementar Built-in Functions (Paralela con Fase 1)

5. **Crear archivo builtins/sequences.ts**:
   - Registrar 6 funciones:
     - `Arrancar(secuencia)` → valida `mode === 'idle'`, set `mode = 'read'`, `position = 0`. Error si ya fue iniciada.
     - `Crear(secuencia)` → valida `mode === 'idle'`, set `mode = 'write'`, `elements = []`. Error si ya fue iniciada.
     - `Avanzar(secuencia, ventana)` → valida `mode === 'read'` y ventana existe en ambiente con tipo compatible. Lee `elements[position]`, asigna a ventana, `position++`. Error si ventana no existe o tipo mismatch. Error si alcanza fin (position >= length).
     - `Escribir(secuencia, valor)` → valida `mode === 'write'` y tipo compatible. Agrega valor a elements[], `position++`.
     - `FinDeSecuencia(secuencia)` o `FDS(secuencia)` → retorna boolean (position >= length). Error si no está en modo read.
     - `Cerrar(secuencia)` → set `mode = 'idle'`, bloquea todas las operaciones posteriores.
   - **Transiciones inválidas**: 
     - Arrancar() en modo 'read' o 'write' → error `SequenceAlreadyInitialized`
     - Crear() en modo 'read' o 'write' → error `SequenceAlreadyInitialized`
     - Avanzar() / FDS() en modo 'idle' → error `SequenceNotInitialized`
     - Escribir() en modo 'idle' o 'read' → error `SequenceInvalidMode`

6. **Sobrecargar Escribir en builtins/io.ts** (ya existe):
   - Detectar si primer argumento es `SequenceValue`
   - Si sí: delegar a `sequences.Escribir()`
   - Si no: comportamiento actual (salida a consola)

7. **Registrar built-ins en builtins/index.ts**:
   - Instanciar y registrar todas las funciones en `BuiltinRegistry`

### Fase 3: Integración con Evaluadores (Depende de Fase 1 + 2)

8. **Actualizar expression evaluator**:
   - Soportar creación inline: `Crear(nuevaSecuencia)`
   - Soportar lectura de secuencias como expresiones

9. **Actualizar assignment evaluator**:
   - Validar asignaciones a variables de tipo `Secuencia<T>`
   - Prevenir asignación una vez la secuencia está closed

10. **Manejar errores específicos**:
    - Arrancar()/Crear() en secuencia ya iniciada → `SequenceAlreadyInitialized`
    - Avanzar()/FDS() en secuencia idle → `SequenceNotInitialized`
    - Escribir() en secuencia idle/read → `SequenceInvalidMode`
    - Avanzar(sec, ventana) donde ventana no existe → `VariableNotFound`
    - Avanzar(sec, ventana) con tipo mismatch → `SequenceTypeMismatchError`
    - Avanzar(sec, ventana) cuando position >= length → `SequenceEndReached`
    - Tipo de elemento incorrecto en Escribir() → `SequenceTypeMismatchError`
    - Operación en secuencia cerrada → `SequenceClosedError`

### Fase 4: Tests y Documentación

11. **Tests unitarios en __tests__/sequence.test.ts**:
    - Test declaración: `[datos]: Secuencia de Entero` parsea correctamente
    - Test Crear() + Escribir(): genera secuencia con 3 valores
    - Test Arrancar() + NFDS() + Avanzar(sec, ventana): itera correctamente, ventana recibe valores
    - Test Cerrar(): bloquea operaciones posteriores
    - Test tipos: error si escribo string en `Secuencia<Entero>`
    - Test Arrancar() en idle → ok; Arrancar() en read → error `SequenceAlreadyInitialized`
    - Test Crear() en idle → ok; Crear() en write → error `SequenceAlreadyInitialized`
    - Test Avanzar(sec, ventana) donde ventana no existe en ambiente → error
    - Test Avanzar(sec, ventana) con tipo mismatch → error
    - Test Avanzar(sec, ventana) cuando position >= length → error `SequenceEndReached`
    - Test FDS() / NFDS() en modo idle → error `SequenceNotInitialized`

12. **Documentación en docs/core/sequences.md**:
    - Sintaxis de declaración y uso
    - Ejemplos: leer archivo, generar datos
    - Restricciones y limitaciones
    - Integración con flujos de control (for, while simulados con NFDS)

13. **Ejemplo en docs/examples/**: Programa que crea secuencia, escribe datos, itera con NFDS

## Relevant files
- [packages/core/src/parser/types/data.ts](packages/core/src/parser/types/data.ts) — Extender `DataType` union
- [packages/core/src/interpreter/types/TypeValidator.ts](packages/core/src/interpreter/types/TypeValidator.ts) — Agregar validación para secuencias
- [packages/core/src/interpreter/types/](packages/core/src/interpreter/types/) — Crear `SequenceValue.ts` con interfaz y helpers
- [packages/core/src/interpreter/builtins/](packages/core/src/interpreter/builtins/) — Crear `sequences.ts`, actualizar `io.ts` y `index.ts`
- [packages/core/src/parser/](packages/core/src/parser/) — Actualizar parseador para sintaxis `Secuencia de [tipo]`
- [packages/core/src/interpreter/evaluators/](packages/core/src/interpreter/evaluators/) — Actualizar assignment y expression evaluators
- [packages/core/__tests__/sequence.test.ts](packages/core/__tests__/sequence.test.ts) — Nuevo archivo de tests

## Verification
1. **Unitario**: `npm test -- sequence.test.ts` pasa todos los tests
2. **Integración**: Ejecutar programa pseudocódigo que declara, crea, escribe y lee secuencia; verificar salida
3. **Errores**: Intentar escribir tipo incorrecto, leer de cerrada, acceder fuera de límites → errores apropiados
4. **Sintaxis**: Parser valida correctamente `[nombre]: Secuencia de Tipo`
5. **CLI**: `pseudow run ejemplo.pseudo` con ejemplo de secuencias funciona end-to-end

## Decisiones Clave (Actualizadas)
- ✅ **Tipo parametrizado**: `Secuencia<Tipo>` (no genérico simple)
- ✅ **Sintaxis**: `[nombre]: Secuencia de Entero`
- ✅ **Escribir() sobrecargado**: Mismo built-in, distinto comportamiento según primer parámetro
- ✅ **Todas son built-ins**: Arrancar, Crear, Avanzar, Escribir, FDS, Cerrar
- ✅ **Mode**: 3 estados `'idle' | 'read' | 'write'` (no booleano)
- ✅ **Avanzar(sec, ventana)**: Solo avanza 1 posición, lee `elements[position]`, asigna a ventana (debe existir en ambiente con tipo compatible)
- ✅ **Transiciones inválidas**: Arrancar()/Crear() en secuencia ya iniciada → error; Avanzar()/FDS() en idle → error
- ✅ **Fin de secuencia**: Avanzar() cuando `position >= length` → error `SequenceEndReached`

## Further Considerations
1. **¿Cómo carga datos Arrancar()?** → MVP genera en memoria. Para archivos, Arrancar() tendría que leer de stdin o aceptar ruta. *Pendiente tu decisión.*
2. **¿Multi-dimensional?** (ej: `Secuencia de Secuencia de Entero`) → Fuera de scope para MVP. 
3. **¿Performance?** → Arrays en JS son eficientes; Ring Buffer/Stream solo si optimización requerida.
