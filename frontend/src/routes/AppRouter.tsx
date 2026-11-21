import { Navigate, Route, Routes } from 'react-router-dom'

import { AdminUsersPage, LoginPage, RegisterPage } from '@/features/auth'
import { CategoriasPage } from '@/features/categories'
import AdminPedidosPage from '@/features/pedidos/pages/AdminPedidosPage'
import AdminResumenPage from '@/features/pedidos/pages/AdminResumenPage'
import CarritoPage from '@/features/pedidos/pages/CarritoPage'
import CheckoutPage from '@/features/pedidos/pages/CheckoutPage'
import MisPedidosPage from '@/features/pedidos/pages/MisPedidosPage'
import { ProductsPage } from '@/features/products'
import CatalogoPage from '@/features/products/pages/CatalogoPage'
import Navbar from '@/shared/components/Navbar'
import UnauthorizedPage from '@/shared/components/UnauthorizedPage'
import ProtectedRoute from './ProtectedRoute'

export default function AppRouter() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl p-4 sm:p-8">
        <Routes>
          <Route path="/" element={<CatalogoPage />} />
          <Route path="/carrito" element={<CarritoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/mis-pedidos" element={<MisPedidosPage />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin/categorias" element={<CategoriasPage />} />
            <Route path="/admin/productos" element={<ProductsPage />} />
            <Route path="/admin/usuarios" element={<AdminUsersPage />} />
            <Route path="/admin/users" element={<Navigate to="/admin/usuarios" replace />} />
            <Route path="/admin/pedidos" element={<AdminPedidosPage />} />
            <Route path="/admin/resumen" element={<AdminResumenPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  )
}
