# AGENTS.md — Zona Lab Frontend

## Contexto del repositorio

Este repositorio contiene únicamente el frontend de Zona Lab: sitio público, catálogo, configurador de pedidos y panel administrativo. La API vive en otro repositorio y se despliega por separado.

Stack: React 19, Vite 8, React Router 7, JavaScript, CSS propio, Vitest y Testing Library.

No reintroducir el monorepo ni npm workspaces. Este proyecto debe funcionar de forma independiente con su propio `package.json`, lockfile, configuración y CI.

## Objetivo funcional

- Mostrar el catálogo y el detalle de productos activos.
- Guiar al cliente por un configurador de cuatro pasos.
- Enviar el pedido y los archivos al backend.
- Abrir WhatsApp con el resumen generado por el servidor.
- Permitir que el administrador gestione productos, pedidos y configuración.

## Reglas no negociables

1. **Entender antes de cambiar:** leer este archivo, `README.md`, `docs/` y el código del módulo afectado.
2. **Cambios acotados:** implementar la solución mínima coherente; no reescribir módulos ajenos.
3. **JavaScript solamente:** no introducir TypeScript ni archivos `.ts`/`.tsx` sin decisión explícita.
4. **El servidor es la fuente de verdad:** el frontend nunca calcula precios, totales, descuentos, permisos ni roles.
5. **No confiar en datos del cliente:** toda validación de negocio se replica en el backend; la UI solo mejora la experiencia.
6. **Contratos estables:** no cambiar la forma de consumir la API sin actualizar `docs/API.md` y coordinar el repositorio backend.
7. **Seguridad:** no incluir secretos en variables `VITE_*`; no guardar tokens de sesión en `localStorage`.
8. **Calidad demostrable:** no declarar pruebas, lint o build exitosos sin ejecutarlos.
9. **Sin cambios destructivos:** no borrar datos, archivos de configuración ni funcionalidades sin autorización.
10. **Sin comentarios innecesarios:** no agregar comentarios al código salvo que aporten una explicación no obvia.

## Antes de implementar

Identificar:

- ruta y módulo afectados;
- componentes, hooks y clientes API involucrados;
- contrato de request/response en `docs/API.md`;
- estados de carga, vacío, error y éxito;
- impacto en accesibilidad, responsive y rendimiento;
- pruebas existentes y pruebas necesarias.

Para cambios pequeños y claros, proceder directamente. Para cambios transversales, ambiguos o que afectan contratos, presentar un plan breve antes de editar.

## Arquitectura frontend

```text
src/
├── app/                 # router, composición y 404
├── modules/
│   ├── admin/           # login, productos, pedidos y configuración
│   ├── catalog/         # listado, tarjetas y detalle
│   ├── home/            # landing
│   ├── quotes/          # wizard de pedido
│   ├── site-settings/   # configuración pública
│   └── system-status/   # estado del backend
├── shared/
│   ├── api/             # cliente HTTP y resolución de media
│   ├── components/      # layout, iconos, estados e imágenes
│   └── utils/           # formato, archivos y WhatsApp
└── test/
```

Reglas de dependencia:

- `modules` puede importar `shared`.
- `shared` no debe importar módulos de negocio.
- Los módulos no deben importar componentes internos de otro módulo salvo APIs públicas claras.
- El acceso HTTP se encapsula en `*.api.js`; los componentes no llaman `fetch` directamente.

## Rutas principales

| Ruta                     | Propósito                            |
| ------------------------ | ------------------------------------ |
| `/`                      | Inicio.                              |
| `/catalogo`              | Catálogo con filtros y búsqueda.     |
| `/productos/:slug`       | Detalle de producto.                 |
| `/personalizar`          | Wizard sin producto preseleccionado. |
| `/personalizar/:slug`    | Wizard con producto preseleccionado. |
| `/admin/login`           | Acceso administrativo.               |
| `/admin/productos`       | Listado administrativo.              |
| `/admin/productos/nuevo` | Alta de producto.                    |
| `/admin/productos/:id`   | Edición de producto.                 |
| `/admin/pedidos`         | Pedidos y descargas.                 |
| `/admin/configuracion`   | Portada y WhatsApp.                  |

## Flujo de datos

```text
Componente
  → módulo/*.api.js
  → shared/api/http-client.js
  → backend
```

