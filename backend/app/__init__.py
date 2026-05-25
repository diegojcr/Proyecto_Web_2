from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv
import os

from . import models  

from .database import init_db


load_dotenv()

socketio = SocketIO()


def create_app():
    app = Flask(__name__)

    # Configuracion general
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
    app.config["ENV"] = os.getenv("FLASK_ENV", "development")

    # Configuracion de la base de datos
    DB_HOST = os.getenv("DB_HOST", "localhost")
    DB_PORT = os.getenv("DB_PORT", "3306")
    DB_NAME = os.getenv("DB_NAME")
    DB_USER = os.getenv("DB_USER")
    DB_PASSWORD = os.getenv("DB_PASSWORD")

    app.config["SQLALCHEMY_DATABASE_URI"] = (
        f"mysql+mysqlconnector://{DB_USER}:{DB_PASSWORD}"
        f"@{DB_HOST}:{DB_PORT}/{DB_NAME}"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Inicializar base de datos
    init_db(app)

  

    # CORS: acepta peticiones del frontend (local o produccion via FRONTEND_URL)
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    CORS(app, origins=[frontend_url])

    # WebSocket
    socketio.init_app(app, cors_allowed_origins=frontend_url)

    # Registrar blueprints
    from .blueprints.auth import auth_bp
    from .blueprints.shipments import shipments_bp
    from .blueprints.admin import admin_bp

    app.register_blueprint(auth_bp, url_prefix="/auth")
    app.register_blueprint(shipments_bp, url_prefix="/shipments")
    app.register_blueprint(admin_bp, url_prefix="/admin")

    @app.route("/")
    def index():
        return {"message": "SkyShip API corriendo", "status": "ok"}
    
    # WebSocket - sala de rastreo por codigo de guia
    @socketio.on("join")
    def on_join(data):
        from flask_socketio import join_room
        room = data.get("codigo_guia")
        if room:
            join_room(room)

    @socketio.on("leave")
    def on_leave(data):
        from flask_socketio import leave_room
        room = data.get("codigo_guia")
        if room:
            leave_room(room)

    return app

    