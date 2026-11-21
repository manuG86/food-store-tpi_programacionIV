"""Pruebas de autenticación (cookie HttpOnly) y autorización por rol (require_role)."""
from tests.conftest import login


def test_login_correcto_entrega_cookie_httponly(client):
    r = login(client, "juan", "Juan1234!")
    assert r.status_code == 200
    assert "access_token" in r.cookies
    assert "httponly" in r.headers["set-cookie"].lower()
    assert "access_token" not in r.json()        # el token no viaja en el cuerpo


def test_login_con_contrasena_incorrecta_da_401(client):
    r = login(client, "juan", "otra-clave")
    assert r.status_code == 401
    assert r.json()["detail"] == "Credenciales incorrectas"


def test_me_sin_cookie_da_401(client):
    assert client.get("/api/v1/auth/me").status_code == 401


def test_me_con_cookie_devuelve_el_usuario_sin_contrasena(client):
    login(client, "juan", "Juan1234!")
    r = client.get("/api/v1/auth/me")
    assert r.status_code == 200
    assert r.json()["role"] == "user"
    assert "hashed_password" not in r.json()     # response_model=UserPublic


def test_encabezado_authorization_no_se_acepta(client):
    token = login(client, "juan", "Juan1234!").cookies["access_token"]
    client.cookies.clear()
    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 401                  # solo se lee la cookie


def test_usuario_comun_en_ruta_de_admin_da_403(client):
    login(client, "juan", "Juan1234!")
    assert client.get("/api/v1/admin/usuarios").status_code == 403


def test_admin_en_ruta_de_admin_da_200(client):
    login(client, "admin", "Admin1234!")
    r = client.get("/api/v1/admin/usuarios")
    assert r.status_code == 200
    assert {u["username"] for u in r.json()} == {"admin", "juan"}


def test_logout_borra_la_cookie(client):
    login(client, "juan", "Juan1234!")
    client.post("/api/v1/auth/logout")
    assert client.get("/api/v1/auth/me").status_code == 401


def test_admin_desactiva_usuario_y_este_queda_bloqueado(client):
    login(client, "admin", "Admin1234!")
    usuarios = {u["username"]: u["id"] for u in client.get("/api/v1/admin/usuarios").json()}
    r = client.post(f"/api/v1/admin/usuarios/{usuarios['juan']}/desactivar")
    assert r.status_code == 200
    assert r.json()["disabled"] is True

    client.cookies.clear()
    assert login(client, "juan", "Juan1234!").status_code == 400   # cuenta desactivada


def test_admin_no_puede_desactivarse_a_si_mismo(client):
    login(client, "admin", "Admin1234!")
    perfil = client.get("/api/v1/auth/me").json()
    respuesta = client.post(f"/api/v1/admin/usuarios/{perfil['id']}/desactivar")

    assert respuesta.status_code == 400
    assert client.get("/api/v1/auth/me").json()["disabled"] is False


def test_cambio_de_estado_de_usuario_es_idempotente(client):
    login(client, "admin", "Admin1234!")
    usuarios = client.get("/api/v1/admin/usuarios").json()
    usuario_id = next(usuario["id"] for usuario in usuarios if usuario["username"] == "juan")

    for accion, disabled in (("desactivar", True), ("activar", False)):
        ruta = f"/api/v1/admin/usuarios/{usuario_id}/{accion}"
        for _ in range(2):
            respuesta = client.post(ruta)
            assert respuesta.status_code == 200
            assert respuesta.json()["disabled"] is disabled

    assert client.post("/api/v1/admin/usuarios/9999/activar").status_code == 404
    assert client.post("/api/v1/admin/usuarios/9999/desactivar").status_code == 404
