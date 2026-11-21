"""
Router de autenticación y gestión de usuarios.

HTTP puro: parsear request, validar schema Pydantic, delegar al Service,
serializar response con response_model. No contiene lógica de negocio.

Capa: Router
Conoce a: Service (vía UoW)
NO conoce a: Repository, Model (solo esquemas Pydantic para response_model)

Regla de imports:
    Router → Service → UoW → Repository → Model
"""

from typing import Annotated

from fastapi import APIRouter, Depends, status, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.uow import UnitOfWork, get_uow
from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.schemas import UserCreate, UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix="/auth", tags=["auth"])
admin_router = APIRouter(prefix="/admin/usuarios", tags=["usuarios"])


# ─── Registro ─────────────────────────────────────────────────────────────────

@router.post("/register", response_model=UserPublic, status_code=status.HTTP_201_CREATED)
def register(
    user_in: UserCreate,
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        service = UsuarioService(uow)
        return service.register(user_in)


# ─── Login (OAuth2 Password Flow) ────────────────────────────────────────────

@router.post("/token")
def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
    response: Response,
):
    with uow:
        service = UsuarioService(uow)
        token = service.authenticate(form_data.username, form_data.password)
        
        # Se entrega el token en una cookie HttpOnly (JavaScript no puede leerla)
        response.set_cookie(
            key="access_token",
            value=token.access_token,
            httponly=True,
            max_age=token.expires_in,
            samesite="lax",
            secure=False,  # En producción con HTTPS debería ser True
        )
        return {"message": "Login exitoso"}

@router.post("/logout")
def logout(response: Response):
    # Borra la cookie del navegador. El JWT no se revoca: si alguien guardó una
    # copia, sigue siendo válido hasta su expiración (exp).
    response.delete_cookie(
        key="access_token",
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return {"mensaje": "Sesión cerrada exitosamente"}


# ─── Rutas protegidas ────────────────────────────────────────────────────────

@router.get("/me", response_model=UserPublic)
def read_me(
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
):
    return current_user


@router.get("/privado")
def ruta_privada(
    current_user: Annotated[UserPublic, Depends(get_current_active_user)],
):
    return {
        "mensaje": f"Acceso a ruta privada concedido a {current_user.full_name}.",
        "rol": current_user.role,
    }


# ─── Rutas de administración (RBAC) ──────────────────────────────────────────

@admin_router.get("", response_model=list[UserPublic])
def list_users(
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        service = UsuarioService(uow)
        return service.list_all()


@admin_router.post("/{user_id}/desactivar", response_model=UserPublic)
def deactivate_user(
    user_id: int,
    admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        service = UsuarioService(uow)
        return service.set_disabled(user_id, disabled=True, actor_id=admin.id)


@admin_router.post("/{user_id}/activar", response_model=UserPublic)
def activate_user(
    user_id: int,
    admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
    uow: Annotated[UnitOfWork, Depends(get_uow)],
):
    with uow:
        service = UsuarioService(uow)
        return service.set_disabled(user_id, disabled=False, actor_id=admin.id)
