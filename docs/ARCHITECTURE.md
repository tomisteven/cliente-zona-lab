# Arquitectura del frontend

## Objetivo

Cliente React de Zona Lab para catálogo, configuración de pedidos y administración. Consume una API externa y no contiene reglas de negocio autoritativas.

## Límites

- Este repositorio no incluye backend, MongoDB ni lógica de precios.
- El frontend puede estimar visualmente, pero el precio mostrado siempre proviene del servidor.
- La autorización real ocurre en la API.
- Los secretos nunca forman parte del bundle.

## Estructura

```text
src/
├── app/
│   ├── App.jsx
│   ├── AppErrorBoundary.jsx
│   ├── PublicLayout.jsx
│   └── NotFoundPage.jsx
├── modules/
│   ├── admin/
│   ├── catalog/
│   ├── contact/
│   ├── faq/
│   ├── home/
│   ├── legal/
│   ├── reviews/
│   ├── quotes/
│   ├── site-settings/
│   └── system-status/
├── shared/
│   ├── analytics/
│   ├── api/
│   ├── components/
│   ├── consent/
│   ├── hooks/
│   ├── marketing/
│   ├── seo/
│   └── utils/
├── test/
├── index.css
└── main.jsx
scripts/
└── generate-seo.js
public/
├── favicon.svg
├── og-default.jpg
├── robots.txt
└── site.webmanifest
```

## Módulos

| Módulo          | Responsabilidad                                                                                            |
| --------------- | ---------------------------------------------------------------------------------------------------------- |
| `admin`         | Login, sesión, productos, pedidos, seguimiento, biblioteca de medios, configuración SMTP y layout privado. |
| `catalog`       | Listado, filtros, tarjetas y detalle público.                                                              |
| `home`          | Landing y bloques comerciales.                                                                             |
| `legal`         | Privacidad, términos y política de cookies.                                                                |
| `contact`       | Formulario público de consultas.                                                                           |
| `faq`           | Preguntas frecuentes y schema FAQPage.                                                                     |
| `reviews`       | Reseñas públicas y cliente API de moderación.                                                              |
| `quotes`        | Wizard de cuatro pasos, estimación, archivos y envío.                                                      |
| `site-settings` | Configuración pública y contexto global.                                                                   |
| `system-status` | Diagnóstico de conexión con la API.                                                                        |

## Rutas

| Ruta                     | Propósito                            |
| ------------------------ | ------------------------------------ |
| `/`                      | Inicio.                              |
| `/catalogo`              | Catálogo con filtros y búsqueda.     |
| `/catalogo/:categoria`   | Landing SEO por categoría.           |
| `/productos/:slug`       | Detalle de producto.                 |
| `/personalizar`          | Wizard sin producto preseleccionado. |
| `/personalizar/:slug`    | Wizard con producto preseleccionado. |
| `/contacto`              | Formulario de consulta.              |
| `/preguntas-frecuentes`  | FAQ público con schema FAQPage.      |
| `/estado`                | Diagnóstico de conexión con la API.  |
| `/privacidad`            | Política de privacidad.              |
| `/terminos`              | Términos y condiciones.              |
| `/cookies`               | Política de cookies.                 |
| `/admin/login`           | Acceso administrativo.               |
| `/admin/resumen`         | Dashboard administrativo.            |
| `/admin/productos`       | Listado administrativo.              |
| `/admin/productos/nuevo` | Alta de producto.                    |
| `/admin/productos/:id`   | Edición de producto.                 |
| `/admin/pedidos`         | Pedidos y descargas.                 |
| `/admin/resenas`         | Moderación de reseñas.               |
| `/admin/biblioteca`      | Biblioteca de imágenes y variantes.  |
| `/admin/actividad`       | Auditoría administrativa.            |
| `/admin/configuracion`   | Portada, WhatsApp y SMTP.            |

## Flujo de datos

```text
Página/componente
  → módulo/*.api.js
  → shared/api/http-client.js
  → API externa
```

