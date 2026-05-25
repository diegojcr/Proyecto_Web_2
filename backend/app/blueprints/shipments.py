import random
import string
from datetime import datetime
from flask import Blueprint, request, jsonify
from app.database import db
from app.models import Envio, HistorialEstadoEnvio, EstadoEnvio, TipoServicio, Region, MensajeContacto
from app.utils.decorators import jwt_required

shipments_bp = Blueprint("shipments", __name__)


def generar_codigo_guia():
    fecha = datetime.utcnow().strftime("%Y%m%d")
    aleatorio = "".join(random.choices(string.ascii_uppercase + string.digits, k=6))
    return f"SKY-{fecha}-{aleatorio}"


# --- RUTAS ESTATICAS PRIMERO ---

@shipments_bp.route("/tipos", methods=["GET"])
def listar_tipos():
    tipos = TipoServicio.query.all()
    return jsonify({
        "tipos": [{"id_tipo": t.id_tipo, "nombre": t.nombre, "precio_base_kg": float(t.precio_base_kg)} for t in tipos]
    }), 200


@shipments_bp.route("/regiones", methods=["GET"])
def listar_regiones():
    regiones = Region.query.all()
    return jsonify({
        "regiones": [{"id_region": r.id_region, "nombre": r.nombre} for r in regiones]
    }), 200


@shipments_bp.route("/estados", methods=["GET"])
def listar_estados():
    estados = EstadoEnvio.query.order_by(EstadoEnvio.orden).all()
    return jsonify({
        "estados": [{"id_estado": e.id_estado, "nombre": e.nombre} for e in estados]
    }), 200


@shipments_bp.route("/contact", methods=["POST"])
def contacto():
    data = request.get_json()

    campos = ["nombre_remitente", "correo_remitente", "asunto", "mensaje"]
    for campo in campos:
        if not data.get(campo, "").strip():
            return jsonify({"error": f"El campo {campo} es requerido"}), 400

    mensaje = MensajeContacto(
        nombre_remitente = data["nombre_remitente"].strip(),
        correo_remitente = data["correo_remitente"].strip().lower(),
        telefono         = data.get("telefono", "").strip(),
        asunto           = data["asunto"].strip(),
        mensaje          = data["mensaje"].strip()
    )

    db.session.add(mensaje)
    db.session.commit()

    return jsonify({"message": "Mensaje enviado exitosamente"}), 201


# --- RUTAS CON PARAMETROS AL FINAL ---

@shipments_bp.route("", methods=["POST"])
@jwt_required
def crear_envio():
    data = request.get_json()
    usuario = request.usuario_actual

    campos = ["id_tipo_servicio", "id_region_destino", "direccion_origen",
              "nombre_destinatario", "direccion_destino", "peso_kg"]
    for campo in campos:
        if not data.get(campo):
            return jsonify({"error": f"El campo {campo} es requerido"}), 400

    tipo = TipoServicio.query.get(data["id_tipo_servicio"])
    if not tipo:
        return jsonify({"error": "Tipo de servicio invalido"}), 400

    region = Region.query.get(data["id_region_destino"])
    if not region:
        return jsonify({"error": "Region invalida"}), 400

    peso = float(data["peso_kg"])
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
        costo_estimado      = costo
    )

    db.session.add(nuevo_envio)
    db.session.flush()

    historial = HistorialEstadoEnvio(
        codigo_guia = codigo,
        id_estado   = estado_inicial.id_estado,
        observacion = "Envio creado y recibido en sistema"
    )

    db.session.add(historial)
    db.session.commit()

    return jsonify({
        "message": "Envio creado exitosamente",
        "envio":   nuevo_envio.to_dict()
    }), 201


@shipments_bp.route("", methods=["GET"])
@jwt_required
def listar_envios():
    usuario = request.usuario_actual
    envios = Envio.query.filter_by(id_usuario=usuario.id_usuario).order_by(
        Envio.fecha_creacion.desc()
    ).all()
    return jsonify({"envios": [e.to_dict() for e in envios]}), 200


@shipments_bp.route("/<codigo_guia>", methods=["GET"])
@jwt_required
def detalle_envio(codigo_guia):
    usuario = request.usuario_actual
    envio = Envio.query.filter_by(
        codigo_guia=codigo_guia,
        id_usuario=usuario.id_usuario
    ).first()

    if not envio:
        return jsonify({"error": "Envio no encontrado"}), 404

    historial = HistorialEstadoEnvio.query.filter_by(
        codigo_guia=codigo_guia
    ).order_by(HistorialEstadoEnvio.fecha_cambio.asc()).all()

    return jsonify({
        "envio":     envio.to_dict(),
        "historial": [h.to_dict() for h in historial]
    }), 200