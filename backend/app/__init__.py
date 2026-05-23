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

  

    # CORS: solo acepta peticiones del frontend
    CORS(app, origins=["http://localhost:5173"])

    # WebSocket
    socketio.init_app(app, cors_allowed_origins="http://localhost:5173")

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

    return app