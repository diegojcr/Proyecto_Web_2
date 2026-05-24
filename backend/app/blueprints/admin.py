from flask import Blueprint, request, jsonify
from app.database import db
from app.models import Usuario, Envio, HistorialEstadoEnvio, EstadoEnvio, MensajeContacto
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


# -------------------------------------------------------
# ENVIOS
# -------------------------------------------------------

@admin_bp.route("/shipments", methods=["GET"])
@admin_required
def listar_envios():
    envios = Envio.query.order_by(Envio.fecha_creacion.desc()).all()
    return jsonify({"envios": [e.to_dict() for e in envios]}), 200


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

        # Registrar en historial
        historial = HistorialEstadoEnvio(
            codigo_guia = codigo_guia,
            id_estado   = estado.id_estado,
            observacion = data.get("observacion", "").strip()
        )
        db.session.add(historial)

        # Emitir evento WebSocket al cliente
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
# DASHBOARD - METRICAS
# -------------------------------------------------------

@admin_bp.route("/dashboard", methods=["GET"])
@admin_required
def dashboard():
    from app.models import Region

    # Envios por mes
    envios_por_mes = db.session.query(
        extract("year",  Envio.fecha_creacion).label("anio"),
        extract("month", Envio.fecha_creacion).label("mes"),
        func.count(Envio.codigo_guia).label("total")
    ).group_by(
        extract("year",  Envio.fecha_creacion),
        extract("month", Envio.fecha_creacion)
    ).order_by("anio", "mes").all()

    # Envios por region
    envios_por_region = db.session.query(
        Region.nombre.label("region"),
        func.count(Envio.codigo_guia).label("total")
    ).join(Envio, Envio.id_region_destino == Region.id_region
    ).group_by(Region.id_region, Region.nombre).all()

    # Envios por estado
    envios_por_estado = db.session.query(
        EstadoEnvio.nombre.label("estado"),
        func.count(Envio.codigo_guia).label("total")
    ).join(Envio, Envio.id_estado == EstadoEnvio.id_estado
    ).group_by(EstadoEnvio.id_estado, EstadoEnvio.nombre).all()

    # Totales generales
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