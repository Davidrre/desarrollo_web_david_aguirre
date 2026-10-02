from extensions import db


class Region(db.Model):
    __tablename__ = "region"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)

    # Una región tiene muchas comunas. "comunas" nos permite hacer
    # region.comunas para obtener la lista; no es una columna real.
    comunas = db.relationship("Comuna", backref="region")


class Comuna(db.Model):
    __tablename__ = "comuna"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(200), nullable=False)
    region_id = db.Column(db.Integer, db.ForeignKey("region.id"), nullable=False)

    # backref="region" en Region.comunas ya nos da comuna.region
    # automáticamente, no hace falta declararlo de nuevo aquí.


class Voluntario(db.Model):
    __tablename__ = "voluntario"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(255), nullable=False)
    email = db.Column(db.String(80), nullable=False)
    telefono = db.Column(db.String(15), nullable=False)
    fecha_registro = db.Column(db.DateTime, nullable=False)
    comuna_id = db.Column(db.Integer, db.ForeignKey("comuna.id"), nullable=False)

    comuna = db.relationship("Comuna", backref="voluntarios")


class Ave(db.Model):
    __tablename__ = "ave"

    id = db.Column(db.Integer, primary_key=True)
    nombre = db.Column(db.String(80), nullable=False)


class Avistamiento(db.Model):
    __tablename__ = "avistamiento"

    id = db.Column(db.Integer, primary_key=True)
    voluntario_id = db.Column(db.Integer, db.ForeignKey("voluntario.id"), nullable=False)
    ave_id = db.Column(db.Integer, db.ForeignKey("ave.id"), nullable=False)
    fecha_hora = db.Column(db.DateTime, nullable=False)
    lugar = db.Column(db.String(200), nullable=False)
    descripcion = db.Column(db.Text, nullable=True)

    voluntario = db.relationship("Voluntario", backref="avistamientos")
    ave = db.relationship("Ave", backref="avistamientos")


class Registro(db.Model):
    __tablename__ = "registro"

    id = db.Column(db.Integer, primary_key=True)
    ruta_archivo = db.Column(db.String(300), nullable=False)
    nombre_archivo = db.Column(db.String(300), nullable=False)
    avistamiento_id = db.Column(db.Integer, db.ForeignKey("avistamiento.id"), nullable=False)

    avistamiento = db.relationship("Avistamiento", backref="registros")