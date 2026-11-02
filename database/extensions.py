from flask_sqlalchemy import SQLAlchemy

# Instancia única de SQLAlchemy, compartida entre app.py y models.py.
# Se crea aquí (sin conectarla todavía a ninguna app) para evitar un
# import circular: app.py necesita los modelos, y los modelos
# necesitan este objeto "db" para definirse.
db = SQLAlchemy()