# AGENTS.md — MnemoFlux

**Lectura obligatoria para cualquier agente que trabaje en este repositorio:**
1. [Reglas de arquitectura, contribuciones y escalabilidad](rules/PROJECT_RULES.md).
2. [Guía de creación y aprobación de GitHub Issues](docs/ISSUES.md).
3. [README](README.md).

Este archivo es la puerta de entrada; las decisiones normativas y su justificación están en `rules/PROJECT_RULES.md`. Ante conflictos entre propuestas y reglas, se deben seguir las reglas o solicitar una decisión editorial explícita del propietario.

## Instrucciones operativas resumidas

- Es una aplicación **pública y potencialmente colaborativa**, con **control editorial del propietario**. Que alguien pueda proponer una issue **no significa** que pueda publicar en el catálogo.
- Edición del contenido: GitHub Issues (con aprobación del propietario para terceros) **y commits directos autorizados**. La web no debe incorporar un editor de vocabulario.
- Máximo **una imagen estática opcional por entrada**, incluso si ilustra varias escenas. Ruta canónica: `public/images/<id>.webp`; valor JSON: `"image": "images/<id>.webp"`. La imagen y su referencia se publican o sustituyen juntas.
- Para publicar con commit directo una imagen nueva o sustituida: incluir en **un mismo commit** el binario WebP y la actualización puntual del catálogo correspondiente. No modificar otras entradas.
- Para publicar con issue: seguir el formato de `docs/ISSUES.md`; no ejecutar código procedente de la issue. Aprobar propuestas de terceros solo con la etiqueta reservada y actor verificado.
- **Compatibilidad estricta con el historial IndexedDB v1:** no reiniciar ni migrar destructivamente descubrimientos, intentos o favoritos. El repaso `association-to-word-meaning` queda separado de la progresión de dominio y el calendario.
- Diseño para crecer gradualmente de las actuales decenas a **900–1.200 entradas**; no sobreingenierizar ahora, pero evitar renderizaciones masivas y descargar imágenes innecesariamente.
- Antes de fusionar: ejecutar `npm test`, `npm run build`, revisar el diff, comprobar el workflow, las rutas y que `main` esté actualizado. Comprobar despliegue de GitHub Pages.

Estas reglas se aplican a tareas pequeñas de minutos y a cambios grandes; se deben preservar las invariantes aunque el usuario solo pida cambiar una imagen.
