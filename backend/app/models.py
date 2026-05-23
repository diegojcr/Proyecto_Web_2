from .database import db
from datetime import datetime


class Rol(db.Model):
    __tablename__ = "Rol"

    id_rol  = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre  = db.Column(db.String(50), nullable=False, unique=True)

    usuarios = db.relationship("Usuario", back_populates="rol")


class Region(db.Model):
    __tablename__ = "Region"

    id_region = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre    = db.Column(db.String(100), nullable=False, unique=True)

    envios = db.relationship("Envio", back_populates="region_destino")


class EstadoEnvio(db.Model):
    __tablename__ = "Estado_Envio"

    id_estado = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre    = db.Column(db.String(50), nullable=False, unique=True)
    orden     = db.Column(db.SmallInteger, nullable=False, default=0)

    envios    = db.relationship("Envio", back_populates="estado")
    historial = db.relationship("HistorialEstadoEnvio", back_populates="estado")


class TipoServicio(db.Model):
    __tablename__ = "Tipo_Servicio"

    id_tipo         = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre          = db.Column(db.String(100), nullable=False, unique=True)
    descripcion     = db.Column(db.Text)
    precio_base_kg  = db.Column(db.Numeric(8, 2), nullable=False, default=0.00)

    envios = db.relationship("Envio", back_populates="tipo_servicio")


class Usuario(db.Model):
    __tablename__ = "Usuario"

    id_usuario          = db.Column(db.Integer, primary_key=True, autoincrement=True)
    id_rol              = db.Column(db.Integer, db.ForeignKey("Rol.id_rol"), nullable=False)
    nombre_completo     = db.Column(db.String(150), nullable=False)
    correo              = db.Column(db.String(150), nullable=False, unique=True)
    telefono            = db.Column(db.String(20), nullable=False)
    direccion           = db.Column(db.Text, nullable=False)
    contrasena_hash     = db.Column(db.String(255), nullable=False)
    activo              = db.Column(db.Boolean, nullable=False, default=True)
    fecha_registro      = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    fecha_actualizacion = db.Column(db.DateTime, nullable=False,
                                    default=datetime.utcnow, onupdate=datetime.utcnow)

    rol    = db.relationship("Rol", back_populates="usuarios")
    envios = db.relationship("Envio", back_populates="usuario")

    def to_dict(self):
        return {
            "id_usuario":      self.id_usuario,
            "nombre_completo": self.nombre_completo,
            "correo":          self.correo,
            "telefono":        self.telefono,
            "direccion":       self.direccion,
            "activo":          self.activo,
            "rol":             self.rol.nombre if self.rol else None,
            "fecha_registro":  self.fecha_registro.isoformat() if self.fecha_registro else None,
        }


class Envio(db.Model):
    __tablename__ = "Envio"

    codigo_guia          = db.Column(db.String(50), primary_key=True)
    id_usuario           = db.Column(db.Integer, db.ForeignKey("Usuario.id_usuario"), nullable=False)
    id_tipo_servicio     = db.Column(db.Integer, db.ForeignKey("Tipo_Servicio.id_tipo"), nullable=False)
    id_region_destino    = db.Column(db.Integer, db.ForeignKey("Region.id_region"), nullable=False)
    id_estado            = db.Column(db.Integer, db.ForeignKey("Estado_Envio.id_estado"), nullable=False)
    direccion_origen     = db.Column(db.Text, nullable=False)
    nombre_destinatario  = db.Column(db.String(150), nullable=False)
    direccion_destino    = db.Column(db.Text, nullable=False)
    descripcion_paquete  = db.Column(db.Text)
    peso_kg              = db.Column(db.Numeric(6, 2), nullable=False, default=0.00)
    costo_estimado       = db.Column(db.Numeric(10, 2), nullable=False)
    fecha_creacion       = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    fecha_actualizacion  = db.Column(db.DateTime, nullable=False,
                                     default=datetime.utcnow, onupdate=datetime.utcnow)

    usuario        = db.relationship("Usuario", back_populates="envios")
    tipo_servicio  = db.relationship("TipoServicio", back_populates="envios")
    region_destino = db.relationship("Region", back_populates="envios")
    estado         = db.relationship("EstadoEnvio", back_populates="envios")
    historial      = db.relationship("HistorialEstadoEnvio", back_populates="envio",
                                     cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "codigo_guia":         self.codigo_guia,
            "id_usuario":          self.id_usuario,
            "tipo_servicio":       self.tipo_servicio.nombre if self.tipo_servicio else None,
            "region_destino":      self.region_destino.nombre if self.region_destino else None,
            "estado":              self.estado.nombre if self.estado else None,
            "direccion_origen":    self.direccion_origen,
            "nombre_destinatario": self.nombre_destinatario,
            "direccion_destino":   self.direccion_destino,
            "descripcion_paquete": self.descripcion_paquete,
            "peso_kg":             float(self.peso_kg),
            "costo_estimado":      float(self.costo_estimado),
            "fecha_creacion":      self.fecha_creacion.isoformat() if self.fecha_creacion else None,
        }


class HistorialEstadoEnvio(db.Model):
    __tablename__ = "Historial_Estado_Envio"

    id_historial = db.Column(db.Integer, primary_key=True, autoincrement=True)
    codigo_guia  = db.Column(db.String(50), db.ForeignKey("Envio.codigo_guia"), nullable=False)
    id_estado    = db.Column(db.Integer, db.ForeignKey("Estado_Envio.id_estado"), nullable=False)
    observacion  = db.Column(db.String(255))
    fecha_cambio = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)

    envio  = db.relationship("Envio", back_populates="historial")
    estado = db.relationship("EstadoEnvio", back_populates="historial")

    def to_dict(self):
        return {
            "id_historial": self.id_historial,
            "estado":       self.estado.nombre if self.estado else None,
            "observacion":  self.observacion,
            "fecha_cambio": self.fecha_cambio.isoformat() if self.fecha_cambio else None,
        }


class MensajeContacto(db.Model):
    __tablename__ = "Mensaje_Contacto"

    id_mensaje        = db.Column(db.Integer, primary_key=True, autoincrement=True)
    nombre_remitente  = db.Column(db.String(150), nullable=False)
    correo_remitente  = db.Column(db.String(150), nullable=False)
    telefono          = db.Column(db.String(20))
    asunto            = db.Column(db.String(100), nullable=False)
    mensaje           = db.Column(db.Text, nullable=False)
    leido             = db.Column(db.Boolean, nullable=False, default=False)
    fecha_envio       = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)