import jwt
import bcrypt
import os
from datetime import datetime, timedelta
from flask import Blueprint, request, jsonify
from app.database import db
from app.models import Usuario, Rol
from app.utils.decorators import jwt_required

auth_bp = Blueprint("auth", __name__)


def generar_token(usuario):
    payload = {
        "id_usuario": usuario.id_usuario,
        "correo":     usuario.correo,
        "rol":        usuario.rol.nombre,
        "exp":        datetime.utcnow() + timedelta(
                          hours=int(os.getenv("JWT_EXPIRATION_HOURS", 24))
                      )
    }
    return jwt.encode(payload, os.getenv("JWT_SECRET_KEY"), algorithm="HS256")


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json()

    # Validaciones
    campos = ["nombre_completo", "correo", "telefono", "direccion", "contrasena"]
    for campo in campos:
        if not data.get(campo, "").strip():
            return jsonify({"error": f"El campo {campo} es requerido"}), 400

    if len(data["contrasena"]) < 8:
        return jsonify({"error": "La contrasena debe tener al menos 8 caracteres"}), 400

    # Verificar si el correo ya existe
    if Usuario.query.filter_by(correo=data["correo"]).first():
        return jsonify({"error": "El correo ya esta registrado"}), 409

    # Hashear contrasena con bcrypt (genera salt automaticamente)
    contrasena_hash = bcrypt.hashpw(
        data["contrasena"].encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    # Obtener rol Cliente (id_rol=2)
    rol_cliente = Rol.query.filter_by(nombre="Cliente").first()

    nuevo_usuario = Usuario(
        id_rol          = rol_cliente.id_rol,
        nombre_completo = data["nombre_completo"].strip(),
        correo          = data["correo"].strip().lower(),
        telefono        = data["telefono"].strip(),
        direccion       = data["direccion"].strip(),
        contrasena_hash = contrasena_hash
    )

    db.session.add(nuevo_usuario)
    db.session.commit()

    token = generar_token(nuevo_usuario)

    return jsonify({
        "message": "Usuario registrado exitosamente",
        "token":   token,
        "usuario": nuevo_usuario.to_dict()
    }), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data.get("correo") or not data.get("contrasena"):
        return jsonify({"error": "Correo y contrasena son requeridos"}), 400

    usuario = Usuario.query.filter_by(
        correo=data["correo"].strip().lower()
    ).first()

    if not usuario or not usuario.activo:
        return jsonify({"error": "Credenciales invalidas"}), 401

    # Verificar contrasena contra el hash almacenado
    contrasena_valida = bcrypt.checkpw(
        data["contrasena"].encode("utf-8"),
        usuario.contrasena_hash.encode("utf-8")
    )

    if not contrasena_valida:
        return jsonify({"error": "Credenciales invalidas"}), 401

    token = generar_token(usuario)

    return jsonify({
        "message": "Login exitoso",
        "token":   token,
        "usuario": usuario.to_dict()
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required
def me():
    return jsonify({"usuario": request.usuario_actual.to_dict()}), 200