from sqlmodel import Session

from app.core.database import engine
from app.modules.usuarios.repository import UsuarioRepository


class BaseUnitOfWork:
    """Controla el ciclo de vida de una sesión y su transacción."""

    def __enter__(self):
        self.session = Session(engine, expire_on_commit=False)
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        try:
            if exc_type is not None:
                self.session.rollback()
            else:
                try:
                    self.session.commit()
                except Exception:
                    self.session.rollback()
                    raise
        finally:
            self.session.close()


class UnitOfWork(BaseUnitOfWork):
    """Unit of Work de autenticación y usuarios."""

    def __enter__(self):
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        return self


def get_uow() -> UnitOfWork:
    """Dependencia FastAPI: provee un UnitOfWork por request."""
    return UnitOfWork()
