"""
Entry point de la aplicación FastAPI.

Responsabilidades:
  - Registrar routers (auth + categorías).
  - Configurar CORS para consumo desde frontend (React, etc.).
  - Crear tablas al arrancar (lifespan).
  - Health check en /health.
"""

from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import API_PREFIX, settings
from app.core.database import create_all_tables
from app.modules.usuarios.router import admin_router, router as auth_router
from app.modules.categorias.router import router as categorias_router
from app.modules.productos.router import router as productos_router
from app.modules.pedidos.router import router as pedidos_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Crea las tablas de BD al arrancar la aplicación."""
    # Si PostgreSQL no está disponible, la aplicación no arranca y muestra el error.
    # (Las pruebas no ejecutan el lifespan: usan SQLite en memoria.)
    create_all_tables()
    yield


app = FastAPI(
    title="Seguridad JWT + CRUD Categorías",
    version="1.0.0",
    lifespan=lifespan,
)

# ─── CORS (ajustar origins en producción) ────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── Routers ─────────────────────────────────────────────────────────────────
api_router = APIRouter(prefix=API_PREFIX)
api_router.include_router(auth_router)
api_router.include_router(admin_router)
api_router.include_router(categorias_router)
api_router.include_router(productos_router)
api_router.include_router(pedidos_router)
app.include_router(api_router)


# ─── Health check ────────────────────────────────────────────────────────────
@app.get("/health", tags=["health"])
def health():
    return {"status": "ok", "version": "1.0.0"}
