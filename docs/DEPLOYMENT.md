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
VITE_SITE_URL=https://www.example.com
VITE_GOOGLE_SITE_VERIFICATION=
VITE_BING_SITE_VERIFICATION=
SEO_API_BASE_URL=https://api.example.com/api
```

- `VITE_API_BASE_URL` debe incluir `/api` si la API usa ese prefijo.
- `VITE_MEDIA_BASE_URL` debe ser el origen de la API o un CDN de imágenes.
- `VITE_SITE_URL` debe ser el dominio público exacto, sin barra final.
- `VITE_GOOGLE_SITE_VERIFICATION` y `VITE_BING_SITE_VERIFICATION` son opcionales.
- `SEO_API_BASE_URL` se usa solo en `build:seo` y no se publica.
- Si `VITE_MEDIA_BASE_URL` está vacío, se usa el origen de `VITE_API_BASE_URL`.
- No incluir secretos en variables `VITE_*`.
- Las variables se fijan al construir; cambiar el entorno requiere rebuild.

## Imágenes

- Las URLs de producto siguen siendo `/uploads/media/...`.
- La API puede redirigir esas rutas a Cloudinary; el frontend no necesita cambios.
- Si el hosting aplica CSP, `img-src` debe permitir `https://res.cloudinary.com`.
- `VITE_MEDIA_BASE_URL` solo define el origen de `/uploads/media`; no apuntes directo a Cloudinary.

## Build

```bash
npm ci
npm run verify
npm run build:seo
```

`build:seo` genera `dist/` y además:

- HTML prerenderizado para `/`, `/catalogo`, `/personalizar` y cada producto.
- `sitemap.xml` con productos e imágenes.
- `robots.txt` con el dominio real y bloqueo de rutas privadas.
- Metadatos, canonical, Open Graph y JSON-LD estáticos por página.

Publicar el contenido de `dist/`.

## SEO y buscadores

1. Verificar el dominio en Google Search Console.
2. Enviar `https://www.example.com/sitemap.xml`.
3. Repetir `build:seo` cuando cambien productos.
4. Revisar cobertura, Core Web Vitals y enlaces.
5. Ver [SEO](SEO.md) para el detalle.

El fallback SPA sigue siendo necesario para rutas no prerenderizadas. Si el hosting permite servir archivos `index.html` anidados, las rutas de producto tendrán HTML estático completo.

Ver [Hosting](HOSTING.md) para configuraciones de Netlify, Vercel, Nginx, Apache, cache y headers.

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
- [ ] `npm run build:seo` generó prerender, sitemap y robots con el dominio real.
- [ ] Fallback SPA activo.
- [ ] Sitemap enviado en Search Console.
- [ ] API responde `/api/health/ready`.
- [ ] CORS del backend incluye el dominio del frontend.
- [ ] Login admin funciona con cookies.
- [ ] Notificaciones SMTP configuradas y probadas desde el panel.
- [ ] Imágenes de `/uploads/media` se ven en el dominio correcto.
- [ ] Si hay Cloudinary, CSP permite `https://res.cloudinary.com`.
- [ ] Recarga directa de rutas funciona.
- [ ] No hay secretos en el bundle.

## Rollback

Mantener el build anterior publicado. Si falla un despliegue, restaurar el artefacto previo y verificar login, catálogo y envío de pedidos.
