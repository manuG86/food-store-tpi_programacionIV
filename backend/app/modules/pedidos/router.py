from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import get_current_active_user, require_role
from app.modules.pedidos.schemas import (
    CambioEstado,
    EstadoPedido,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from app.modules.pedidos.service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic

router = APIRouter(prefix="/pedidos", tags=["pedidos"])
admin_only = [Depends(require_role(["admin"]))]
UsuarioActivo = Annotated[UserPublic, Depends(get_current_active_user)]


def get_pedido_service() -> PedidoService:
    return PedidoService(PedidoUnitOfWork())


PedidoServiceDep = Annotated[PedidoService, Depends(get_pedido_service)]


@router.post("", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def create_pedido(datos: PedidoCreate, usuario: UsuarioActivo, service: PedidoServiceDep):
    try:
        return service.create(usuario.id, datos)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except (ProductoRepetido, ProductoNoDisponible, StockInsuficiente) as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.get("", response_model=PedidosPaginados)
def list_pedidos(
    usuario: UsuarioActivo,
    service: PedidoServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    estado: EstadoPedido | None = None,
    propios: bool = False,
):
    return service.list_all(usuario, skip=skip, limit=limit, estado=estado, propios=propios)


@router.get("/resumen", response_model=ResumenPedidos, dependencies=admin_only)
def resumen_pedidos(service: PedidoServiceDep):
    return service.summary()


@router.get("/{pedido_id}", response_model=PedidoRead)
def get_pedido(pedido_id: int, usuario: UsuarioActivo, service: PedidoServiceDep):
    try:
        return service.get_by_id(pedido_id, usuario)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(exc)) from exc


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, dependencies=admin_only)
def change_status(pedido_id: int, datos: CambioEstado, service: PedidoServiceDep):
    try:
        return service.change_status(pedido_id, datos.estado)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except TransicionInvalida as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc


@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancel_pedido(pedido_id: int, usuario: UsuarioActivo, service: PedidoServiceDep):
    try:
        return service.cancel(pedido_id, usuario)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(status.HTTP_403_FORBIDDEN, str(exc)) from exc
    except TransicionInvalida as exc:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, str(exc)) from exc
