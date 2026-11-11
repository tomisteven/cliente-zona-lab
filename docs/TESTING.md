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
npm run lint
npm run build
npm run verify
```

## Capas

- **Unitarias:** utilidades puras, formato, resolución de URLs.
- **Componentes:** renderizado, interacción y accesibilidad.
- **Flujos:** wizard, estimación, envío, admin.
- **E2E:** pendiente con navegador real.

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
- Estados del sistema.
- Resolución de API y media.
- Manejo de errores del cliente HTTP.

## Pendiente

- E2E con navegador real y backend.
- Accesibilidad con teclado y lector de pantalla.
- Pruebas de rendimiento.
- Pruebas de reconexión y errores de red.
- Umbral de cobertura basado en riesgo.
