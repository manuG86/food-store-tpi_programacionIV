from pydantic import field_validator
from sqlmodel import Field, SQLModel


class CategoriaCreate(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = Field(default="", max_length=500)


class CategoriaUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = Field(default=None, max_length=500)

    @field_validator("nombre", "descripcion")
    @classmethod
    def validar_presente(cls, value: str | None) -> str:
        if value is None:
            raise ValueError("El valor no puede ser nulo")
        return value


class CategoriaPublic(SQLModel):
    id: int
    nombre: str
    descripcion: str
    activo: bool
