# Zona Lab · Frontend

Cliente web de Zona Lab: catálogo, configurador de pedidos y panel administrativo. React 19 + Vite 8 en JavaScript.

Este repositorio contiene únicamente el frontend. La API vive en un repositorio y despliegue independiente.

## Requisitos

- Node.js 24 (ver `.nvmrc`).
- npm 10 o superior.
- Backend de Zona Lab disponible para desarrollo local.

## Instalación

```bash
npm install
cp .env.example .env
```

En PowerShell/Windows:

```powershell
Copy-Item .env.example .env
```

## Variables de entorno

```dotenv
VITE_API_BASE_URL=/api
VITE_MEDIA_BASE_URL=
DEV_API_TARGET=http://localhost:5050
```

| Variable              | Uso                                                              |
| --------------------- | ---------------------------------------------------------------- |
| `VITE_API_BASE_URL`   | Base de las llamadas HTTP. En desarrollo, `/api` usa el proxy.   |
| `VITE_MEDIA_BASE_URL` | Origen opcional para imágenes `/uploads/media` en otro dominio.  |
| `DEV_API_TARGET`      | Destino de los proxies `/api` y `/uploads` del servidor de Vite. |

No incluir secretos en variables `VITE_*`: se publican en el bundle.

### Desarrollo con API local

Mantener `VITE_API_BASE_URL=/api` y `DEV_API_TARGET=http://localhost:5050`. Vite redirige `/api` y `/uploads` al backend.

### Producción con API en otro dominio

Crear `.env.production` a partir de `.env.production.example`:

```dotenv
VITE_API_BASE_URL=https://api.example.com/api
VITE_MEDIA_BASE_URL=https://api.example.com
```

Si `VITE_MEDIA_BASE_URL` queda vacío, las imágenes se resuelven usando el origen de `VITE_API_BASE_URL`.

El backend debe incluir el dominio exacto del frontend en `CORS_ORIGINS`.

## Scripts

| Comando                | Descripción                               |
| ---------------------- | ----------------------------------------- |
| `npm run dev`          | Servidor de desarrollo en el puerto 8080. |
| `npm run build`        | Build de producción en `dist/`.           |
| `npm run preview`      | Sirve el build local en el puerto 8080.   |
| `npm test`             | Pruebas con Vitest.                       |
| `npm run test:watch`   | Pruebas en modo watch.                    |
| `npm run lint`         | ESLint.                                   |
| `npm run format`       | Formatea con Prettier.                    |
| `npm run format:check` | Verifica formato.                         |
| `npm run verify`       | Lint, pruebas y build.                    |

## Despliegue

1. Configurar las variables `VITE_*` del entorno de build.
2. Ejecutar `npm ci && npm run build`.
3. Publicar `dist/` en el hosting estático.
4. Configurar fallback SPA: todas las rutas deben devolver `index.html`.
5. Verificar que el backend permita el origen del frontend y que las cookies del panel funcionen entre dominios.

El panel está en `/admin`. El frontend no contiene credenciales administrativas.

## Estructura

```text
src/
├── app/                 # router y composición
├── modules/
│   ├── admin/           # login, productos, pedidos y configuración
│   ├── catalog/         # catálogo y detalle
│   ├── home/
│   ├── quotes/          # configurador de pedidos
│   ├── site-settings/
│   └── system-status/
├── shared/              # API, componentes y utilidades
└── test/
```

## Calidad

El workflow de `.github/workflows/ci.yml` ejecuta instalación, lint, formato, pruebas y build.
