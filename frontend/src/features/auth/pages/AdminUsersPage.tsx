import { EstadoError } from '@/shared/components/Estados'
import { useAuthStore } from '@/features/auth/store/authStore'
import { UsuariosTable } from '@/features/auth/components/UsuariosTable'
import { useAdminUsers } from '@/features/auth/hooks/useAdminUsers'

function AdminUsersPage() {
  const usuarioActualId = useAuthStore(({ user }) => user?.id)
  const { usuariosQuery, estadoMutation } = useAdminUsers()

  if (usuariosQuery.isLoading) return <p>Cargando usuarios...</p>
  if (usuariosQuery.isError) return <EstadoError mensaje={usuariosQuery.error.message} />

  return (
    <section>
      <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Administración de usuarios</h1>
      {estadoMutation.isError && <EstadoError mensaje={estadoMutation.error.message} />}
      <UsuariosTable
        usuarioActualId={usuarioActualId}
        usuarios={usuariosQuery.data ?? []}
        cambiandoEstado={estadoMutation.isPending}
        onCambiarEstado={(id, activar) => estadoMutation.mutate({ id, activar })}
      />
    </section>
  )
}

export default AdminUsersPage
