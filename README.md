# MnemoFlux

Entrenador de vocabulario con asociaciones inverosímiles, repasos activos y seguimiento individualizado. Inspirado en las técnicas mnemotécnicas de Ramón Campayo, sin vinculación oficial.

**Aplicación:** https://alexvkcr.github.io/MnemoFlux/

## Funcionalidades

- **Descubrir:** estudia nuevas palabras visualizando la definición, la palabra puente y la asociación. No cuenta como acierto de memoria.
- **Repasar:** definición → palabra, palabra → definición y asociación → palabra/definición. La última dirección muestra la asociación (e imagen, si existe) desde el principio y utiliza respuesta exclusivamente mental/verbal, calificada como completa, parcial o fallo. Sus intentos quedan registrados, pero no afectan al dominio ni al vencimiento de los repasos tradicionales.
- **Segundas oportunidades:** los fallos reaparecen al final de la sesión sin borrar el intento fallido ni inflar la progresión.
- **Estados:** Nueva, Aprendiendo, Consolidando y Dominada. Umbrales configurables en `src/config/learning.ts`.
- **Órdenes:** aleatorio, alfabético, prioridad de falladas, solo pendientes y combinación de falladas y pendientes.
- **Direcciones:** definición → palabra (predeterminada), palabra → definición y asociación → palabra/definición (solo mental/verbal; no afecta al dominio).
- **Respuestas:** autocalificación mental/verbal o escritura de la palabra; se reconocen variantes explícitas y locuciones con espacios repetidos, manteniendo las tildes.
- **Personalización:** sesiones de 10, 20, 30, 40 o todas; favoritos, búsqueda, estadísticas, filtros y selección multidioma.
- **Imágenes:** una ilustración opcional por palabra. Visible en Descubrir, al revelar la asociación en los repasos tradicionales y desde el inicio en el repaso basado en asociación.
- **Diseño:** tema oscuro adaptable a móvil y escritorio.
- **Datos privados:** historial, descubrimientos y favoritas en IndexedDB de cada navegador. Copias de seguridad JSON importables/exportables.

## Catálogo compartido

Las palabras y asociaciones están publicadas como JSON en `public/catalog/es.json`. El catálogo español se amplía mediante issues y se comparte entre dispositivos. Se pueden añadir archivos como `public/catalog/en.json` y `public/catalog/de.json` para activar otros idiomas sin cambiar el motor.

### Contribuir mediante Issues o commits autorizados

No hay formularios de edición de vocabulario dentro de la aplicación. **Cualquier persona puede proponer** palabras, asociaciones e imágenes mediante [GitHub Issues](https://github.com/alexvkcr/MnemoFlux/issues/new); el propietario es quien decide qué se publica. También pueden utilizarse commits directos autorizados. Para los ejemplos y las aprobaciones consulta [la guía de Issues](docs/ISSUES.md) y las [reglas de arquitectura](rules/PROJECT_RULES.md).

La acción `.github/workflows/catalog-issue.yml` solo procesa issues creadas por el propietario cuyo título comience por `catalog:`. La issue debe incluir un bloque JSON con `schema: 1` y entre 1 y 20 cambios. `operation` puede ser `upsert` (alta o actualización), `patch` (cambio parcial de una entrada existente) o `delete` (eliminar entrada). Una actualización parcial no borra los campos omitidos.

**Ejemplo de edición parcial y asignación de una imagen:**

```json
{
  "schema": 1,
  "changes": [
    {
      "id": "es-gaban",
      "language": "es",
      "operation": "patch",
      "image": "set"
    }
  ]
}
```

Antes de publicar la issue, arrastra o pega una imagen en el cuerpo **fuera del bloque JSON** y ajusta el texto alternativo de Markdown para que coincida exactamente con el identificador. Ejemplo:

```markdown
![es-gaban](https://github.com/user-attachments/assets/UUID-DE-LA-IMAGEN)
```

**Una única imagen opcional por palabra.** Solo se admiten adjuntos estáticos PNG, JPEG o WebP de hasta 10 MB, transformados a WebP de máximo 1600 píxeles en cualquiera de sus dimensiones. Una issue con múltiples adjuntos para la misma entrada se rechaza.

Para eliminar la imagen sin modificar el texto, usa `"operation":"patch","image":"remove"` (sin adjuntar archivo). Para sustituirla, usa `"image":"set"` con otro adjunto; reemplaza a la anterior en una sola publicación. Si no se especifica `image`, conserva la actual. Un `delete` elimina la entrada y su imagen.

La automatización valida el lote y publica los cambios en un **solo commit**; también admite la ruta alternativa de commit directo autorizado. Los archivos se guardan como `public/images/<id>.webp`. No hacen falta tokens ni contraseñas en la aplicación.

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

Cada push a `main` ejecuta las pruebas, compila y despliega a GitHub Pages mediante `.github/workflows/deploy.yml`. Las publicaciones desde issues conservan su despliegue explícito.

**Agentes y escalabilidad:** consulta [AGENTS.md](AGENTS.md) y [rules/PROJECT_RULES.md](rules/PROJECT_RULES.md) para las invariantes, las dos vías de publicación y el crecimiento previsto a 900–1.200 entradas.

## Privacidad y limitaciones

El catálogo es público y se comparte entre dispositivos tras cada despliegue. **El historial de aprendizaje no se sincroniza automáticamente entre navegadores**; hay que exportar e importar la copia JSON manualmente. Al cerrar una sesión no se guarda una posición de reanudación, pero sí se conservan los intentos ya realizados.
