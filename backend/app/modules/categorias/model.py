"""Modelo de categoría del catálogo."""

from typing import TYPE_CHECKING

from sqlalchemy import true
from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.modules.productos.model import Producto


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True, min_length=2, max_length=100)
    descripcion: str = ""
    activo: bool = Field(default=True, sa_column_kwargs={"server_default": true()})

    productos: list["Producto"] = Relationship(back_populates="categoria")
