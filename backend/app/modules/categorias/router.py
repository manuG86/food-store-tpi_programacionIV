from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.core.deps import require_role
from app.modules.categorias.schemas import CategoriaCreate, CategoriaPublic, CategoriaUpdate
from app.modules.categorias.service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork

router = APIRouter(
    prefix="/categorias",
    tags=["categorias"],
)


def get_categoria_service() -> CategoriaService:
    return CategoriaService(CategoriaUnitOfWork())


admin_only = [Depends(require_role(["admin"]))]
CategoriaServiceDep = Annotated[CategoriaService, Depends(get_categoria_service)]


@router.get("", response_model=list[CategoriaPublic])
def list_categorias(service: CategoriaServiceDep):
    return service.list_all()


@router.get("/{categoria_id}", response_model=CategoriaPublic)
def get_categoria(categoria_id: int, service: CategoriaServiceDep):
    try:
        return service.get_by_id(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc


@router.post("", response_model=CategoriaPublic, status_code=status.HTTP_201_CREATED, dependencies=admin_only)
def create_categoria(cat_in: CategoriaCreate, service: CategoriaServiceDep):
    try:
        return service.create(cat_in)
    except NombreDuplicado as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc


@router.put("/{categoria_id}", response_model=CategoriaPublic, dependencies=admin_only)
def update_categoria(categoria_id: int, cat_in: CategoriaUpdate, service: CategoriaServiceDep):
    try:
        return service.update(categoria_id, cat_in)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
    except NombreDuplicado as exc:
        raise HTTPException(status.HTTP_409_CONFLICT, str(exc)) from exc


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT, dependencies=admin_only)
def delete_categoria(categoria_id: int, service: CategoriaServiceDep):
    try:
        service.delete(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status.HTTP_404_NOT_FOUND, str(exc)) from exc
