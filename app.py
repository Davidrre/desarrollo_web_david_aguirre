import os
import uuid
import filetype
from datetime import datetime
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, redirect, url_for, jsonify
from database.extensions import db
from database.models import Region, Comuna, Voluntario, Ave, Avistamiento, Registro, Comentario
from utils.validations import (
    validar_nombre,
    validar_email,
    validar_celular,
    validar_region,
    validar_comuna,
    validar_voluntario,
    obtener_ave_por_nombre,
    validar_lugar,
    validar_fecha_hora,
    validar_archivos,
    validar_nombre_comentario,
    validar_texto_comentario,
)

app = Flask(__name__)

UPLOAD_FOLDER = os.path.join("static", "uploads")
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# --- Configuración de conexión a la base de datos ---
# Formato: mysql+pymysql://usuario:password@host:puerto/nombre_bd
DB_USER = "cc5002"
DB_PASSWORD = "programacionweb"
DB_HOST = "localhost"
DB_PORT = 3306
DB_NAME = "tarea2"

app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# Conecta esta app de Flask con la instancia de SQLAlchemy.
db.init_app(app)


@app.route("/", methods=["GET"])
def index():
    ultimos_avistamientos = (
        Avistamiento.query
        .order_by(Avistamiento.id.desc())
        .limit(2)
        .all()
    )

    return render_template(
        "index.html",
        ultimos_avistamientos=ultimos_avistamientos
    )


@app.route("/avistamiento", methods=["GET", "POST"])
def registrar_avistamiento():
    voluntarios = Voluntario.query.order_by(Voluntario.nombre).all()
    aves = Ave.query.order_by(Ave.nombre).all()

    if request.method == "GET":
        # Si venimos del botón "Informar un avistamiento" tras un registro
        # exitoso, el voluntario llega como query string (?voluntario_id=5)
        # y lo pre-seleccionamos en el select.
        voluntario_preseleccionado = request.args.get("voluntario_id", "")
        return render_template(
            "avistamiento.html",
            voluntarios=voluntarios,
            aves=aves,
            errores={},
            valores={"voluntario": voluntario_preseleccionado},
        )

    # --- POST: llegaron los datos del formulario ---
    voluntario_id = request.form.get("voluntario", "")
    nombre_ave = request.form.get("ave", "")
    lugar = request.form.get("lugar", "")
    fecha_hora_str = request.form.get("fecha_hora", "")
    descripcion = request.form.get("descripcion", "")
    archivos = request.files.getlist("archivos")

    errores = {}

    if not validar_voluntario(voluntario_id):
        errores["voluntario"] = "Debe seleccionar un voluntario registrado."

    ave = obtener_ave_por_nombre(nombre_ave)
    if ave is None:
        errores["ave"] = "El ave ingresada no existe en el catálogo. Selecciónela de la lista."

    if not validar_lugar(lugar):
        errores["lugar"] = "Ingrese un lugar válido (mínimo 3 caracteres)."

    if not validar_fecha_hora(fecha_hora_str):
        errores["fecha_hora"] = "La fecha no puede ser futura ni tener más de 1 año de antigüedad."

    if not validar_archivos(archivos):
        errores["archivos"] = "Debe adjuntar al menos una foto o vídeo válido (imagen o video)."

    if errores:
        valores = {
            "voluntario": voluntario_id,
            "ave": nombre_ave,
            "lugar": lugar,
            "fecha_hora": fecha_hora_str,
            "descripcion": descripcion,
        }
        return render_template(
            "avistamiento.html",
            voluntarios=voluntarios,
            aves=aves,
            errores=errores,
            valores=valores,
        )

    # --- Todo válido: insertar avistamiento, luego un registro por archivo ---
    nuevo_avistamiento = Avistamiento(
        voluntario_id=int(voluntario_id),
        ave_id=ave.id,
        fecha_hora=datetime.strptime(fecha_hora_str, "%Y-%m-%dT%H:%M"),
        lugar=lugar.strip(),
        descripcion=descripcion.strip() or None,
    )
    db.session.add(nuevo_avistamiento)
    db.session.commit()  # necesitamos el id ya asignado para los registros de archivo

    for archivo in archivos:
        if not archivo or archivo.filename == "":
            continue

        tipo = filetype.guess(archivo)
        archivo.stream.seek(0)
        extension = tipo.extension if tipo else "bin"

        # Nombre único para evitar sobrescribir archivos con el mismo nombre.
        nombre_unico = f"{uuid.uuid4().hex}.{extension}"
        ruta_absoluta = os.path.join(app.config["UPLOAD_FOLDER"], nombre_unico)
        archivo.save(ruta_absoluta)

        nuevo_registro = Registro(
            ruta_archivo=f"uploads/{nombre_unico}",
            nombre_archivo=secure_filename(archivo.filename),
            avistamiento_id=nuevo_avistamiento.id,
        )
        db.session.add(nuevo_registro)

    db.session.commit()

    return redirect(url_for("avistamiento_exitoso", avistamiento_id=nuevo_avistamiento.id))


