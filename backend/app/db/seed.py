"""Carga usuarios y catálogo de demostración con python -m app.db.seed."""

from sqlmodel import Session, select

from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.categorias.model import Categoria
from app.modules.productos.model import Producto
from app.modules.usuarios.model import Usuario


USUARIOS_INICIALES = [
    {
        "username":  "admin",
        "full_name": "Administrador del Sistema",
        "email":     "admin@example.com",
        "password":  "Admin1234!",
        "role":      "admin",
    },
    {
        "username":  "juan",
        "full_name": "Juan Pérez",
        "email":     "juan@example.com",
        "password":  "Juan1234!",
        "role":      "user",
    },
]


CATALOGO_INICIAL = {
    "Platos principales": (
        ("Hamburguesa clásica", 8.50, 20),
        ("Milanesa con papas", 10.50, 15),
        ("Ensalada de la casa", 7.00, 12),
    ),
    "Bebidas": (
        ("Agua mineral", 1.50, 30),
        ("Limonada casera", 3.00, 24),
        ("Jugo de naranja", 3.50, 18),
    ),
    "Postres": (
        ("Flan casero", 3.75, 12),
        ("Brownie de chocolate", 4.25, 16),
    ),
}


def run() -> None:
    create_all_tables()

    with Session(engine) as session, session.begin():
        for datos in USUARIOS_INICIALES:
            usuario = session.exec(
                select(Usuario).where(Usuario.username == datos["username"])
            ).first()
            if usuario is None:
                session.add(Usuario(
                    username=datos["username"],
                    full_name=datos["full_name"],
                    email=datos["email"],
                    hashed_password=hash_password(datos["password"]),
                    role=datos["role"],
                ))

        for categoria_nombre, productos in CATALOGO_INICIAL.items():
            categoria = session.exec(
                select(Categoria).where(Categoria.nombre == categoria_nombre)
            ).one_or_none()
            if categoria is None:
                categoria = Categoria(nombre=categoria_nombre)
                session.add(categoria)
                session.flush()

            for nombre, precio, stock in productos:
                existe = session.exec(
                    select(Producto.id).where(
                        Producto.categoria_id == categoria.id, Producto.nombre == nombre,
                    ).limit(1)
                ).first()
                if existe is None:
                    session.add(Producto(
                        categoria=categoria, nombre=nombre, precio_base=precio, stock=stock,
                    ))

    print("Seed de Food Store completado.")


if __name__ == "__main__":
    run()
