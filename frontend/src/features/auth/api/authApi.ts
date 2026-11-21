import { api } from '@/shared/api/api'
import { obtenerMensajeError } from '@/shared/api/errores'
import type {
  RegistroUsuario,
  UsuarioAuth,
} from '@/features/auth/types/auth.types'


export async function iniciarSesion(
  username: string,
  password: string,
): Promise<void> {
  const form = new URLSearchParams({ username, password })
  try {
    await api.post('/auth/token', form, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudo iniciar sesión'), { cause: error })
  }
}


export async function obtenerSesion(): Promise<UsuarioAuth> {
  try {
    const response = await api.get<UsuarioAuth>('/auth/me')
    return response.data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No hay una sesión válida'), { cause: error })
  }
}


export async function cerrarSesion(): Promise<void> {
  await api.post('/auth/logout')
}


export async function registrarUsuario(
  datos: RegistroUsuario,
): Promise<UsuarioAuth> {
  try {
    const response = await api.post<UsuarioAuth>('/auth/register', datos)
    return response.data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudo registrar el usuario'), { cause: error })
  }
}


export async function obtenerUsuariosAdmin(): Promise<UsuarioAuth[]> {
  try {
    return (await api.get<UsuarioAuth[]>('/admin/usuarios')).data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudieron cargar los usuarios'), { cause: error })
  }
}


export async function cambiarEstadoUsuario(
  usuarioId: number,
  activar: boolean,
): Promise<UsuarioAuth> {
  const accion = activar ? 'activar' : 'desactivar'
  try {
    return (await api.post<UsuarioAuth>(`/admin/usuarios/${usuarioId}/${accion}`)).data
  } catch (error) {
    throw new Error(await obtenerMensajeError(error, 'No se pudo actualizar la cuenta'), { cause: error })
  }
}