@app.route("/avistamiento/exito/<int:avistamiento_id>", methods=["GET"])
def avistamiento_exitoso(avistamiento_id):
    avistamiento = Avistamiento.query.get_or_404(avistamiento_id)
    return render_template("avistamiento_exito.html", avistamiento=avistamiento)


@app.route("/listado", methods=["GET"])
def listado_avistamientos():
    pagina = request.args.get("pagina", 1, type=int)

    avistamientos = (
        Avistamiento.query
        .order_by(Avistamiento.fecha_hora.desc())
        .paginate(page=pagina, per_page=10, error_out=False)
    )

    return render_template(
        "listado.html",
        avistamientos=avistamientos
    )


@app.route("/avistamiento/<int:avistamiento_id>", methods=["GET"])
def detalle_avistamiento(avistamiento_id):
    avistamiento = Avistamiento.query.get_or_404(avistamiento_id)

    return render_template(
        "detalle_avistamiento.html",
        avistamiento=avistamiento
    )


@app.route("/avistamiento/<int:avistamiento_id>/comentarios", methods=["GET", "POST"])
def comentarios_avistamiento(avistamiento_id):
    # Si el avistamiento no existe, Flask responde 404.
    avistamiento = Avistamiento.query.get_or_404(avistamiento_id)

    if request.method == "GET":
        comentarios = (
            Comentario.query
            .filter_by(avistamiento_id=avistamiento.id)
            .order_by(Comentario.fecha.desc())
            .all()
        )
        data = [
            {
                "fecha": c.fecha.strftime("%d/%m/%Y %H:%M"),
                "nombre": c.nombre,
                "texto": c.texto,
            }
            for c in comentarios
        ]
        return jsonify({"status": "ok", "data": data})

    # --- POST: llegaron los datos del formulario de comentario ---
    nombre = request.form.get("nombre", "")
    texto = request.form.get("texto", "")

    errores = {}
    if not validar_nombre_comentario(nombre):
        errores["nombre"] = "Ingrese un nombre de entre 3 y 50 caracteres."
    if not validar_texto_comentario(texto):
        errores["texto"] = "Ingrese un comentario de entre 5 y 300 caracteres."

    if errores:
        return jsonify({"status": "error", "errores": errores}), 400

    nuevo_comentario = Comentario(
        nombre=nombre.strip(),
        texto=texto.strip(),
        fecha=datetime.now(),
        avistamiento_id=avistamiento.id,
    )
    db.session.add(nuevo_comentario)
    db.session.commit()

    return jsonify({"status": "ok"})


@app.route("/estadisticas", methods=["GET"])
def estadisticas():
    return render_template("estadisticas.html")


@app.route("/estadisticas/avistamientos-por-dia", methods=["GET"])
def estadisticas_avistamientos_por_dia():
    # Agrupamos por la fecha (sin la hora) del avistamiento y contamos cuántos hay.
    dia = db.func.date(Avistamiento.fecha_hora)
    filas = (
        db.session.query(dia, db.func.count(Avistamiento.id))
        .group_by(dia)
        .order_by(dia)
        .all()
    )

    data = []
    for fecha, total in filas:
        # MySQL entrega un objeto date y SQLite un texto: str() sirve para ambos.
        fecha_formateada = datetime.strptime(str(fecha), "%Y-%m-%d").strftime("%d/%m/%Y")
        data.append({"fecha": fecha_formateada, "total": total})

    return jsonify({"status": "ok", "data": data})


