from app.modules.categorias.model import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaPublic, CategoriaUpdate
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork):
        self.uow = uow

    def list_all(self) -> list[CategoriaPublic]:
        with self.uow as uow:
            return [CategoriaPublic.model_validate(categoria) for categoria in uow.categorias.get_active()]

    def get_by_id(self, categoria_id: int) -> CategoriaPublic:
        with self.uow as uow:
            return CategoriaPublic.model_validate(self._buscar(uow, categoria_id))

    def create(self, cat_in: CategoriaCreate) -> CategoriaPublic:
        with self.uow as uow:
            if uow.categorias.get_by_nombre(cat_in.nombre):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            categoria = uow.categorias.add(Categoria.model_validate(cat_in))
            return CategoriaPublic.model_validate(categoria)

    def update(self, categoria_id: int, cat_in: CategoriaUpdate) -> CategoriaPublic:
        with self.uow as uow:
            categoria = self._buscar(uow, categoria_id)
            datos = cat_in.model_dump(exclude_unset=True)
            if "nombre" in datos and uow.categorias.exists_nombre_excluding(datos["nombre"], categoria_id):
                raise NombreDuplicado("Ya existe una categoría con ese nombre")
            for campo, valor in datos.items():
                setattr(categoria, campo, valor)
            return CategoriaPublic.model_validate(uow.categorias.update(categoria))

    def delete(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = self._buscar(uow, categoria_id)
            categoria.activo = False
            uow.categorias.update(categoria)

    def _buscar(self, uow: CategoriaUnitOfWork, categoria_id: int) -> Categoria:
        categoria = uow.categorias.get_by_id(categoria_id)
        if categoria is None or not categoria.activo:
            raise CategoriaNoEncontrada("Categoría no encontrada")
        return categoria
