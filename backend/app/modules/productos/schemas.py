from pydantic import FiniteFloat, field_validator
from sqlmodel import Field, SQLModel

from app.modules.categorias.schemas import CategoriaPublic


class ProductoCreate(SQLModel):
    categoria_id: int
    nombre: str = Field(min_length=1)
    descripcion: str | None = None
    precio_base: FiniteFloat = Field(ge=0)
    imagen_url: str | None = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True


class ProductoUpdate(SQLModel):
    categoria_id: int | None = None
    nombre: str | None = Field(default=None, min_length=1)
    descripcion: str | None = None
    precio_base: FiniteFloat | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None

    @field_validator("categoria_id", "nombre", "precio_base", "stock", "disponible")
    @classmethod
    def validar_presente(cls, value):
        if value is None:
            raise ValueError("El valor no puede ser nulo")
        return value


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductoRead(SQLModel):
    id: int
    categoria_id: int
    nombre: str
    descripcion: str | None
    precio_base: float
    imagen_url: str | None
    stock: int
    disponible: bool
    activo: bool
    categoria: CategoriaPublic


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
