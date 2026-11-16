# Testing del frontend

## Herramientas

- Vitest.
- jsdom.
- Testing Library.
- jest-dom.

## Comandos

```bash
npm test
npm run test:watch
npm run test:e2e
npm run test:e2e:ui
npm run lint
npm run build
npm run build:seo
npm run verify
```

E2E usa Playwright + axe y necesita una instancia accesible:

```bash
E2E_BASE_URL=http://localhost:8080 npm run test:e2e
```

## Capas

- **Unitarias:** utilidades puras, formato, resolución de URLs.
- **Componentes:** renderizado, interacción y accesibilidad.
- **Flujos:** wizard, estimación, envío, admin.
- **E2E:** Playwright contra `E2E_BASE_URL` (workflow manual).

## Prioridad

Alta:

- login admin;
- creación y edición de productos;
- estimación y envío de pedidos;
- subida de archivos;
- errores de autenticación y CSRF.

Media:

- filtros y búsqueda;
- paginación;
- configuración del sitio;
- estados de carga y vacío.

Baja:

- estilos visuales no críticos.

## Reglas

- Probar comportamiento visible, no implementación.
- Usar roles y labels accesibles.
- Evitar selectores por clase CSS.
- Usar regex para precios con separadores variables.
- Mockear clientes API, no `fetch` global salvo prueba del cliente HTTP.
- Limpiar mocks y efectos entre pruebas.
- No depender del orden de ejecución.
- No usar datos personales reales.

## Cobertura actual

- Wizard de cotización.
- Catálogo: listado, filtro por categoría, `aria-pressed` y estado de error.
- Login administrativo: éxito, credenciales inválidas y sesión anónima.
- Alta y edición de productos desde el panel.
- Configuración SMTP y envío de correo de prueba desde el panel.
- Estado, notas internas y filtro de pedidos.
- Validación de archivos de diseño y media.
- Error boundary global.
- Estados del sistema.
- Cliente HTTP: resolución de API y media, JSON y FormData, contrato de error, CSRF y evento `admin:unauthorized`.
- Landing de categoría y navegación desde catálogo.
- Dashboard administrativo y formulario de contacto.
- Detalle de producto con reseñas y envío de opinión.
- Biblioteca de medios: listado, subida, borrado y variantes responsive.
- FAQ, legales y accesibilidad E2E con Playwright + axe.
- Borrador persistente del wizard.
- Consentimiento de cookies y atribución UTM.
- SEO: URLs absolutas/canonical y metadatos, JSON-LD, robots y limpieza al desmontar.
- Prerender, sitemap y robots se validan con `npm run build:seo` (requiere API disponible).

## Pendiente

- E2E con navegador real y backend.
- Accesibilidad con teclado y lector de pantalla.
- Pruebas de rendimiento.
- Pruebas de reconexión y errores de red.
- Umbral de cobertura basado en riesgo.
- Ejecución automática de E2E en cada PR (hoy es manual por workflow).
- Flujos E2E de compra/pedido con archivos reales.
- Seguimiento externo de Search Console, analítica y posiciones.