- `request` centraliza headers, JSON, credenciales y errores.
- `adminRequest` agrega `x-csrf-token` desde la cookie `zl_admin_csrf`.
- Los componentes no llaman `fetch` directamente.
- Las respuestas exitosas se adaptan a estado local del componente.
- Los errores usan `ApiError` con `status`, `code` y `details`.

## Sesión administrativa

- El backend establece cookies HttpOnly y CSRF.
- El frontend no guarda tokens en `localStorage`.
- `credentials: 'include'` permite enviar cookies.
- Un `401` en una ruta admin dispara `admin:unauthorized`.
- El contexto de autenticación consulta `/api/admin/auth/session`.
- Las mutaciones admin requieren el token CSRF.

## Imágenes y media

- El backend devuelve rutas relativas como `/uploads/media/archivo.webp`.
- `resolveMediaUrl` las resuelve contra `VITE_MEDIA_BASE_URL` o contra el origen de `VITE_API_BASE_URL`.
- Cada producto tiene una portada (`imageUrl`) y una galería (`images`, hasta 10). El detalle muestra la galería con miniaturas.
- En desarrollo, Vite redirige `/uploads` al backend.
- En producción con dominios separados, configurar `VITE_MEDIA_BASE_URL` o una API absoluta.

## Estado

- Estado local por página/componente.
- Sin Redux, Zustand ni estado global externo.
- El wizard mantiene su estado en memoria.
- La configuración pública se comparte mediante contexto.
- La sesión admin se comparte mediante contexto.

## Estados de UI

Cada vista con datos remotos debe manejar:

- carga;
- éxito;
- vacío;
- error con reintento;
- validación de formulario;
- envío en curso y doble submit.

## Rendimiento

- Imágenes con `loading="lazy"` y dimensiones estables.
- Evitar renderizados innecesarios y dependencias pesadas.
- Paginación en listados.
- El panel administrativo se carga con `React.lazy` y `Suspense`, fuera del bundle inicial del sitio público.
- Medir antes de optimizar.

## Accesibilidad

- HTML semántico.
- Labels asociados a controles.
- Navegación por teclado y foco visible.
- Mensajes de error anunciables.
- Contraste suficiente.
- No depender solo del color.
- Filtros y cantidades expresan su estado con `aria-pressed`.

## Privacidad, consentimiento y analítica

- `shared/consent` administra el banner y la decisión persistida en `localStorage`.
- `shared/analytics` carga GA4/GTM/Meta Pixel solo si la categoría correspondiente fue aceptada.
- `shared/marketing` captura UTM y los envía con el pedido.
- `legal` publica privacidad, términos y cookies; el contenido debe revisarse legalmente.
- Ver [LEGAL](LEGAL.md).

## SEO

- `usePageMeta` actualiza título, descripción, canonical, robots, Open Graph, Twitter Card y JSON-LD por ruta.
- `shared/seo/urls.js` resuelve URLs absolutas para canonical, imágenes y datos estructurados.
- `shared/seo/resource-hints.js` agrega `preconnect`/`dns-prefetch` al origen de API/media.
- `scripts/generate-seo.js` prerenderiza rutas y genera `sitemap.xml` y `robots.txt` después del build.
- El panel, login, diagnóstico y 404 se marcan como `noindex`.
- La imagen principal de producto se carga con prioridad alta para mejorar LCP.
- Ver [SEO](SEO.md).

## Testing

- Vitest + jsdom + Testing Library.
- Pruebas de comportamiento visible.
- Mocks de API para aislar el frontend.
- Cobertura de flujos críticos y estados de error.
- SEO: URLs, canonical, metadatos, JSON-LD y limpieza al desmontar.
- Ver `docs/TESTING.md`.

## Despliegue

- Build estático en `dist/`.
- Fallback SPA obligatorio.
- Variables `VITE_*` inyectadas en build.
- CORS y cookies coordinados con el backend.
- Ver `docs/DEPLOYMENT.md`.

## Límites conocidos

- Sin SSR; las rutas públicas se prerenderizan en `build:seo`.
- Sin E2E automatizado.
- Sin caché de datos persistente.
- Sin i18n.
- Sin roles múltiples.
