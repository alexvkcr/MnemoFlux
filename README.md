# MnemoFlux

Entrenador de vocabulario con asociaciones inverosímiles, repasos activos y seguimiento individualizado. Inspirado en las técnicas mnemotécnicas de Ramón Campayo, sin vinculación oficial.

**Aplicación:** https://alexvkcr.github.io/MnemoFlux/

## Funcionalidades

- **Descubrir:** estudia nuevas palabras visualizando la definición, la palabra puente y la asociación. No cuenta como acierto de memoria.
- **Repasar:** responde sin mirar y califica tu recuerdo como inmediato, mediante asociación, con pista o fallo.
- **Segundas oportunidades:** los fallos reaparecen al final de la sesión sin borrar el intento fallido ni inflar la progresión.
- **Estados:** Nueva, Aprendiendo, Consolidando y Dominada. Umbrales configurables en `src/config/learning.ts`.
- **Órdenes:** aleatorio, alfabético, prioridad de falladas, solo pendientes y combinación de falladas y pendientes.
- **Direcciones:** definición → palabra (predeterminada), o palabra → definición.
- **Respuestas:** autocalificación mental/verbal o escritura de la palabra; se reconocen variantes explícitas y locuciones con espacios repetidos, manteniendo las tildes.
- **Personalización:** sesiones de 10, 20, 30, 40 o todas; favoritos, búsqueda, estadísticas, filtros y selección multidioma.
- **Diseño:** tema oscuro adaptable a móvil y escritorio.
- **Datos privados:** historial, descubrimientos y favoritas en IndexedDB de cada navegador. Copias de seguridad JSON importables/exportables.

## Catálogo compartido

Las palabras y asociaciones están publicadas como JSON en `public/catalog/es.json`. El catálogo español inicial contiene 39 tarjetas. Se pueden añadir archivos como `public/catalog/en.json` y `public/catalog/de.json` para activar otros idiomas sin cambiar el motor.

### Editar el vocabulario

1. Ve a **Vocabulario → Añadir palabra** o utiliza el icono de edición de una tarjeta.
2. Completa la palabra o locución, significado, palabra puente, asociación y variantes admitidas.
3. Guarda el cambio en el lote local.
4. Pulsa **Enviar a GitHub** para abrir una Issue con hasta 3 cambios precargados. Debes confirmar su creación en GitHub con la sesión de **alexvkcr**.
5. La acción `.github/workflows/catalog-issue.yml` solo procesa Issues creadas por el propietario, valida los datos, actualiza el JSON, cierra la Issue y vuelve a desplegar la web.

También puedes trabajar el vocabulario en un editor o con ChatGPT y publicar cambios directamente mediante commits. **No se guardan tokens ni contraseñas en el navegador.**

## Reglas de repaso

Los parámetros se centralizan en `src/config/learning.ts`. Los criterios iniciales son 2 repasos correctos en días diferentes para Consolidando y al menos 4 repasos correctos durante 7 días, terminados con dos recuerdos inmediatos, para Dominada. Estos intervalos son una propuesta de la aplicación, no reglas literales atribuidas a Campayo.

## Desarrollo

```bash
npm install
npm test
npm run dev
npm run build
```

Tecnologías: React 19, TypeScript, Vite, Lucide y IndexedDB.

Cada push a `main` ejecuta las pruebas, compila y despliega a GitHub Pages mediante `.github/workflows/deploy.yml`.

## Privacidad y limitaciones

El catálogo es público y se comparte entre dispositivos tras cada despliegue. **El historial de aprendizaje no se sincroniza automáticamente entre navegadores**; hay que exportar e importar la copia JSON manualmente. Al cerrar una sesión no se guarda una posición de reanudación, pero sí se conservan los intentos ya realizados.
