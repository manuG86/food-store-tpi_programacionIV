from app.core.uow import BaseUnitOfWork
from app.modules.categorias.repository import CategoriaRepository


class CategoriaUnitOfWork(BaseUnitOfWork):
    def __enter__(self):
        super().__enter__()
        self.categorias = CategoriaRepository(self.session)
        return self