@app.route("/estadisticas/avistamientos-por-ave", methods=["GET"])
def estadisticas_avistamientos_por_ave():
    # Unimos cada avistamiento con su ave, agrupamos por ave y contamos.
    filas = (
        db.session.query(Ave.nombre, db.func.count(Avistamiento.id))
        .join(Avistamiento, Avistamiento.ave_id == Ave.id)
        .group_by(Ave.id, Ave.nombre)
        .order_by(db.func.count(Avistamiento.id).desc(), Ave.nombre)
        .all()
    )

    data = [{"ave": nombre, "total": total} for nombre, total in filas]
    return jsonify({"status": "ok", "data": data})


@app.route("/estadisticas/voluntarios-por-comuna", methods=["GET"])
def estadisticas_voluntarios_por_comuna():
    # Unimos cada voluntario con su comuna, agrupamos por comuna y contamos.
    # Con el join solo aparecen las comunas que tienen al menos un voluntario.
    filas = (
        db.session.query(Comuna.nombre, db.func.count(Voluntario.id))
        .join(Voluntario, Voluntario.comuna_id == Comuna.id)
        .group_by(Comuna.id, Comuna.nombre)
        .order_by(Comuna.nombre)
        .all()
    )

    data = [{"comuna": nombre, "total": total} for nombre, total in filas]
    return jsonify({"status": "ok", "data": data})


def obtener_datos_region_comuna():
    """Devuelve (regiones, comunas_por_region) listos para pasar a la plantilla."""
    regiones = Region.query.order_by(Region.nombre).all()

    comunas_por_region = {}
    for region in regiones:
        comunas_ordenadas = sorted(region.comunas, key=lambda c: c.nombre)
        comunas_por_region[str(region.id)] = [
            {"id": comuna.id, "nombre": comuna.nombre} for comuna in comunas_ordenadas
        ]

    regiones_json = [{"id": r.id, "nombre": r.nombre} for r in regiones]
    return regiones_json, comunas_por_region


@app.route("/registro", methods=["GET", "POST"])
def registrar_voluntario():
    if request.method == "GET":
        regiones, comunas_por_region = obtener_datos_region_comuna()
        return render_template(
            "registro.html",
            regiones=regiones,
            comunas_por_region=comunas_por_region,
            errores={},
            valores={},
        )

    # --- POST: llegaron los datos del formulario ---
    nombre = request.form.get("nombre", "")
    email = request.form.get("email", "")
    celular = request.form.get("celular", "")
    region_id = request.form.get("region", "")
    comuna_id = request.form.get("comuna", "")

    errores = {}

    if not validar_nombre(nombre):
        errores["nombre"] = "Ingrese un nombre válido (mínimo 2 caracteres)."
    if not validar_email(email):
        errores["email"] = "Ingrese un correo electrónico con formato válido."
    if not validar_celular(celular):
        errores["celular"] = "Ingrese un celular chileno válido (ej: +56 9 1234 5678)."
    if not validar_region(region_id):
        errores["region"] = "Debe seleccionar una región válida."
    # Solo validamos la comuna si la región ya es válida, para dar un
    # mensaje más claro en vez de encadenar errores confusos.
    elif not validar_comuna(comuna_id, region_id):
        errores["comuna"] = "Debe seleccionar una comuna válida para la región indicada."

    if errores:
        regiones, comunas_por_region = obtener_datos_region_comuna()
        valores = {
            "nombre": nombre,
            "email": email,
            "celular": celular,
            "region": region_id,
            "comuna": comuna_id,
        }
        return render_template(
            "registro.html",
            regiones=regiones,
            comunas_por_region=comunas_por_region,
            errores=errores,
            valores=valores,
        )

    # --- Todo válido: insertar en la base de datos ---
    nuevo_voluntario = Voluntario(
        nombre=nombre.strip(),
        email=email.strip(),
        telefono=celular.strip(),
        fecha_registro=datetime.now(),
        comuna_id=int(comuna_id),
    )
    db.session.add(nuevo_voluntario)
    db.session.commit()

    return redirect(url_for("registro_exitoso", voluntario_id=nuevo_voluntario.id))


@app.route("/registro/exito/<int:voluntario_id>", methods=["GET"])
def registro_exitoso(voluntario_id):
    voluntario = Voluntario.query.get_or_404(voluntario_id)
    return render_template("registro_exito.html", voluntario=voluntario)


if __name__ == "__main__":
    app.run(debug=True)