"""Modelos de pedidos y sus líneas."""

from datetime import datetime, timezone
from typing import TYPE_CHECKING

from sqlalchemy import DateTime
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.model import Producto
    from app.modules.usuarios.model import Usuario


def ahora_utc() -> datetime:
    return datetime.now(timezone.utc)


class Pedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", index=True)
    estado: str = "PENDIENTE"
    forma_pago: str
    direccion_entrega: str = Field(min_length=5, max_length=200)
    notas: str | None = None
    total: float
    created_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))
    updated_at: datetime = Field(default_factory=ahora_utc, sa_type=DateTime(timezone=True))

    usuario: "Usuario" = Relationship(back_populates="pedidos")
    items: list["DetallePedido"] = Relationship(back_populates="pedido")


class DetallePedido(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    producto_id: int = Field(foreign_key="producto.id", index=True)
    cantidad: int = Field(ge=1)
    nombre_producto: str
    precio_unitario: float
    subtotal: float

    pedido: Pedido = Relationship(back_populates="items")
    producto: "Producto" = Relationship(back_populates="detalles")
