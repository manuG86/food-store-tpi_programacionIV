"""Pruebas del CRUD de categorías."""
from tests.conftest import login


def test_listar_categorias_sin_sesion_da_200(client):
    assert client.get("/api/v1/categorias").status_code == 200


def test_crear_listar_editar_y_borrar_categoria(client):
    login(client, "admin", "Admin1234!")
    r = client.post("/api/v1/categorias", json={"nombre": "Bebidas", "descripcion": "Frías"})
    assert r.status_code == 201
    cat_id = r.json()["id"]

    r = client.get("/api/v1/categorias")
    assert r.status_code == 200
    assert [c["nombre"] for c in r.json()] == ["Bebidas"]

    r = client.put(f"/api/v1/categorias/{cat_id}", json={"descripcion": "Con y sin alcohol"})
    assert r.status_code == 200
    assert r.json()["descripcion"] == "Con y sin alcohol"

    assert client.delete(f"/api/v1/categorias/{cat_id}").status_code == 204
    assert client.get(f"/api/v1/categorias/{cat_id}").status_code == 404
