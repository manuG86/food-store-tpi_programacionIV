from tests.conftest import login


def test_catalogo_publico_y_escrituras_admin(client):
    categorias = "/api/v1/categorias"
    productos = "/api/v1/productos"
    assert client.get(productos).json() == {"total": 0, "items": []}
    assert client.post(categorias, json={"nombre": "Bebidas"}).status_code == 401

    login(client, "juan", "Juan1234!")
    assert client.post(categorias, json={"nombre": "Bebidas"}).status_code == 403
    assert client.post(productos, json={
        "categoria_id": 1, "nombre": "Agua", "precio_base": 2.5,
    }).status_code == 403

    login(client, "admin", "Admin1234!")
    categoria = client.post(categorias, json={"nombre": "Bebidas"}).json()
    datos = {"categoria_id": categoria["id"], "precio_base": 2.5, "stock": 3}
    agua = client.post(productos, json={**datos, "nombre": "Agua mineral"})
    assert agua.status_code == 201
    product_id = agua.json()["id"]
    ruta = f"{productos}/{product_id}"
    assert agua.json()["categoria"] == categoria
    assert client.post(productos, json={**datos, "nombre": "Agua con gas"}).status_code == 201

    cambio = client.put(ruta, json={"descripcion": "500 ml"})
    assert cambio.status_code == 200
    assert cambio.json()["stock"] == 3
    assert client.put(ruta, json={"stock": None}).status_code == 422
    assert client.patch(f"{ruta}/stock", json={"stock": -1, "disponible": True}).status_code == 422
    stock = client.patch(f"{ruta}/stock", json={"stock": 7, "disponible": False})
    assert stock.status_code == 200
    assert (stock.json()["stock"], stock.json()["disponible"]) == (7, False)

    client.cookies.clear()
    pagina = client.get(productos, params={"search": "AGUA", "limit": 1, "skip": 1}).json()
    assert pagina["total"] == 2 and len(pagina["items"]) == 1
    filtrado = client.get(productos, params={
        "categoria_id": categoria["id"], "disponible": False,
    }).json()
    assert [item["id"] for item in filtrado["items"]] == [product_id]
    assert client.get(ruta).status_code == 200

    login(client, "admin", "Admin1234!")
    baja = client.delete(ruta)
    assert baja.status_code == 204 and baja.content == b""
    assert client.get(ruta).status_code == 404
    assert client.get(productos).json()["total"] == 1


def test_baja_de_categoria_conserva_sus_productos_y_reserva_el_nombre(client):
    categorias = "/api/v1/categorias"
    productos = "/api/v1/productos"
    login(client, "admin", "Admin1234!")
    bebidas = client.post(categorias, json={"nombre": "Bebidas"})
    comidas = client.post(categorias, json={"nombre": "Comidas"})
    assert bebidas.status_code == comidas.status_code == 201

    bebidas_id = bebidas.json()["id"]
    comidas_id = comidas.json()["id"]
    datos_agua = {"categoria_id": bebidas_id, "nombre": "Agua", "precio_base": 2}
    agua = client.post(productos, json=datos_agua)
    ensalada = client.post(productos, json={
        "categoria_id": comidas_id, "nombre": "Ensalada", "precio_base": 4,
    })
    assert agua.status_code == ensalada.status_code == 201

    ruta_categoria = f"{categorias}/{bebidas_id}"
    baja = client.delete(ruta_categoria)
    assert baja.status_code == 204 and baja.content == b""
    assert client.get(ruta_categoria).status_code == 404
    assert client.put(ruta_categoria, json={"nombre": "Otra"}).status_code == 404
    assert client.delete(ruta_categoria).status_code == 404
    assert client.post(categorias, json={"nombre": "Bebidas"}).status_code == 409
    assert client.put(f"{categorias}/{comidas_id}", json={"nombre": "Bebidas"}).status_code == 409
    assert client.post(productos, json=datos_agua).status_code == 404
    assert client.put(f"{productos}/{ensalada.json()['id']}", json={"categoria_id": bebidas_id}).status_code == 404
    assert client.post(productos, json={**datos_agua, "categoria_id": 9999}).status_code == 404

    client.cookies.clear()
    assert {c["id"] for c in client.get(categorias).json()} == {comidas_id}
    detalle = client.get(f"{productos}/{agua.json()['id']}")
    assert detalle.status_code == 200
    assert detalle.json()["activo"] is True
    assert detalle.json()["categoria"]["activo"] is False
    listado = client.get(productos, params={"categoria_id": bebidas_id}).json()
    assert listado == {"total": 1, "items": [detalle.json()]}
