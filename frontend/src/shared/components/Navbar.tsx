import { NavLink, useNavigate } from 'react-router-dom'

import { useAuth } from '@/features/auth'
import { notificarError } from '@/shared/api/errores'
import { useCartStore } from '@/store/cartStore'
import { useThemeStore } from '@/store/themeStore'

function Navbar() {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const darkMode = useThemeStore((state) => state.darkMode)
  const toggleTheme = useThemeStore((state) => state.toggleTheme)
  const cantidadCarrito = useCartStore((state) => state.items.reduce((total, item) => total + item.cantidad, 0))
  const esAdmin = user?.role === 'admin'

  const linkClasses = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? 'font-semibold text-emerald-300'
      : 'text-white hover:text-emerald-200'

  async function cerrarSesion() {
    try {
      await logout()
      navigate('/login', { replace: true })
    } catch (error) {
      notificarError(error)
    }
  }

  return (
    <nav className="bg-emerald-700 px-4 py-4 text-white sm:px-8 dark:bg-emerald-900">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-3">
        <NavLink to="/" className="mr-auto text-xl font-bold text-white">
          Food Store
        </NavLink>

        <NavLink to="/" end className={linkClasses}>Catálogo</NavLink>
        <NavLink to="/carrito" className={linkClasses}>Carrito ({cantidadCarrito})</NavLink>
        {!user && <NavLink to="/login" className={linkClasses}>Iniciar sesión</NavLink>}

        {user && (
          <>
            <NavLink to="/mis-pedidos" className={linkClasses}>Mis pedidos</NavLink>
            {esAdmin && (
              <>
                <NavLink to="/admin/categorias" className={linkClasses}>Categorías</NavLink>
                <NavLink to="/admin/productos" className={linkClasses}>Productos</NavLink>
                <NavLink to="/admin/pedidos" className={linkClasses}>Pedidos</NavLink>
                <NavLink to="/admin/resumen" className={linkClasses}>Resumen</NavLink>
                <NavLink to="/admin/usuarios" className={linkClasses}>Usuarios</NavLink>
              </>
            )}

            <span className="border-l border-emerald-500 pl-4 text-sm">
              {user.full_name} · {user.role}
            </span>

            <button
              type="button"
              onClick={() => void cerrarSesion()}
              className="rounded-lg bg-emerald-950 px-3 py-2 text-sm hover:bg-emerald-950/80"
            >
              Cerrar sesión
            </button>
          </>
        )}

        <button
          type="button"
          aria-label="Modo oscuro"
          aria-pressed={darkMode}
          onClick={toggleTheme}
          className="rounded-lg border border-emerald-200 px-3 py-2 text-sm hover:bg-emerald-800"
        >
          {darkMode ? 'Modo claro' : 'Modo oscuro'}
        </button>
      </div>
    </nav>
  )
}

export default Navbar
