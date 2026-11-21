from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query, status

from app.core.deps import require_role
from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.service import ProductoNoEncontrado, ProductoService
from app.modules.productos.unit_of_work import ProductoUnitOfWork

router = APIRouter(prefix="/productos", tags=["productos"])
admin_only = [Depends(require_role(["admin"]))]


def get_producto_service() -> ProductoService:
    return ProductoService(ProductoUnitOfWork())


ProductoServiceDep = Annotated[ProductoService, Depends(get_producto_service)]


@router.get("", response_model=ProductosPaginados)
def list_productos(
    service: ProductoServiceDep,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
):
    return service.list_all(
        skip=skip, limit=limit, search=search, categoria_id=categoria_id, disponible=disponible,
    )


@router.get("/{producto_id}", response_model=ProductoRead)
def get_producto(producto_id: int, service: ProductoServiceDep):
    try:
        return service.get_by_id(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.post("", response_model=ProductoRead, status_code=status.HTTP_201_CREATED, dependencies=admin_only)
def create_producto(datos: ProductoCreate, service: ProductoServiceDep):
    try:
        return service.create(datos)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.put("/{producto_id}", response_model=ProductoRead, dependencies=admin_only)
def update_producto(producto_id: int, datos: ProductoUpdate, service: ProductoServiceDep):
    try:
        return service.update(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.patch("/{producto_id}/stock", response_model=ProductoRead, dependencies=admin_only)
def update_producto_stock(producto_id: int, datos: ProductoStockUpdate, service: ProductoServiceDep):
    try:
        return service.update_stock(producto_id, datos)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=admin_only)
def delete_producto(producto_id: int, service: ProductoServiceDep):
    try:
        service.delete(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
