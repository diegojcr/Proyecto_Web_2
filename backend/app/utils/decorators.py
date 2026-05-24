import jwt
import os
from functools import wraps
from flask import request, jsonify
from app.models import Usuario


def jwt_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token requerido"}), 401

        try:
            payload = jwt.decode(
                token,
                os.getenv("JWT_SECRET_KEY"),
                algorithms=["HS256"]
            )
            usuario = Usuario.query.get(payload["id_usuario"])
            if not usuario or not usuario.activo:
                return jsonify({"error": "Usuario no encontrado"}), 401

            request.usuario_actual = usuario

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token invalido"}), 401

        return f(*args, **kwargs)
    return decorated


def admin_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None

        if "Authorization" in request.headers:
            auth_header = request.headers["Authorization"]
            if auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]

        if not token:
            return jsonify({"error": "Token requerido"}), 401

        try:
            payload = jwt.decode(
                token,
                os.getenv("JWT_SECRET_KEY"),
                algorithms=["HS256"]
            )
            usuario = Usuario.query.get(payload["id_usuario"])
            if not usuario or not usuario.activo:
                return jsonify({"error": "Usuario no encontrado"}), 401
            if usuario.rol.nombre != "Administrador":
                return jsonify({"error": "Acceso denegado"}), 403

            request.usuario_actual = usuario

        except jwt.ExpiredSignatureError:
            return jsonify({"error": "Token expirado"}), 401
        except jwt.InvalidTokenError:
            return jsonify({"error": "Token invalido"}), 401

        return f(*args, **kwargs)
    return decorated