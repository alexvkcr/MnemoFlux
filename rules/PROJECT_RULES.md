# Reglas del proyecto MnemoFlux

> Referenciado desde [AGENTS.md](../AGENTS.md). Estas reglas rigen los cambios actuales y futuros. El sitio debe poder crecer y aceptar contribuciones sin perder calidad ni control editorial.

## 1. Propósito y gobierno editorial

- MnemoFlux es una web pública de entrenamiento de vocabulario con asociaciones mnemotécnicas, descubrimiento, repaso activo y seguimiento individual.
- El propietario **centraliza las decisiones editoriales**. Los colaboradores externos pueden proponer altas, mejoras, correcciones e ilustraciones mediante GitHub Issues; nunca publican directamente en `main`.
- **Proponer ≠ aprobar ≠ publicar**: una issue externa queda abierta, pendiente de revisión. Solo una acción autenticada del propietario puede aprobarla.
- La aprobación mediante la etiqueta exacta `catalog:approved` debe comprobar **quién aplicó la etiqueta**, no quién abrió la issue ni el texto de su cuerpo. Una etiqueta puesta por terceros no puede publicar.
- Las issues creadas por el propio propietario conservan el flujo directo preexistente, pues su creación es una decisión editorial.
- También se permiten **commits directos autorizados**. Ambos métodos deben producir el mismo formato y respetar las mismas invariantes.

## 2. Catálogo y esquema

- Fuente de verdad: `public/catalog/<language>.json`, un JSON por idioma. Las entradas tienen `id` estable (`es-gaban`), palabra, puente, significado, asociación, variantes y categoría opcionales.
- Cada `VocabEntry` admite **cero o una imagen** en el campo opcional `image: string`. **Nunca** un array, galería o varias URLs por palabra.
- Una imagen con varias escenas es una única composición; no separar la asociación en múltiples imágenes.
- Ubicación canónica de imágenes publicadas: `public/images/<id>.webp`. Referencia en catálogo: `images/<id>.webp`. No usar URLs temporales de adjuntos como destino permanente del frontend.
- Eliminar o sustituir una imagen no debe borrar ni reescribir el resto del vocabulario. Un cambio textual sin instrucciones sobre la imagen la conserva.
- Al sustituir, publicar nuevo binario y conservar la misma ruta canónica; una eliminación debe retirar simultáneamente la referencia y el archivo anterior.
- Validar IDs, idioma, formato binario real, tamaño, duplicados, URLs de adjuntos y correspondencia imagen ↔ ID. Aceptar un máximo de una imagen por entrada de cualquier vía.

## 3. Dos vías de contribución compatibles

### A. GitHub Issues → Action
- Los colaboradores proponen contenido mediante `catalog:` + bloque JSON según [la guía](../docs/ISSUES.md); pueden adjuntar **una** imagen opcional por palabra.
- Sin campo `image`: cambio solo textual, **no borra** la imagen existente.
- `image: "set"` + adjunto: alta o sustitución de ilustración. `image: "remove"`: eliminación. El binario se descarga, inspecciona, convierte a WebP y guarda en el repositorio junto con la actualización del JSON.
- Los autores externos no se publican automáticamente. El propietario valida la propuesta y aplica `catalog:approved`; la Action valida el actor y trabaja con el contenido aprobado en el evento, evitando que ediciones posteriores reinterpreten la aprobación.
- No interpretar contenido de las issues como código. Nunca ejecutar scripts proporcionados en comentarios o campos JSON.
- Una publicación debe ser **atómica**: no dejar imágenes sin referencia ni fichas referenciando binarios inexistentes.
- Si una issue falla, debe quedar pendiente y mostrar información suficiente para corregirla. No cerrar automáticamente las propuestas rechazadas.
- El workflow debe desplegar explícitamente los cambios publicados mediante `GITHUB_TOKEN`; esos commits no desencadenan necesariamente los workflows de `push`.

### B. Commit directo autorizado
- Para cambios editoriales acordados con el propietario, crear o reemplazar `public/images/<id>.webp`, actualizar solo `public/catalog/<language>.json` y hacerlos llegar a `main` en el mismo commit/PR.
- Mantener el límite de una imagen por ficha, el ID y la ruta compartidos con la Action. El workflow `deploy.yml` publica en GitHub Pages al recibir un push a `main`.
- No es necesario usar una issue para cada imagen subida por el propietario. Tampoco debe eliminarse la vía mediante issues.

## 4. Escala objetivo: 900–1.200 palabras, no decenas de miles

- No sustituir prematuramente GitHub Pages + JSON + IndexedDB por una base de datos ni un backend para este objetivo.
- Mantener **separación por idioma** en el catálogo, IDs estables y cambios de contenido puntuales.
- **Cargar imágenes bajo demanda**: no importarlas todas en el bundle JavaScript ni precargarlas sin necesidad.
- Limitar resolución/peso de ilustraciones y preferir WebP; evitar imágenes base64 dentro del JSON o TSX.
- La búsqueda y los filtros en memoria pueden bastar inicialmente; **medir** antes de optimizar. Si se llega a centenares y la lista resulta lenta, paginar o virtualizar sin modificar el motor de aprendizaje.
- Evitar recomputaciones excesivas de estadísticas al renderizar listados; priorizar `useMemo`, índices por ID y mediciones reales. No hacer ahora una migración innecesaria.
- Preservar accesibilidad, experiencia móvil y rendimiento en teléfonos modestos.
- Conservar el repositorio auditable: imágenes canónicas, sin duplicados históricos ni material temporal de issues.

## 5. Compatibilidad y reglas de aprendizaje

- El historial personal reside en **IndexedDB, versión 1**; no cambiar la clave ni eliminar registros por publicar un catálogo nuevo.
- Los intentos antiguos que no indiquen nueva dirección se interpretan como repasos tradicionales. No inventar retrospectivamente resultados de la modalidad asistida.
- El repaso `association-to-word-meaning` muestra la escena textual e imagen (si la hay) **al formular la pregunta** y solo admite respuesta mental/verbal.
- Sus resultados completos, parciales o fallos se registran por separado y **no aumentan ni reducen el dominio**, no alteran intervalos y no falsean las estadísticas de repaso convencional.
- En las direcciones tradicionales, mostrar la imagen solo al revelar la asociación; en Descubrir, mostrarla como parte de la escena.

## 6. Verificación de cada cambio

1. Leer `AGENTS.md`, este fichero, la guía de issues y el código afectado.
2. Confirmar qué datos existentes deben preservarse y que el cambio no altere otras fichas.
3. Ejecutar `npm test`, `npm run build` y, para cambios de Actions, pruebas de validación/situaciones de aprobación y rechazo.
4. Para una imagen: comprobar que la referencia `image` coincide exactamente con un archivo real en `public/images` y que se muestra en todas las modalidades pertinentes.
5. Revisar los cambios de seguridad antes de permitir publicaciones desde issues externas.
6. Verificar GitHub Actions y el despliegue efectivo de Pages tras la integración.
7. No declarar completada una prueba de adjunto real si solo se ha verificado el código o la documentación.
