from tests.conftest import login


def test_api_pedidos_controla_acceso_y_calcula_resumen(client):
    pedidos = "/api/v1/pedidos"
    assert client.get(pedidos).status_code == 401

    login(client, "admin", "Admin1234!")
    categoria = client.post("/api/v1/categorias", json={"nombre": "Bebidas"}).json()
    producto = client.post("/api/v1/productos", json={
        "categoria_id": categoria["id"], "nombre": "Agua", "precio_base": 2.5, "stock": 10,
    }).json()
    datos = {
        "items": [{"producto_id": producto["id"], "cantidad": 2}],
        "forma_pago": "EFECTIVO", "direccion_entrega": "Calle 123",
    }
    assert client.get(f"{pedidos}/resumen").json()["ingresos_entregados"] == 0
    pedido_admin = client.post(pedidos, json=datos)
    assert pedido_admin.status_code == 201
    pedido_admin_path = f"{pedidos}/{pedido_admin.json()['id']}"

    login(client, "juan", "Juan1234!")
    pedido_cliente = client.post(pedidos, json=datos)
    assert pedido_cliente.status_code == 201
    pedido = pedido_cliente.json()
    ruta = f"{pedidos}/{pedido['id']}"
    assert client.get(pedidos).json() == {"total": 1, "items": [pedido]}
    assert client.get(pedidos, params={"propios": False}).json()["items"] == [pedido]
    assert client.get(ruta).json() == pedido
    assert client.get(pedido_admin_path).status_code == 403
    assert client.patch(f"{pedido_admin_path}/cancelar").status_code == 403
    assert client.get(f"{pedidos}/resumen").status_code == 403
    assert client.patch(f"{ruta}/estado", json={"estado": "EN_PREPARACION"}).status_code == 403
    respuesta = client.patch(f"{ruta}/cancelar")
    assert respuesta.status_code == 200 and respuesta.json()["estado"] == "CANCELADO"

    login(client, "admin", "Admin1234!")
    pagina = client.get(pedidos, params={"limit": 1}).json()
    assert pagina["total"] == 2 and len(pagina["items"]) == 1
    propios = client.get(pedidos, params={"propios": True}).json()
    assert propios == {"total": 1, "items": [pedido_admin.json()]}
    assert client.get(ruta).status_code == 200
    pendientes = client.get(pedidos, params={"estado": "PENDIENTE"}).json()
    assert pendientes["total"] == 1 and pendientes["items"] == [pedido_admin.json()]
    for estado in ("EN_PREPARACION", "ENTREGADO"):
        respuesta = client.patch(f"{pedido_admin_path}/estado", json={"estado": estado})
        assert respuesta.status_code == 200 and respuesta.json()["estado"] == estado
    assert client.get(f"{pedidos}/resumen").json() == {
        "pendientes": 0, "en_preparacion": 0, "entregados": 1,
        "cancelados": 1, "pedidos_hoy": 2, "ingresos_entregados": 5.0,
    }
