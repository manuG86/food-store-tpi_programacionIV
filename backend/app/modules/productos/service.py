from app.modules.categorias.service import CategoriaNoEncontrada
from app.modules.productos.model import Producto
from app.modules.productos.schemas import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork):
        self.uow = uow

    def list_all(
        self, *, skip: int, limit: int, search: str | None,
        categoria_id: int | None, disponible: bool | None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip=skip, limit=limit, search=search,
                categoria_id=categoria_id, disponible=disponible,
            )
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(producto) for producto in productos],
            )

    def get_by_id(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            return ProductoRead.model_validate(self._buscar(uow, producto_id))

    def create(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            self._validar_categoria(uow, datos.categoria_id)
            producto = uow.productos.add(Producto.model_validate(datos))
            return ProductoRead.model_validate(producto)

    def update(self, producto_id: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar(uow, producto_id)
            cambios = datos.model_dump(exclude_unset=True)
            if "categoria_id" in cambios:
                self._validar_categoria(uow, cambios["categoria_id"])
            for campo, valor in cambios.items():
                setattr(producto, campo, valor)
            return ProductoRead.model_validate(uow.productos.update(producto))

    def update_stock(self, producto_id: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            producto = self._buscar(uow, producto_id)
            producto.stock = datos.stock
            producto.disponible = datos.disponible
            return ProductoRead.model_validate(uow.productos.update(producto))

    def delete(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = self._buscar(uow, producto_id)
            producto.activo = False
            uow.productos.update(producto)

    def _buscar(self, uow: ProductoUnitOfWork, producto_id: int) -> Producto:
        producto = uow.productos.get_by_id(producto_id)
        if producto is None or not producto.activo:
            raise ProductoNoEncontrado("Producto no encontrado")
        return producto

    def _validar_categoria(self, uow: ProductoUnitOfWork, categoria_id: int) -> None:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
