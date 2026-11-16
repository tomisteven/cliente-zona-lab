# SEO del frontend

## Objetivo

Maximizar la indexación orgánica, la calidad de los fragmentos en buscadores y las vistas previas al compartir en redes.

## Implementado

- Metadatos por ruta: título, descripción, canonical, robots, Open Graph y Twitter Card.
- `index.html` con metadatos base y fallback para crawlers sin JavaScript.
- JSON-LD por página: `Organization`, `WebSite`, `CollectionPage`, `ItemList`, `Product`, `AggregateOffer`, `BreadcrumbList`, `FAQPage` y `AggregateRating` de reseñas aprobadas.
- Prerender de rutas en build: `/`, `/catalogo`, `/catalogo/:categoria`, `/personalizar` y `/productos/:slug`.
- Campos SEO editables por producto (`seoTitle`, `seoDescription`).
- Productos relacionados y enlaces internos hacia categorías.
- HTML estático con contenido real (título, descripción, imágenes, precios y enlaces) antes de que cargue React.
- `sitemap.xml` con rutas estáticas y productos, incluyendo imágenes.
- `robots.txt` con bloqueo de `/admin`, `/api` y `/estado`, y referencia al sitemap.
- `noindex,nofollow` en login y panel administrativo.
- `noindex,follow` en diagnóstico y 404.
- Favicon, manifest, `theme-color`, imagen Open Graph por defecto.
- Imágenes de producto con `srcset` y `sizes` a 480, 960 y 1600 px, generadas por la API como WebP.
- `preconnect`/`dns-prefetch` al origen de la API y media.
- Imagen principal de producto con `loading="eager"` y `fetchPriority="high"`.

## Build de producción

```bash
VITE_SITE_URL=https://www.tudominio.com \
SEO_API_BASE_URL=https://api.tudominio.com/api \
npm run build:seo
```

`build:seo` ejecuta Vite y después:

```bash
node scripts/generate-seo.js
```

El script lee `.env.production` y `.env` si existen, consulta productos y settings públicos, y genera el HTML prerenderizado, `dist/sitemap.xml` y `dist/robots.txt`.

Si la API no responde, genera solo las rutas estáticas y muestra una advertencia.

## Variables

| Variable                        | Uso                                                |
| ------------------------------- | -------------------------------------------------- |
| `VITE_SITE_URL`                 | Dominio público exacto, sin barra final.           |
| `VITE_GOOGLE_SITE_VERIFICATION` | Código de Search Console (opcional).               |
| `VITE_BING_SITE_VERIFICATION`   | Código de Bing Webmaster Tools (opcional).         |
| `SEO_API_BASE_URL`              | API usada solo durante `build:seo`; no se publica. |

## Search Console

1. Agregar la propiedad del dominio.
2. Verificar con el meta tag (`VITE_GOOGLE_SITE_VERIFICATION`) o por DNS.
3. Enviar `https://www.tudominio.com/sitemap.xml`.
4. Revisar cobertura, mejoras y Core Web Vitals.
5. Volver a ejecutar `build:seo` cuando cambien productos.

## Hosting

- El fallback SPA sigue siendo necesario para rutas sin prerender.
- Servir `dist/productos/<slug>/index.html` para cada producto cuando el hosting lo permita.
- `index.html`: cache corta; assets con hash: cache larga.
- No cachear respuestas de API privadas.

## Límites y siguientes pasos

El SEO técnico no garantiza posiciones. Para competir por búsquedas comerciales de pádel y personalización hacen falta:

- contenido único y útil por producto/categoría;
- enlaces internos y externos de calidad;
- reseñas y prueba social real;
- reseñas y datos estructurados de reputación cuando corresponda;
- estrategia de contenidos y autoridad de dominio;
- seguimiento de Search Console y analítica;
- imágenes optimizadas y buenos Core Web Vitals en producción.
