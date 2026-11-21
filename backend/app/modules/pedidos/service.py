from math import fsum

from app.modules.pedidos.models import DetallePedido, Pedido, ahora_utc
from app.modules.pedidos.schemas import EstadoPedido, PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork
from app.modules.productos.service import ProductoNoEncontrado
from app.modules.usuarios.schemas import UserPublic


class ProductoRepetido(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class TransicionInvalida(Exception):
    pass


TRANSICIONES: dict[str, set[str]] = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork):
        self.uow = uow

    def create(self, usuario_id: int, datos: PedidoCreate) -> PedidoRead:
        ids = {item.producto_id for item in datos.items}
        if len(ids) != len(datos.items):
            raise ProductoRepetido("El pedido contiene productos repetidos")

        with self.uow as uow:
            # Bloquear siempre por ID evita que dos compras tomen las mismas filas en orden inverso.
            productos = uow.productos.get_for_update(ids)
            detalles = []
            for item in datos.items:
                producto = productos.get(item.producto_id)
                if producto is None or not producto.activo:
                    raise ProductoNoEncontrado(f"Producto {item.producto_id} no encontrado")
                if not producto.disponible:
                    raise ProductoNoDisponible(f"Producto {item.producto_id} no disponible")
                if producto.stock < item.cantidad:
                    raise StockInsuficiente(f"Stock insuficiente para el producto {item.producto_id}")

                producto.stock -= item.cantidad
                detalles.append(DetallePedido(
                    producto_id=item.producto_id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=producto.precio_base * item.cantidad,
                ))

            pedido = Pedido(
                usuario_id=usuario_id,
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
                total=fsum(detalle.subtotal for detalle in detalles),
                items=detalles,
            )
            return PedidoRead.model_validate(uow.pedidos.add(pedido))

    def list_all(
        self, usuario: UserPublic, *, skip: int, limit: int, estado: EstadoPedido | None,
        propios: bool = False,
    ) -> PedidosPaginados:
        with self.uow as uow:
            usuario_id = usuario.id if propios or usuario.role != "admin" else None
            total, pedidos = uow.pedidos.list_filtered(
                usuario_id=usuario_id, estado=estado, skip=skip, limit=limit,
            )
            return PedidosPaginados(
                total=total, items=[PedidoRead.model_validate(pedido) for pedido in pedidos],
            )

    def get_by_id(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)
            if pedido is None:
                raise PedidoNoEncontrado("Pedido no encontrado")
            if usuario.role != "admin" and pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No podés consultar un pedido ajeno")
            return PedidoRead.model_validate(pedido)

    def summary(self) -> ResumenPedidos:
        with self.uow as uow:
            inicio_dia = ahora_utc().replace(hour=0, minute=0, second=0, microsecond=0)
            return ResumenPedidos.model_validate(uow.pedidos.summary(inicio_dia))

    def change_status(self, pedido_id: int, estado: EstadoPedido) -> PedidoRead:
        """Aplica una transición administrativa. La ruta debe requerir el rol admin."""
        with self.uow as uow:
            pedido = self._buscar_para_cambio(uow, pedido_id)
            if estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida(f"No se puede pasar de {pedido.estado} a {estado}")
            return self._aplicar_estado(uow, pedido, estado)

    def cancel(self, pedido_id: int, usuario: UserPublic) -> PedidoRead:
        with self.uow as uow:
            pedido = self._buscar_para_cambio(uow, pedido_id)
            if pedido.usuario_id != usuario.id:
                raise PedidoAjeno("No podés cancelar un pedido ajeno")
            if pedido.estado != "PENDIENTE":
                raise TransicionInvalida("Solo se puede cancelar un pedido propio pendiente")
            return self._aplicar_estado(uow, pedido, "CANCELADO")

    def _buscar_para_cambio(self, uow: PedidoUnitOfWork, pedido_id: int) -> Pedido:
        pedido = uow.pedidos.get_for_update(pedido_id)
        if pedido is None:
            raise PedidoNoEncontrado("Pedido no encontrado")
        return pedido

    def _aplicar_estado(
        self, uow: PedidoUnitOfWork, pedido: Pedido, estado: EstadoPedido,
    ) -> PedidoRead:
        if estado == "CANCELADO":
            productos = uow.productos.get_for_update({item.producto_id for item in pedido.items})
            for item in pedido.items:
                productos[item.producto_id].stock += item.cantidad

        pedido.estado = estado
        pedido.updated_at = ahora_utc()
        return PedidoRead.model_validate(uow.pedidos.update(pedido))
