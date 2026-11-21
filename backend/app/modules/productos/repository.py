from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.productos.model import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(Producto, session)

    def get_for_update(self, ids: set[int]) -> dict[int, Producto]:
        consulta = (
            select(Producto).where(Producto.id.in_(ids)).order_by(Producto.id)
            .with_for_update()
        )
        return {producto.id: producto for producto in self.session.exec(consulta) if producto.id is not None}

    def search(
        self,
        *,
        skip: int,
        limit: int,
        search: str | None,
        categoria_id: int | None,
        disponible: bool | None,
    ) -> tuple[int, list[Producto]]:
        filtros = [Producto.activo.is_(True)]
        if search:
            filtros.append(func.lower(Producto.nombre).contains(search.lower(), autoescape=True))
        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            filtros.append(Producto.disponible == disponible)

        total = self.session.exec(select(func.count()).select_from(Producto).where(*filtros)).one()
        consulta = (
            select(Producto)
            .where(*filtros)
            .options(selectinload(Producto.categoria))
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(consulta).all())
