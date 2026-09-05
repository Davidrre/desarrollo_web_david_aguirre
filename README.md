# CC5002 - Tarea 1: Sistema de Avistamientos de Aves

Prototipo de interfaces para que voluntarios de la Unión de Ornitólogos de Chile 
se registren e informen avistamientos de aves.

## Estructura

```
index.html            - Página de inicio / navegación
registro.html          - Registro de voluntario(a)
avistamiento.html       - Formulario para informar un avistamiento
listado.html            - Listado de avistamientos (filtro, orden, paginación)
estadisticas.html        - Indicadores y gráficos
css/style.css            - Estilos generales del sitio
js/regiones-comunas.js    - Datos de región/comuna (para registro.html)
js/registro.js             - Validación del formulario de registro
js/avistamiento.js          - Validación del formulario de avistamiento
js/avistamientos-data.js     - Datos de ejemplo de avistamientos
js/voluntarios-data.js        - Datos de ejemplo de voluntarios
js/listado.js                  - Filtro, orden y paginación del listado
js/estadisticas.js               - Cálculo de indicadores y gráfico de barras
```

## Decisiones de diseño

### No hay persistencia de datos

- Al completar y enviar `registro.html` o `avistamiento.html`, solo se muestra un
  mensaje de éxito en pantalla. El dato ingresado **no se guarda** en ningún lado.
- Como consecuencia, `avistamiento.html`, `listado.html` y `estadisticas.html`
  necesitan datos de ejemplo para poder demostrar su funcionamiento. Estos datos
  están en `js/avistamientos-data.js` y `js/voluntarios-data.js`, simulando información
  que en un sistema real ya existiría almacenada de voluntarios y avistamientos
  previos.

### Validaciones en JavaScript (no solo `required`)

Todos los formularios usan el atributo `novalidate` para desactivar la validación
nativa del navegador, ya que el enunciado exige que el `required` de HTML no
cuente como validación por sí solo. Toda regla de validación está implementada
explícitamente en JavaScript, mostrando/ocultando mensajes de error con la clase
CSS `.visible`.

Reglas definidas por decisión propia:

- **Celular:** debe cumplir el formato chileno `+56 9 XXXX XXXX`, validado con 
  expresión regular.
- **Email:** formato válido verificado con expresión regular (no solo
  `includes("@")`).
- **Fecha de nacimiento (registro, opcional):** si se completa, no puede ser una
  fecha futura.
- **Fecha del avistamiento (obligatoria):** no puede ser futura, y se definió que
  no puede tener más de **1 año de antigüedad**. Se eligió este límite porque un
  avistamiento muy antiguo pierde valor para detectar cambios recientes en la
  población de aves, que es la preocupación central planteada en el enunciado.
- **Foto o vídeo:** se exige al menos 1 archivo adjunto, y se valida que cada
  archivo sea de tipo `image/*` o `video/*`.

