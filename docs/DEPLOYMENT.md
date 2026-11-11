# Despliegue del frontend

## Requisitos

- Node.js 24.
- npm 10 o superior.
- API desplegada y accesible por HTTPS.
- Hosting estático con soporte de fallback SPA.

## Variables de build

```dotenv
VITE_API_BASE_URL=https://api.example.com/api
VITE_MEDIA_BASE_URL=https://api.example.com
```

- `VITE_API_BASE_URL` debe incluir `/api` si la API usa ese prefijo.
- `VITE_MEDIA_BASE_URL` debe ser el origen de la API o un CDN de imágenes.
- Si `VITE_MEDIA_BASE_URL` está vacío, se usa el origen de `VITE_API_BASE_URL`.
- No incluir secretos en variables `VITE_*`.
- Las variables se fijan al construir; cambiar el entorno requiere rebuild.

## Build

```bash
npm ci
npm run verify
npm run build
```

Publicar el contenido de `dist/`.

## Fallback SPA

Todas las rutas deben devolver `index.html`, excepto archivos estáticos. Sin esto, rutas como `/catalogo` o `/admin/productos` devuelven 404 al recargar.

## CORS y cookies

En el backend:

```dotenv
CORS_ORIGINS=https://www.example.com
COOKIE_SAME_SITE=none
TRUST_PROXY=true
```

- `CORS_ORIGINS` debe contener el origen exacto del frontend, sin barra final.
- Usar `COOKIE_SAME_SITE=none` si frontend y API están en sitios distintos.
- `none` requiere HTTPS.
- Si ambos dominios pertenecen al mismo sitio, `lax` puede ser suficiente.
- El frontend ya envía `credentials: 'include'`.

## Cache

- Assets con hash: cache larga e inmutable.
- `index.html`: cache corta o `no-cache`.
- No cachear respuestas de API desde el hosting estático.

## Seguridad

- Servir solo HTTPS.
- Configurar cabeceras de seguridad en el hosting si es posible.
- Evitar `unsafe-inline` en una futura CSP.
- No publicar `.env`, `.env.production` ni mapas de fuente con secretos.
- Revisar que el backend permita el dominio correcto.

## Checklist

- [ ] `npm run verify` pasó.
- [ ] Variables de producción configuradas.
- [ ] Build generado con las variables correctas.
- [ ] Fallback SPA activo.
- [ ] API responde `/api/health/ready`.
- [ ] CORS del backend incluye el dominio del frontend.
- [ ] Login admin funciona con cookies.
- [ ] Imágenes de `/uploads/media` se ven en el dominio correcto.
- [ ] Recarga directa de rutas funciona.
- [ ] No hay secretos en el bundle.

## Rollback

Mantener el build anterior publicado. Si falla un despliegue, restaurar el artefacto previo y verificar login, catálogo y envío de pedidos.
