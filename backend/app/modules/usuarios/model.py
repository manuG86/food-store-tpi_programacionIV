"""
Modelo de Usuario — tabla 'usuario' en PostgreSQL.

Campos clave para seguridad:
  - hashed_password: hash bcrypt (nunca texto plano).
  - role: "user" | "admin" — usado por require_role() para RBAC.
  - disabled: permite desactivar cuentas sin eliminarlas.
"""

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.pedidos.models import Pedido


class Usuario(SQLModel, table=True):
    id:              int | None = Field(default=None, primary_key=True)
    username:        str        = Field(index=True, unique=True)
    full_name:       str
    email:           str        = Field(index=True, unique=True)
    hashed_password: str
    role:            str        = Field(default="user")           # "user" | "admin"
    disabled:        bool       = Field(default=False)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_type=DateTime(timezone=True),
        nullable=False,
    )

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
