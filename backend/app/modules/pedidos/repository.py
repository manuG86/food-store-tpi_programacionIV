from datetime import datetime, timedelta

from sqlalchemy.orm import selectinload
from sqlmodel import Session, func, select

from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(Pedido, session)

    def get_for_update(self, pedido_id: int) -> Pedido | None:
        consulta = select(Pedido).where(Pedido.id == pedido_id).with_for_update()
        return self.session.exec(consulta).one_or_none()

    def list_filtered(
        self, *, usuario_id: int | None, estado: str | None, skip: int, limit: int,
    ) -> tuple[int, list[Pedido]]:
        filtros = []
        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(select(func.count()).select_from(Pedido).where(*filtros)).one()
        consulta = (
            select(Pedido)
            .where(*filtros)
            .options(selectinload(Pedido.items))
            .order_by(Pedido.created_at.desc(), Pedido.id.desc())
            .offset(skip)
            .limit(limit)
        )
        return total, list(self.session.exec(consulta).all())

    def summary(self, inicio_dia: datetime):
        entregado = Pedido.estado == "ENTREGADO"
        consulta = select(
            func.count().filter(Pedido.estado == "PENDIENTE").label("pendientes"),
            func.count().filter(Pedido.estado == "EN_PREPARACION").label("en_preparacion"),
            func.count().filter(entregado).label("entregados"),
            func.count().filter(Pedido.estado == "CANCELADO").label("cancelados"),
            func.count().filter(
                Pedido.created_at >= inicio_dia,
                Pedido.created_at < inicio_dia + timedelta(days=1),
            ).label("pedidos_hoy"),
            func.coalesce(func.sum(Pedido.total).filter(entregado), 0).label("ingresos_entregados"),
        )
        return self.session.exec(consulta).one()
