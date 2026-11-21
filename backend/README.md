# Seguridad JWT con FastAPI

API REST con autenticación JWT en cookie HttpOnly, control de acceso por roles (RBAC) y CRUD de categorías. Es el proyecto de referencia de la Actividad 2 de la Unidad 9 de Programación IV.

## Requisitos

- Python 3.11, 3.12 o 3.13 (`sqlmodel` 0.0.22 no es compatible con Python 3.14)
- PostgreSQL (local o en un contenedor)
- pip

## Instalación

```bash
cd seguridad_jwt_pg
python -m venv .venv
.venv\Scripts\activate          # en Linux o macOS: source .venv/bin/activate
pip install -r requirements.txt
```

## Variables de entorno

Copiar `.env.example` como `.env` y completar los valores. `SECRET_KEY` es obligatoria: sin ella la aplicación no arranca. Para generar una clave:

```bash
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

El archivo `.env` contiene secretos: no se sube al repositorio ni se comparte.

## Carga inicial de datos (seed)

El script `app/db/seed.py` crea las tablas si no existen y carga dos usuarios de prueba, tres categorías y ocho productos con stock. Puede ejecutarse varias veces sin duplicar registros.

```bash
python -m app.db.seed
```

| Usuario | Contraseña | Rol | Acceso |
|---------|------------|-----|--------|
| admin | Admin1234! | admin | Rutas de administración de usuarios |
| juan | Juan1234! | user | Rutas protegidas comunes |

## Ejecución

```bash
uvicorn app.main:app --reload
```

- API: `http://localhost:8000`
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Cómo viaja el token

El login (`POST /api/v1/auth/token`) no devuelve el token en el cuerpo: lo guarda en la cookie HttpOnly `access_token`. Las rutas protegidas leen el token solo de esa cookie; el encabezado `Authorization: Bearer` no se acepta. Un frontend en otro origen (por ejemplo, `http://localhost:5173`) debe enviar las peticiones con `credentials: 'include'` (fetch) o `withCredentials: true` (Axios).

## Inicio rápido con curl

`-c cookies.txt` guarda la cookie que devuelve el servidor y `-b cookies.txt` la envía.

```bash
# 1. Registrar un usuario
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"pepito","full_name":"Pepito Pérez","email":"pepito@example.com","password":"Password123!"}'

# 2. Iniciar sesión (guarda la cookie access_token)
curl -c cookies.txt -X POST http://localhost:8000/api/v1/auth/token \
  -d "username=pepito&password=Password123!"

# 3. Consultar el usuario autenticado
curl -b cookies.txt http://localhost:8000/api/v1/auth/me

# 4. Iniciar sesión como el administrador del seed y crear una categoría
curl -c cookies.txt -X POST http://localhost:8000/api/v1/auth/token \
  -d "username=admin&password=Admin1234!"
curl -b cookies.txt -X POST http://localhost:8000/api/v1/categorias \
  -H "Content-Type: application/json" \
  -d '{"nombre":"Bebidas","descripcion":"Frías y calientes"}'

# 5. Cerrar la sesión (borra la cookie)
curl -b cookies.txt -c cookies.txt -X POST http://localhost:8000/api/v1/auth/logout
```

Los archivos `seguridad_jwt.http` y `categorias_crud.http` recorren los mismos casos con la extensión REST Client de VS Code.

## Endpoints

| Método | Ruta | Acceso |
|--------|------|--------|
| POST | `/api/v1/auth/register` | Público |
| POST | `/api/v1/auth/token` | Público (formulario OAuth2) |
| POST | `/api/v1/auth/logout` | Público |
| GET | `/api/v1/auth/me` | Usuario autenticado |
| GET | `/api/v1/auth/privado` | Usuario autenticado |
| GET | `/api/v1/admin/usuarios` | Rol `admin` |
| POST | `/api/v1/admin/usuarios/{id}/desactivar` | Rol `admin` |
| POST | `/api/v1/admin/usuarios/{id}/activar` | Rol `admin` |
| GET | `/api/v1/categorias`, `/api/v1/categorias/{id}` | Público |
| POST | `/api/v1/categorias` | Rol `admin` |
| PUT, DELETE | `/api/v1/categorias/{id}` | Rol `admin` |
| GET | `/api/v1/productos`, `/api/v1/productos/{id}` | Público |
| POST | `/api/v1/productos` | Rol `admin` |
| PUT, DELETE | `/api/v1/productos/{id}` | Rol `admin` |
| PATCH | `/api/v1/productos/{id}/stock` | Rol `admin` |

## Pruebas

Las pruebas usan SQLite en memoria: no necesitan PostgreSQL ni el archivo `.env`.

```bash
pytest
```

Cubren el login con cookie, el 401 sin sesión, el rechazo del encabezado `Authorization`, el 403 por rol, la desactivación de cuentas, el cierre de sesión y el CRUD de categorías.

## Estructura del proyecto

```
seguridad_jwt_pg/
├── app/
│   ├── main.py              # Punto de entrada de FastAPI
│   ├── core/
│   │   ├── config.py        # Configuración (pydantic-settings)
│   │   ├── database.py      # Engine de PostgreSQL
│   │   ├── security.py      # JWT y bcrypt
│   │   ├── deps.py          # Dependencias de autenticación y require_role
│   │   ├── uow.py           # Unit of Work
│   │   └── base_repository.py
│   ├── modules/
│   │   ├── usuarios/        # Registro, login y administración de usuarios
│   │   └── categorias/      # CRUD de categorías
│   └── db/
│       └── seed.py          # Datos iniciales
├── tests/                   # Pruebas con pytest y SQLite en memoria
├── seguridad_jwt.http       # REST Client (VS Code)
├── categorias_crud.http     # REST Client (VS Code)
├── requirements.txt
└── .env.example             # Plantilla de variables de entorno
```
