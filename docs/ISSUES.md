# Cómo proponer vocabulario o imágenes mediante GitHub Issues

La propuesta puede consistir **solo en texto, solo en una imagen de una ficha ya existente, o en ambos**. La imagen es opcional. No existe un editor público dentro de MnemoFlux: la puerta de entrada de las contribuciones es GitHub.

## Crear la issue

1. Entra en [Crear issue de MnemoFlux](https://github.com/alexvkcr/MnemoFlux/issues/new) (hace falta iniciar sesión en GitHub).
2. Usa un título que **empiece por `catalog:`**; por ejemplo, `catalog: mejorar la asociación de Gabán`.
3. Pega uno de los bloques JSON siguientes en el cuerpo de la issue, **entre tres acentos graves y la indicación `json`**. Mantén `"schema": 1`.
4. Si deseas proponer una imagen, **adjúntala en el cuerpo de la issue, fuera del bloque JSON**. GitHub genera el enlace al adjunto.
5. Cambia el texto entre `![...]` para que sea exactamente el ID de la palabra. Solo se acepta **una imagen por palabra**.
6. Publica la issue. Si eres colaborador externo, **no se publica en la web hasta que el propietario la apruebe**.

### Ejemplo A: añadir una palabra SIN imagen

```json
{
  "schema": 1,
  "changes": [
    {
      "id": "es-ejemplo",
      "language": "es",
      "operation": "upsert",
      "word": "Ejemplo",
      "meaning": "Texto que explica un concepto.",
      "bridge": "Eje + templo",
      "association": "Un eje gigantesco hace girar un templo entero.",
      "category": "Vocabulario español"
    }
  ]
}
```

La imagen se puede incorporar después. **No es obligatoria** para crear una ficha.

### Ejemplo B: añadir una palabra CON imagen

En el JSON anterior, añade `"image": "set"` dentro del objeto de la entrada, separado por coma. Después, **fuera del bloque JSON**, añade el adjunto:

```markdown
![es-ejemplo](https://github.com/user-attachments/assets/UUID-GENERADO-POR-GITHUB)
```

No escribas una URL ficticia: **pega o arrastra una imagen real** y GitHub generará la dirección. Formatos admitidos: PNG, JPEG y WebP **estáticos**, hasta 10 MB antes de optimizar; la Action la convertirá a WebP.

Si la escena contiene dos o más situaciones, **compónlas dentro de una única imagen** (por ejemplo, un díptico). Nunca más de una imagen por palabra.

### Ejemplo C: corregir SOLO el texto de una palabra existente

```json
{
  "schema": 1,
  "changes": [
    {
      "id": "es-gaban",
      "language": "es",
      "operation": "patch",
      "association": "Una nueva asociación mnemotécnica que no cambia la imagen actual."
    }
  ]
}
```

Los campos omitidos, incluida la imagen, **se conservan**.

### Ejemplo D: incorporar o SUSTITUIR únicamente la imagen

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

Adjunta **una** imagen fuera del JSON y asegúrate de que su Markdown empieza por `![es-gaban]`. La misma operación sirve para añadir la primera imagen y para sustituir una existente, sin dos pasos.

### Ejemplo E: retirar una imagen sin tocar el resto de la ficha

```json
{
  "schema": 1,
  "changes": [
    {
      "id": "es-gaban",
      "language": "es",
      "operation": "patch",
      "image": "remove"
    }
  ]
}
```

No adjuntes archivos en esta solicitud.

### Ejemplo F: eliminar una palabra

```json
{
  "schema": 1,
  "changes": [
    {
      "id": "es-ejemplo",
      "language": "es",
      "operation": "delete"
    }
  ]
}
```

La eliminación también retira la imagen que tenga asociada. Para las actualizaciones de texto se admite `upsert` (creación o actualización completa) o `patch` (solo campos indicados). Para las entradas nuevas, son obligatorios `word`, `meaning`, `bridge` y `association`, además de ID e idioma.

## Quién decide qué se publica

- **Propuesta del propietario:** una issue `catalog:` creada por el propietario se procesa automáticamente y, si supera las validaciones, se cierra y publica.
- **Propuesta de cualquier otra persona:** la issue permanece abierta. El propietario la revisa, puede pedir cambios o rechazarla y, si la acepta, aplica la etiqueta exacta `catalog:approved`.
- **La Action valida que esa etiqueta la haya aplicado realmente el propietario.** El usuario que abrió la issue no puede aprobar su propia propuesta mediante una etiqueta.
- El procesamiento de adjuntos de terceros y la aprobación se someten a las mismas validaciones que las issues del propietario.
- **Preparación inicial:** el propietario debe crear una vez la etiqueta `catalog:approved` en GitHub → Issues → Labels. Después podrá utilizarla desde cada issue.
- Si la issue cambia después de aprobarla, se debe retirar y volver a aplicar la etiqueta tras una nueva revisión; nunca asumir que una edición posterior quedó aprobada.
- El resultado publicado será visible después del despliegue de GitHub Pages. Las contribuciones permanecen auditables en las issues y en el historial de commits.

## Reglas comunes

- Una sola imagen opcional por ID, almacenada públicamente como `public/images/<id>.webp`.
- Varias propuestas en una issue: `changes` acepta entre 1 y 20 entradas, cada una con ID único; los adjuntos se relacionan con sus respectivos IDs.
- No incluir datos privados, imágenes sin derechos para su uso ni código ejecutable.
- Las propuestas no cambian el historial de aprendizaje local del usuario.
- La aprobación editorial del propietario es necesaria incluso si una propuesta pasa todas las validaciones técnicas.

## Vía alternativa: commit autorizado

El propietario también puede publicar imágenes directamente por commit: `public/images/<id>.webp` + el campo `image` de la entrada correspondiente en `public/catalog/<language>.json`, en el **mismo commit**. Esto no sustituye ni deshabilita el sistema de issues. Al publicar un commit en `main`, `deploy.yml` vuelve a desplegar la web.

Para las invariantes y las decisiones de escalabilidad, consulta [las reglas del proyecto](../rules/PROJECT_RULES.md).
