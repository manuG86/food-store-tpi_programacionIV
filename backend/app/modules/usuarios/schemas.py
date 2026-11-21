from datetime import datetime

from pydantic import EmailStr
from sqlmodel import Field, SQLModel


class UserCreate(SQLModel):
    """Datos requeridos para registrar un usuario."""
    username:  str
    full_name: str
    email:     EmailStr
    password:  str = Field(min_length=8, max_length=72)   # bcrypt usa hasta 72 bytes


class UserPublic(SQLModel):
    """Vista pública del usuario — excluye hashed_password."""
    id:        int
    username:  str
    full_name: str
    email:     str
    role:      str
    disabled:  bool
    created_at: datetime


class Token(SQLModel):
    """Datos internos del token de sesión."""
    access_token: str
    token_type:   str = "bearer"
    expires_in:   int  # segundos hasta expiración