- El cliente HTTP usa `credentials: 'include'`.
- El token CSRF se lee de la cookie `zl_admin_csrf` y se envía en `x-csrf-token`.
- Un `401` en rutas admin dispara el evento `admin:unauthorized`.
- Los errores se muestran con el contrato `{ error: { code, message, details } }`.

## Configuración y entornos

```dotenv
VITE_API_BASE_URL=/api
VITE_MEDIA_BASE_URL=
DEV_API_TARGET=http://localhost:5050
```

- `VITE_API_BASE_URL`: base de la API. En desarrollo, `/api` usa el proxy de Vite.
- `VITE_MEDIA_BASE_URL`: origen opcional para `/uploads/media` cuando la API está en otro dominio.
- `DEV_API_TARGET`: destino del proxy de desarrollo; no se expone al cliente.
- No poner secretos en variables `VITE_*`.
- Para producción, usar `.env.production.example` como plantilla.
- El backend debe permitir el origen exacto del frontend en `CORS_ORIGINS`.

## Comandos reales

```bash
npm ci
npm run dev
npm test
npm run test:watch
npm run lint
npm run build
npm run preview
npm run format
npm run format:check
npm run verify
```

Puertos locales: frontend `8080`, backend `5050`.

## Pruebas

- Framework: Vitest + jsdom + Testing Library.
- Probar comportamiento visible, no detalles de implementación.
- Cubrir estados de carga, error, vacío y éxito.
- Cubrir flujos críticos: catálogo, wizard, estimación, envío, admin.
- Usar mocks de API; no depender de un backend real en pruebas unitarias.
- Para precios con separadores, usar regex que toleren espacios/NBSP.
- Para radios y checkboxes, preferir `getByRole`.
- No agregar pruebas frágiles basadas en orden incidental del DOM.

## Seguridad

- No exponer credenciales, tokens ni datos personales en el bundle.
- No usar `dangerouslySetInnerHTML` sin sanitización y justificación.
- Validar archivos antes de subirlos y respetar los límites del backend.
- No confiar en el tipo MIME del navegador como única validación.
- No construir URLs de API concatenando datos sin `encodeURIComponent`.
- No registrar datos sensibles en consola.
- Mantener `rel="noreferrer"` en enlaces externos.

## UI/UX

- Mobile-first y responsive.
- Mantener el lenguaje visual existente y las variables CSS.
- Todo control debe tener label o nombre accesible.
- Mantener foco visible y navegación por teclado.
- Evitar layout shift; usar dimensiones estables en imágenes.
- Mostrar mensajes de error claros y accionables.
- No agregar librerías de UI o CSS sin justificar necesidad y peso.

## Dependencias

- Preferir APIs nativas del navegador y utilidades existentes.
- No agregar paquetes sin justificar mantenimiento, seguridad y tamaño.
- Revisar que la dependencia sea compatible con React 19 y Vite 8.
- No duplicar funcionalidad ya cubierta por `shared/`.

## Documentación

Mantener actualizado:

- `README.md`: instalación, scripts y despliegue.
- `docs/API.md`: contratos consumidos.
- `docs/API_CONVENTIONS.md`: convenciones para evolución de contratos.
- `docs/ARCHITECTURE.md`: estructura y flujos.
- `docs/DEPLOYMENT.md`: build, SPA fallback y configuración.
- `docs/SECURITY.md`: riesgos y controles del frontend.
- `docs/TESTING.md`: estrategia y comandos.
- `docs/decisions/`: ADR para decisiones relevantes.

## Definición de terminado

- El cambio cumple el objetivo y no rompe rutas existentes.
- Se ejecutaron `npm run lint`, `npm test`, `npm run build` y `npm run format:check`.
- Se agregaron o actualizaron pruebas cuando cambió comportamiento.
- No hay secretos ni artefactos generados en el diff.
- La documentación refleja cambios de API, entorno o despliegue.
- Se informó qué se cambió, qué se verificó y qué quedó pendiente.

## Limitaciones conocidas

- No hay E2E automatizado con navegador real.
- No hay SSR ni generación estática.
- El panel usa una sola cuenta administrativa.
- La sesión depende de cookies del backend; frontend y API deben configurarse para el dominio correcto.
