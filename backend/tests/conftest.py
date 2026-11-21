"""
Configuración de las pruebas: SQLite en memoria en lugar de PostgreSQL.

- SECRET_KEY y DATABASE_URL se definen antes de importar la app
  (Settings las exige; PostgreSQL no se usa).
- El UnitOfWork real se usa tal cual: solo se reemplaza el engine que importa
  app/core/uow.py por uno de SQLite en memoria (monkeypatch).
- Cada prueba arranca con la base vacía y dos usuarios: admin y juan.
"""
import os

os.environ.setdefault("SECRET_KEY", "clave-solo-para-pruebas-con-32-caracteres-o-mas")
os.environ.setdefault("DATABASE_URL", "sqlite://")

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool
from sqlmodel import Session, SQLModel, create_engine

from app.core.security import hash_password
from app.main import app
from app.modules.usuarios.model import Usuario

# StaticPool: todas las conexiones comparten la misma base en memoria.
engine_test = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)


@pytest.fixture()
def client(monkeypatch):
    SQLModel.metadata.create_all(engine_test)
    with Session(engine_test) as session:
        session.add(Usuario(username="admin", full_name="Admin", email="admin@test.com",
                            hashed_password=hash_password("Admin1234!"), role="admin"))
        session.add(Usuario(username="juan", full_name="Juan", email="juan@test.com",
                            hashed_password=hash_password("Juan1234!"), role="user"))
        session.commit()

    monkeypatch.setattr("app.core.uow.engine", engine_test)
    yield TestClient(app)   # sin "with": no ejecuta el lifespan (no toca PostgreSQL)

    SQLModel.metadata.drop_all(engine_test)


def login(client: TestClient, username: str, password: str):
    """Inicia sesión; si es correcta, el cliente guarda la cookie access_token."""
    return client.post("/api/v1/auth/token", data={"username": username, "password": password})
