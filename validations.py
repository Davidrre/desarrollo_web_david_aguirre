import re
import filetype
from datetime import datetime, timedelta
from models import Region, Comuna, Voluntario, Ave


def validar_nombre(nombre):
    if not nombre:
        return False
    return len(nombre.strip()) >= 2


def validar_email(email):
    if not email:
        return False
    patron = r"^[\w.+-]+@[a-zA-Z\d-]+\.[a-zA-Z]{2,}$"
    return re.match(patron, email.strip()) is not None


def validar_celular(celular):
    if not celular:
        return False
    patron = r"^(\+?56)?\s?9\s?\d{4}\s?\d{4}$"
    return re.match(patron, celular.strip()) is not None


def validar_region(region_id):
    # region_id llega como string desde el formulario; puede venir vacío
    # o incluso con texto malicioso, así que no asumimos que es un número.
    if not region_id or not region_id.isdigit():
        return False
    return Region.query.get(int(region_id)) is not None


def validar_comuna(comuna_id, region_id):
    if not comuna_id or not comuna_id.isdigit():
        return False
    if not region_id or not region_id.isdigit():
        return False

    comuna = Comuna.query.get(int(comuna_id))
    if comuna is None:
        return False

    # La comuna debe pertenecer efectivamente a la región seleccionada,
    # para evitar que alguien envíe una combinación inconsistente
    # (ej: región "Valparaíso" con comuna "Punta Arenas").
    return comuna.region_id == int(region_id)


def validar_voluntario(voluntario_id):
    if not voluntario_id or not voluntario_id.isdigit():
        return False
    return Voluntario.query.get(int(voluntario_id)) is not None


def obtener_ave_por_nombre(nombre_ave):
    """Busca el ave por nombre exacto. Devuelve el objeto Ave o None.

    No basta con validar que el campo no esté vacío: el nombre escrito
    por el usuario debe corresponder a un ave real del catálogo, ya que
    necesitamos su id para la llave foránea ave_id.
    """
    if not nombre_ave:
        return None
    return Ave.query.filter_by(nombre=nombre_ave.strip()).first()


def validar_lugar(lugar):
    if not lugar:
        return False
    return len(lugar.strip()) >= 3


def validar_fecha_hora(fecha_hora_str):
    """Espera el formato que entrega <input type="datetime-local">:
    'YYYY-MM-DDTHH:MM'. No puede ser futura ni tener más de 1 año."""
    if not fecha_hora_str:
        return False

    try:
        fecha_ingresada = datetime.strptime(fecha_hora_str, "%Y-%m-%dT%H:%M")
    except ValueError:
        # Texto malicioso o con formato inválido.
        return False

    ahora = datetime.now()
    hace_un_anio = ahora - timedelta(days=365)

    return hace_un_anio <= fecha_ingresada <= ahora


def validar_archivos(archivos):
    """archivos: lista de FileStorage (request.files.getlist(...))."""
    if not archivos:
        return False

    archivos_con_contenido = [a for a in archivos if a and a.filename != ""]
    if len(archivos_con_contenido) < 1:
        return False

    for archivo in archivos_con_contenido:
        tipo = filetype.guess(archivo)
        archivo.stream.seek(0)  # volvemos el puntero al inicio para poder guardarlo después

        if tipo is None:
            return False

        familia = tipo.mime.split("/")[0]
        if familia not in ("image", "video"):
            return False

    return True
