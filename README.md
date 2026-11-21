# Food Store · Trabajo Práctico Integrador

Aplicación web de pedidos de comida para Programación IV. El cliente puede explorar el catálogo sin cuenta, armar un carrito y, con sesión iniciada, confirmar y cancelar sus pedidos pendientes. El panel de administración permite gestionar categorías, productos, stock, pedidos y usuarios, y consultar un resumen de actividad.

## Requisitos

- Python 3.12 y PostgreSQL 15 o superior, con el servidor iniciado.
- Node.js 22 (desde 22.13) o Node.js 24 o superior, y pnpm. La instalación local se verificó con Node.js 26.10 y pnpm 12.6.

## Backend

Desde la raíz del proyecto, creá una base vacía si todavía no existe. Usá una cuenta de PostgreSQL con permiso para crear la base o pedile a quien administra PostgreSQL que la cree.

```sh
createdb food_store_tpi
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp -n .env.example .env
```

Configurá `backend/.env` antes de ejecutar la aplicación.

| Variable | Configuración local |
| --- | --- |
| `DATABASE_URL` | URL de PostgreSQL, por ejemplo `postgresql+psycopg2://usuario:contrasena@localhost:5432/food_store_tpi`. Reemplazá usuario y contraseña por los de tu instalación. |
| `SECRET_KEY` | Clave aleatoria de al menos 32 caracteres. Podés generarla con `python -c "import secrets; print(secrets.token_urlsafe(48))"`. |
| `ALGORITHM` | `HS256`. |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30`. |
| `FRONTEND_ORIGIN` | `http://localhost:5173`. |

Desde `backend/`, con el entorno virtual activo:

```sh
python -m app.db.seed
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

El seed agrega tres categorías, ocho productos con stock y dos cuentas de demostración. Se puede ejecutar más de una vez.

| Rol | Usuario | Contraseña |
| --- | --- | --- |
| Administrador | `admin` | `Admin1234!` |
| Cliente | `juan` | `Juan1234!` |

La API usa el prefijo `/api/v1`. Con el servidor en marcha se puede acceder a [Swagger](http://localhost:8000/docs) y [ReDoc](http://localhost:8000/redoc).

## Frontend

Desde la raíz, en una segunda terminal:

```sh
cd frontend
cp -n .env.example .env
pnpm install --frozen-lockfile
pnpm build
pnpm dev --host localhost --port 5173 --strictPort
```

En `frontend/.env`, `VITE_API_URL` debe ser `http://localhost:8000/api/v1` para la configuración local de arriba. Abrí el [catálogo](http://localhost:5173/) usando `localhost` para que el navegador pueda enviar la cookie de sesión a la API.

## Recorrido de prueba

1. En el catálogo, buscá un producto con stock y agregalo al carrito.
2. Registrate o iniciá sesión con la cuenta de cliente del seed. Confirmá la compra con una dirección y una forma de pago.
3. En **Mis pedidos**, abrí el detalle y cancelá el pedido pendiente. Verificá que el stock vuelva al valor anterior.
4. Entrá con la cuenta administradora y revisá categorías, productos, stock, pedidos, usuarios y el resumen.

Las pruebas del backend se ejecutan con `python -m pytest -q` desde `backend/`, con el entorno virtual activo.

## Enlaces de entrega

- Repositorio público de GitHub: pendiente de publicación.
- Video de demostración: pendiente de grabación y publicación.
