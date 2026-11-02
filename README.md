# CC5002 - Tarea 3: Sistema de Avistamientos de Aves

## Biblioteca externa

- **Highcharts** (https://www.highcharts.com), cargada desde su CDN
  (`https://code.highcharts.com/highcharts.js`), para dibujar los tres
  gráficos de la página de estadísticas. Se usa bajo su licencia de uso
  educativo (trabajo de curso, sin fines comerciales).

## Base de datos

- Además de las tablas de la Tarea 2, se agregó la tabla `comentario`
  con el script `tabla-comentario.sql` entregado con el enunciado.

## Decisiones de implementación de la Tarea 3

### Estadísticas

- La página `/estadisticas` solo entrega los contenedores de los gráficos.
  Los gráficos se dibujan en el navegador con JavaScript: se usa `fetch`
  para pedir los datos a tres URLs del servidor que responden JSON
  (`/estadisticas/avistamientos-por-dia`,
  `/estadisticas/avistamientos-por-ave` y
  `/estadisticas/voluntarios-por-comuna`).
- Los datos se obtienen con consultas agrupadas (`GROUP BY`) hechas con
  SQLAlchemy.
- "Avistamientos por día" agrupa por la fecha (sin la hora) del campo
  `fecha_hora` del avistamiento, ya que la tabla `avistamiento` no tiene
  otra fecha. Solo aparecen los días con al menos un avistamiento.
- En la torta solo aparecen las aves con al menos un avistamiento, y en
  las barras solo las comunas con al menos un voluntario registrado.
- Si no hay datos o el servidor falla, el espacio del gráfico muestra un
  mensaje.

### Comentarios

- El formulario y la lista de comentarios están en la página de detalle
  del avistamiento. Ambos funcionan con llamadas asíncronas (`fetch`) a la
  misma URL, `/avistamiento/<id>/comentarios`: con GET se obtiene la lista
  y con POST se agrega un comentario.
- Las validaciones se hacen tanto en JavaScript como en el servidor
  (`validations.py`): el nombre debe tener entre 3 y 50 caracteres y el
  texto entre 5 y 300. El máximo de 300 no lo pide el enunciado, pero es
  el largo de la columna `texto` de la base de datos.
- El servidor responde JSON. Si hay errores de validación responde con
  código 400 y los mensajes, y el formulario se mantiene visible con lo
  que escribió el usuario.
- Los comentarios se insertan en la página usando `textContent`, de modo
  que un texto malicioso se muestra como texto y no se ejecuta como HTML.
- La fecha del comentario se registra con la hora del servidor al momento
  de insertarlo.