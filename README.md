# CC5002 - Tarea 2: Sistema de Avistamientos de Aves

## Decisiones de implementación

- La portada obtiene los últimos 2 avistamientos según su ID,
  ya que este corresponde al orden de inserción en la base de datos.
- La paginación del listado se implementó utilizando SQLAlchemy,
  mostrando 10 avistamientos por página.
- Las validaciones se realizan tanto en JavaScript como en el
  servidor mediante funciones en `validations.py`.
- Los archivos asociados a los avistamientos se almacenan en
  `static/uploads/` y sus rutas se registran en la tabla `registro`.
- La funcionalidad de estadísticas no fue implementada, ya que el
  enunciado indica que queda pendiente para la siguiente tarea.