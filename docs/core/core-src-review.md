# Informe de arquitectura de core/src

## Fortalezas

- La division en lexer, parser e interpreter es coherente con el flujo real del lenguaje y hace que cada capa tenga una responsabilidad clara.
- El paquete tiene una entrada publica unica en [packages/core/src/index.ts](../../pseudoWeb/packages/core/src/index.ts#L1), lo que simplifica el consumo desde la web o desde tests.
- El interprete ya separa piezas internas utiles: entorno, callables, builtins, evaluadores y validacion de tipos.
- Las pruebas cubren el flujo completo desde tokenizacion hasta ejecucion, lo que da confianza sobre la integracion entre capas.
- La presencia de [packages/core/src/errors.ts](../../pseudoWeb/packages/core/src/errors.ts#L1) evita duplicar jerarquias de excepciones entre modulos.

## Debilidades o puntos de friccion

- Hay mensajes de error repartidos entre `constants/errorMessages.ts` de lexer, parser e interpreter, lo que obliga a conocer la capa exacta para encontrar un mensaje.
- En algunos puntos, el codigo mezcla mensajes reutilizables con mensajes muy especificos del flujo local, y eso dificulta decidir que deberia vivir en un catalogo comun.
- La arquitectura depende bastante de convenciones internas: si alguien agrega un mensaje nuevo fuera de la carpeta correcta, la coherencia se rompe facilmente.
- Un archivo central unico para todos los mensajes podria crecer demasiado y convertirse en un punto de acoplamiento innecesario.

## Recomendaciones

- Mantener los mensajes altamente especificos dentro de cada modulo, porque expresan reglas propias del lexer, parser o interpreter.
- Centralizar solo los mensajes realmente transversales, como errores de dominio reutilizados por varias capas o mensajes base de runtime.
- Conservar [packages/core/src/errors.ts](../../pseudoWeb/packages/core/src/errors.ts#L1) como el lugar para las clases de error comunes, y no mezclar ahi los textos de negocio.
- Si aparecen mensajes duplicados entre modulos, extraerlos a un archivo compartido pequeno, no a un mega catalogo global.
- Documentar una regla simple: constantes del lenguaje y reglas locales permanecen en el modulo; errores reutilizables y transversales van a un archivo comun.

## Conclusion sobre centralizar mensajes de error

No recomiendo mover todos los mensajes de error a un unico archivo centralizado. En este proyecto, la mejor opcion es una centralizacion parcial: clases de error comunes en `errors.ts` y mensajes especificos en cada modulo.

La razon es que lexer, parser e interpreter tienen contextos distintos. Un catalogo unico reduciria la cohesion, aumentaria el acoplamiento y volveria mas rigida la evolucion del sistema. En cambio, mantener los mensajes cerca de la logica que los dispara preserva claridad semantica, facilita mantenimiento y evita que una capa conozca detalles innecesarios de las otras.

Solo vale la pena extraer a un modulo comun los errores que realmente se repiten entre capas o que describen una misma regla de dominio compartida.