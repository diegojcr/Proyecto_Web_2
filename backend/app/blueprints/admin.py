import bcrypt
import random
import string
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.database import db
from app.models import Usuario, Rol, Envio, HistorialEstadoEnvio, EstadoEnvio, TipoServicio, Region, MensajeContacto
from app.utils.decorators import admin_required
from sqlalchemy import func, extract

admin_bp = Blueprint("admin", __name__)


# -------------------------------------------------------
# USUARIOS
# -------------------------------------------------------

@admin_bp.route("/users", methods=["GET"])
@admin_required
def listar_usuarios():
    usuarios = Usuario.query.order_by(Usuario.fecha_registro.desc()).all()
    return jsonify({"usuarios": [u.to_dict() for u in usuarios]}), 200


@admin_bp.route("/users", methods=["POST"])
@admin_required
def crear_usuario():
    data = request.get_json()

    campos = ["nombre_completo", "correo", "telefono", "direccion", "contrasena", "id_rol"]
    for campo in campos:
        if not data.get(campo) and data.get(campo) != 0:
            return jsonify({"error": f"El campo {campo} es requerido"}), 400

    if len(data["contrasena"]) < 8:
        return jsonify({"error": "La contrasena debe tener al menos 8 caracteres"}), 400

    if Usuario.query.filter_by(correo=data["correo"].strip().lower()).first():
        return jsonify({"error": "El correo ya esta registrado"}), 409

    rol = Rol.query.get(data["id_rol"])
    if not rol:
        return jsonify({"error": "Rol invalido"}), 400

    contrasena_hash = bcrypt.hashpw(
        data["contrasena"].encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")

    nuevo_usuario = Usuario(
        id_rol          = rol.id_rol,
        nombre_completo = data["nombre_completo"].strip(),
        correo          = data["correo"].strip().lower(),
        telefono        = data["telefono"].strip(),
        direccion       = data["direccion"].strip(),
        contrasena_hash = contrasena_hash,
        activo          = True,
    )

    db.session.add(nuevo_usuario)
    db.session.commit()

    return jsonify({
        "message": "Usuario creado exitosamente",
        "usuario": nuevo_usuario.to_dict()
    }), 201


@admin_bp.route("/users/<int:id_usuario>", methods=["PUT"])
@admin_required
def editar_usuario(id_usuario):
    usuario = Usuario.query.get(id_usuario)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    data = request.get_json()

    if "nombre_completo" in data:
        usuario.nombre_completo = data["nombre_completo"].strip()
    if "telefono" in data:
        usuario.telefono = data["telefono"].strip()
    if "direccion" in data:
        usuario.direccion = data["direccion"].strip()
    if "correo" in data:
        existente = Usuario.query.filter_by(correo=data["correo"]).first()
        if existente and existente.id_usuario != id_usuario:
            return jsonify({"error": "El correo ya esta en uso"}), 409
        usuario.correo = data["correo"].strip().lower()
    if "activo" in data:
        usuario.activo = bool(data["activo"])

    db.session.commit()
    return jsonify({
        "message": "Usuario actualizado",
        "usuario": usuario.to_dict()
    }), 200


@admin_bp.route("/users/<int:id_usuario>", methods=["DELETE"])
@admin_required
def desactivar_usuario(id_usuario):
    usuario = Usuario.query.get(id_usuario)
    if not usuario:
        return jsonify({"error": "Usuario no encontrado"}), 404

    if usuario.rol.nombre == "Administrador":
        return jsonify({"error": "No puedes desactivar un administrador"}), 403

    usuario.activo = False
    db.session.commit()
    return jsonify({"message": "Usuario desactivado correctamente"}), 200


@admin_bp.route("/roles", methods=["GET"])
@admin_required
def listar_roles():
    roles = Rol.query.all()
    return jsonify({
        "roles": [{"id_rol": r.id_rol, "nombre": r.nombre} for r in roles]
    }), 200


# -------------------------------------------------------
# ENVIOS
# -------------------------------------------------------

def generar_codigo_guia():
    fecha     = datetime.utcnow().strftime("%Y%m%d")
    aleatorio = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"SKY-{fecha}-{aleatorio}"


@admin_bp.route("/shipments", methods=["GET"])
@admin_required
def listar_envios():
    envios = Envio.query.order_by(Envio.fecha_creacion.desc()).all()
    return jsonify({"envios": [e.to_dict() for e in envios]}), 200


@admin_bp.route("/shipments", methods=["POST"])
@admin_required
def crear_envio_admin():
    data = request.get_json()

    campos = ["id_usuario", "id_tipo_servicio", "id_region_destino",
              "direccion_origen", "nombre_destinatario", "direccion_destino", "peso_kg"]
    for campo in campos:
        if not data.get(campo):
            return jsonify({"error": f"El campo {campo} es requerido"}), 400

    usuario = Usuario.query.get(data["id_usuario"])
    if not usuario or not usuario.activo:
        return jsonify({"error": "Usuario invalido"}), 400

    tipo = TipoServicio.query.get(data["id_tipo_servicio"])
    if not tipo:
        return jsonify({"error": "Tipo de servicio invalido"}), 400

    region = Region.query.get(data["id_region_destino"])
    if not region:
        return jsonify({"error": "Region invalida"}), 400

    peso  = float(data["peso_kg"])
    costo = round(peso * float(tipo.precio_base_kg), 2)

    codigo = generar_codigo_guia()
    while Envio.query.get(codigo):
        codigo = generar_codigo_guia()

    estado_inicial = EstadoEnvio.query.filter_by(orden=1).first()

    nuevo_envio = Envio(
        codigo_guia         = codigo,
        id_usuario          = usuario.id_usuario,
        id_tipo_servicio    = tipo.id_tipo,
        id_region_destino   = region.id_region,
        id_estado           = estado_inicial.id_estado,
        direccion_origen    = data["direccion_origen"].strip(),
        nombre_destinatario = data["nombre_destinatario"].strip(),
        direccion_destino   = data["direccion_destino"].strip(),
        descripcion_paquete = data.get("descripcion_paquete", "").strip(),
        peso_kg             = peso,
        costo_estimado      = costo,
    )

    db.session.add(nuevo_envio)
    db.session.flush()

    historial = HistorialEstadoEnvio(
        codigo_guia = codigo,
        id_estado   = estado_inicial.id_estado,
        observacion = "Envio creado por administrador"
    )

    db.session.add(historial)
    db.session.commit()

    return jsonify({
        "message": "Envio creado exitosamente",
        "envio":   nuevo_envio.to_dict()
    }), 201


@admin_bp.route("/shipments/<codigo_guia>", methods=["PUT"])
@admin_required
def actualizar_envio(codigo_guia):
    envio = Envio.query.get(codigo_guia)
    if not envio:
        return jsonify({"error": "Envio no encontrado"}), 404

    data = request.get_json()

    if "id_estado" in data:
        estado = EstadoEnvio.query.get(data["id_estado"])
        if not estado:
            return jsonify({"error": "Estado invalido"}), 400

        envio.id_estado = estado.id_estado

        historial = HistorialEstadoEnvio(
            codigo_guia = codigo_guia,
            id_estado   = estado.id_estado,
            observacion = data.get("observacion", "").strip()
        )
        db.session.add(historial)

        from app import socketio
        socketio.emit(
            "estado_actualizado",
            {
                "codigo_guia": codigo_guia,
                "estado":      estado.nombre,
                "observacion": data.get("observacion", ""),
                "fecha":       historial.fecha_cambio.isoformat()
                               if historial.fecha_cambio else None
            },
            room=codigo_guia
        )

    if "nombre_destinatario" in data:
        envio.nombre_destinatario = data["nombre_destinatario"].strip()
    if "direccion_destino" in data:
        envio.direccion_destino = data["direccion_destino"].strip()

    db.session.commit()
    return jsonify({
        "message": "Envio actualizado",
        "envio":   envio.to_dict()
    }), 200


@admin_bp.route("/shipments/<codigo_guia>", methods=["DELETE"])
@admin_required
def eliminar_envio(codigo_guia):
    envio = Envio.query.get(codigo_guia)
    if not envio:
        return jsonify({"error": "Envio no encontrado"}), 404

    db.session.delete(envio)
    db.session.commit()
    return jsonify({"message": "Envio eliminado correctamente"}), 200


# -------------------------------------------------------
# MENSAJES DE CONTACTO
# -------------------------------------------------------

@admin_bp.route("/messages", methods=["GET"])
@admin_required
def listar_mensajes():
    mensajes = MensajeContacto.query.order_by(MensajeContacto.fecha_envio.desc()).all()
    return jsonify({
        "mensajes": [
            {
                "id_mensaje":       m.id_mensaje,
                "nombre_remitente": m.nombre_remitente,
                "correo_remitente": m.correo_remitente,
                "telefono":         m.telefono,
                "asunto":           m.asunto,
                "mensaje":          m.mensaje,
                "leido":            m.leido,
                "fecha_envio":      m.fecha_envio.isoformat() if m.fecha_envio else None,
            }
            for m in mensajes
        ]
    }), 200


@admin_bp.route("/messages/<int:id_mensaje>/read", methods=["PUT"])
@admin_required
def marcar_leido(id_mensaje):
    mensaje = MensajeContacto.query.get(id_mensaje)
    if not mensaje:
        return jsonify({"error": "Mensaje no encontrado"}), 404

    mensaje.leido = True
    db.session.commit()
    return jsonify({"message": "Mensaje marcado como leído"}), 200


# -------------------------------------------------------
# DASHBOARD - METRICAS
# -------------------------------------------------------

@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def dashboard():
    envios_por_mes = db.session.query(
        extract("year",  Envio.fecha_creacion).label("anio"),
        extract("month", Envio.fecha_creacion).label("mes"),
        func.count(Envio.codigo_guia).label("total")
    ).group_by(
        extract("year",  Envio.fecha_creacion),
        extract("month", Envio.fecha_creacion)
    ).order_by("anio", "mes").all()

    envios_por_region = db.session.query(
        Region.nombre.label("region"),
        func.count(Envio.codigo_guia).label("total")
    ).join(Envio, Envio.id_region_destino == Region.id_region
    ).group_by(Region.id_region, Region.nombre).all()

    envios_por_estado = db.session.query(
        EstadoEnvio.nombre.label("estado"),
        func.count(Envio.codigo_guia).label("total")
    ).join(Envio, Envio.id_estado == EstadoEnvio.id_estado
    ).group_by(EstadoEnvio.id_estado, EstadoEnvio.nombre).all()

    total_usuarios     = Usuario.query.filter_by(activo=True).count()
    total_envios       = Envio.query.count()
    mensajes_no_leidos = MensajeContacto.query.filter_by(leido=False).count()

    return jsonify({
        "totales": {
            "usuarios":           total_usuarios,
            "envios":             total_envios,
            "mensajes_no_leidos": mensajes_no_leidos
        },
        "envios_por_mes": [
            {"anio": int(r.anio), "mes": int(r.mes), "total": r.total}
            for r in envios_por_mes
        ],
        "envios_por_region": [
            {"region": r.region, "total": r.total}
            for r in envios_por_region
        ],
        "envios_por_estado": [
            {"estado": r.estado, "total": r.total}
            for r in envios_por_estado
        ]
    }), 200