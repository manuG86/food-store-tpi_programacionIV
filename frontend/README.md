# Food Store · Trabajo práctico 10

Frontend en React y TypeScript para el catálogo de Food Store. Reutiliza la API del TP9 con FastAPI, PostgreSQL y autenticación por cookie HttpOnly.

## Puesta en marcha

1. Levantá el backend del TP9 y cargá los roles y el administrador con `seed.py`, según sus instrucciones. La API debe estar disponible en el puerto 8000.
2. Desde esta carpeta, instalá las dependencias y levantá Vite.

   ```sh
   pnpm install --frozen-lockfile
   pnpm dev
   ```

3. Abrí `http://localhost:5173`. Usá el mismo hostname para el frontend y la API. Si la API corre en otra dirección, copiá `.env.example` a `.env.local`, definí `VITE_API_URL` con el prefijo `/api/v1` (por ejemplo, `http://localhost:8000/api/v1`) y configurá `FRONTEND_ORIGIN` en el backend para permitir el origen del frontend.

## Estructura

```text
src/
├── features/
│   ├── auth/          # Sesión, registro y administración de usuarios
│   ├── categories/    # Listado, filtro, paginación y CRUD de categorías
│   ├── products/      # CRUD de productos y sus ingredientes
│   └── ingredients/   # CRUD de ingredientes
├── shared/
│   ├── api/           # Axios con credenciales, interceptor y manejo de errores
│   └── components/    # Navbar, Toast, estados del catálogo y acceso denegado
├── store/             # Tema persistente y notificaciones globales
├── routes/            # AppRouter y ProtectedRoute
├── App.tsx            # Verifica la sesión al iniciar y monta el router y el Toast
└── main.tsx           # Providers, interceptor y aplicación del tema
```

Cada feature agrupa sus páginas, componentes, tipos, clientes de API y hooks. Las demás features la consumen mediante las exportaciones nombradas de su `index.ts`. El alias `@/` apunta a `src/` en TypeScript y Vite. Los hooks del catálogo encapsulan las consultas, mutaciones y la actualización de caché con TanStack Query.

## Rutas y permisos

| Acceso | Rutas |
| --- | --- |
| Público | `/login`, `/register`, `/unauthorized` |
| Sesión válida | `/categories`, `/products`, `/ingredientes` |
| Rol `admin` | `/admin/users` |

Al iniciar, el frontend consulta `GET /api/v1/auth/me`. Durante esa consulta, `ProtectedRoute` muestra un indicador de carga. Sin sesión, redirige al login. Si falta el rol, redirige a `/unauthorized`. El backend aplica los permisos de escritura del catálogo y de administración.

El interceptor limpia la sesión al recibir un `401`, con excepción de `/auth/token` y `/auth/me`, que manejan sus propias respuestas. Un `403` muestra «Acceso denegado» y conserva la sesión. El tema se guarda en el navegador con la clave `theme-storage`. Las notificaciones se ocultan después de tres segundos.

## Verificación

```sh
pnpm lint
pnpm build
```

- Sin iniciar sesión, abrí `/categories` y comprobá que te lleva a `/login`.
- Con una cuenta registrada, navegá por el catálogo e ingresá directamente a `/admin/users` para comprobar que se muestra la página de acceso denegado.
- Con la cuenta administradora, creá, editá y eliminá un elemento del catálogo. Verificá que aparezcan los avisos de cada operación.
- Cambiá el tema desde la barra de navegación y recargá la página. Comprobá que se recuperen la sesión y el tema.
