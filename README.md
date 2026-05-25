# SkyShip Express — Plataforma Web

Sistema de gestión logística y mensajería desarrollado como Proyecto de Aplicación 2, curso de Programación Web — Universidad Rafael Landívar, 1S2026.

---

## Tabla de contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Tecnologías](#tecnologías)
- [Requisitos previos](#requisitos-previos)
- [Cómo ejecutar el proyecto](#cómo-ejecutar-el-proyecto)
- [Variables de entorno](#variables-de-entorno)
- [Estructura del proyecto](#estructura-del-proyecto)
- [Endpoints de la API](#endpoints-de-la-api)
- [Decisiones técnicas relevantes](#decisiones-técnicas-relevantes)
- [Credenciales de prueba](#credenciales-de-prueba)

---

## Descripción

SkyShip Express es una plataforma web de extremo a extremo que permite a clientes registrarse, generar solicitudes de envío y rastrear sus paquetes en tiempo real. Los administradores cuentan con un panel interno para gestionar usuarios, envíos y visualizar métricas del negocio.

### Funcionalidades principales

- **Landing page** con información de servicios, historia, misión, visión, valores, FAQ y formulario de contacto
- **Autenticación** con registro e inicio de sesión protegido por JWT
- **Gestión de envíos** — creación, listado y rastreo con código de guía único
- **Rastreo en tiempo real** mediante WebSockets
- **Panel administrativo** con CRUD de usuarios y envíos, tablero de métricas y gestión de mensajes de contacto

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────┐
│                        Cliente                           │
│              React 19 + Vite 8 + Tailwind v4            │
│         (Axios · React Router v7 · Socket.io-client)    │
└──────────────────────────┬──────────────────────────────┘
                           │ HTTP / WebSocket
┌──────────────────────────▼──────────────────────────────┐
│                       Backend                            │
│              Python · Flask · Flask-SocketIO             │
│         (JWT · bcrypt · SQLAlchemy · Flask-CORS)        │
└──────────────────────────┬──────────────────────────────┘
                           │ SQLAlchemy ORM
┌──────────────────────────▼──────────────────────────────┐
│                    Base de datos                          │
│                        MySQL                             │
└─────────────────────────────────────────────────────────┘
```

---

## Tecnologías

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 19 | Framework UI |
| Vite | 8 | Bundler y dev server |
| Tailwind CSS | 4 | Estilos utilitarios |
| React Router DOM | 7 | Enrutamiento cliente |
| Axios | 1.x | Cliente HTTP |
| Socket.io-client | 4.x | WebSockets para rastreo |
| Recharts | 3.x | Gráficas en panel admin |
| Lucide React | 1.x | Iconografía |
| Sentry | 10.x | Monitoreo de errores |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Python | 3.11+ | Lenguaje base |
| Flask | 3.x | Framework web |
| Flask-SQLAlchemy | 3.x | ORM |
| Flask-SocketIO | 5.x | WebSockets |
| Flask-CORS | 6.x | Control de acceso CORS |
| PyJWT | 2.x | Tokens de autenticación |
| bcrypt | 5.x | Hash de contraseñas |
| mysql-connector-python | 9.x | Driver MySQL |
| python-dotenv | 1.x | Variables de entorno |

### Base de datos
| Tecnología | Uso |
|---|---|
| MySQL | Base de datos relacional principal |

---

## Requisitos previos

- Node.js >= 20
- Python >= 3.11
- MySQL >= 8.0
- pip
- npm o yarn

---

## Cómo ejecutar el proyecto

### 1. Clonar el repositorio

```bash
git clone https://github.com/diegojcr/Proyecto_Web_2.git
cd Proyecto_Web_2
```

### 2. Base de datos

Crear la base de datos en MySQL y ejecutar el script de inicialización:

```sql
CREATE DATABASE skyship_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Luego importar el schema y datos semilla:

```bash
mysql -u root -p skyship_db < database/schema.sql
mysql -u root -p skyship_db < database/seed.sql
```

### 3. Backend

```bash
cd backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# macOS / Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales (ver sección Variables de entorno)

# Ejecutar servidor
python run.py
```

El backend queda disponible en `http://localhost:5000`

### 4. Frontend

```bash
cd frontend

# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev
```

El frontend queda disponible en `http://localhost:5173`

---

## Variables de entorno

Crear el archivo `backend/.env` basado en `backend/.env.example`:

```env
# Flask
FLASK_ENV=development
SECRET_KEY=tu_clave_secreta_aqui

# JWT
JWT_SECRET_KEY=tu_clave_jwt_aqui
JWT_EXPIRATION_HOURS=24

# MySQL
DB_HOST=localhost
DB_PORT=3306
DB_NAME=skyship_db
DB_USER=root
DB_PASSWORD=tu_password_aqui
```

---

## Estructura del proyecto

```
Proyecto_Web_2/
├── backend/
│   ├── app/
│   │   ├── blueprints/
│   │   │   ├── auth.py          # Registro, login, /me
│   │   │   ├── shipments.py     # CRUD envíos, catálogos, contacto
│   │   │   └── admin.py         # Panel admin: usuarios, envíos, mensajes, dashboard
│   │   ├── utils/
│   │   │   └── decorators.py    # jwt_required, admin_required
│   │   ├── __init__.py          # create_app, SocketIO, blueprints
│   │   ├── database.py          # SQLAlchemy init
│   │   └── models.py            # Modelos ORM
│   ├── requirements.txt
│   ├── run.py
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── components/          # Navbar, Hero, Services, About, FAQ, Contact, Footer
    │   ├── pages/
    │   │   ├── auth/            # Login, Register
    │   │   ├── dashboard/       # Dashboard cliente, CrearEnvio
    │   │   ├── tracking/        # Rastreo en tiempo real
    │   │   └── admin/           # AdminDashboard, AdminUsers, AdminShipments, AdminMessages, AdminLayout
    │   ├── context/
    │   │   └── AuthContext.jsx  # Estado global de autenticación
    │   ├── services/
    │   │   └── api.js           # Axios con interceptores JWT
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

---

## Endpoints de la API

### Autenticación — `/auth`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| POST | `/auth/register` | Público | Registro de nuevo usuario |
| POST | `/auth/login` | Público | Inicio de sesión |
| GET | `/auth/me` | JWT | Datos del usuario autenticado |

### Envíos — `/shipments`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/shipments/tipos` | Público | Lista tipos de servicio |
| GET | `/shipments/regiones` | Público | Lista regiones disponibles |
| GET | `/shipments/estados` | Público | Lista estados de envío |
| POST | `/shipments/contact` | Público | Enviar mensaje de contacto |
| POST | `/shipments` | JWT | Crear nuevo envío |
| GET | `/shipments` | JWT | Listar envíos del usuario |
| GET | `/shipments/<codigo_guia>` | JWT | Detalle e historial de un envío |

### Administración — `/admin`
| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| GET | `/admin/users` | Admin | Listar todos los usuarios |
| PUT | `/admin/users/<id>` | Admin | Editar usuario |
| DELETE | `/admin/users/<id>` | Admin | Desactivar usuario |
| GET | `/admin/shipments` | Admin | Listar todos los envíos |
| PUT | `/admin/shipments/<codigo>` | Admin | Actualizar estado/datos de envío |
| DELETE | `/admin/shipments/<codigo>` | Admin | Eliminar envío |
| GET | `/admin/messages` | Admin | Listar mensajes de contacto |
| PUT | `/admin/messages/<id>/read` | Admin | Marcar mensaje como leído |
| GET | `/admin/dashboard` | Admin | Métricas generales |

---

## Decisiones técnicas relevantes

### Autenticación con JWT stateless
Se optó por JWT en lugar de sesiones del servidor para mantener el backend sin estado, lo que facilita el escalamiento horizontal. Los tokens se almacenan en `localStorage` en el cliente y se envían automáticamente mediante un interceptor de Axios en cada request.

### Hash de contraseñas con bcrypt
Las contraseñas nunca se almacenan en texto plano. Se utiliza `bcrypt.hashpw` con salt generado automáticamente, lo que protege contra ataques de rainbow table. La verificación se realiza con `bcrypt.checkpw`.

### WebSockets para rastreo en tiempo real
Se implementó Flask-SocketIO en el backend y socket.io-client en el frontend. Cuando un administrador actualiza el estado de un envío, se emite el evento `estado_actualizado` a la sala correspondiente al código de guía, y el cliente que está rastreando ese envío lo recibe instantáneamente sin necesidad de polling.

### Protección de rutas con decoradores
Se implementaron dos decoradores reutilizables — `@jwt_required` y `@admin_required` — que centralizan la lógica de validación de tokens y verificación de roles, evitando repetición en cada endpoint.

### Blueprints para organización del backend
La API se organiza en tres blueprints (`auth`, `shipments`, `admin`) registrados con prefijos de URL, lo que separa responsabilidades y facilita el mantenimiento.

### Rutas estáticas antes que dinámicas en Flask
En el blueprint de `shipments`, las rutas con segmentos fijos (`/tipos`, `/regiones`, `/estados`, `/contact`) se declaran antes que las rutas con parámetros dinámicos (`/<codigo_guia>`) para evitar que Flask interprete segmentos fijos como parámetros.

### Código de guía único
El código de guía se genera con el formato `SKY-YYYYMMDD-XXXXXX` (fecha + 6 caracteres alfanuméricos aleatorios). Se verifica unicidad consultando la BD antes de persistir, regenerando si existe colisión.

---

## Credenciales de prueba

### Administrador
| Campo | Valor |
|---|---|
| Correo | admin@skyshipexpress.com |
| Contraseña | Admin123! |
| Acceso | Panel administrativo completo |

### Cliente
| Campo | Valor |
|---|---|
| Correo | cuebaelgrande@gmail.com |
| Contraseña | Cuevitas123* |
| Acceso | Dashboard, crear envíos, rastreo |

