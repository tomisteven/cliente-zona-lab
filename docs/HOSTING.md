# Hosting y cabeceras

## Requisitos

- HTTPS obligatorio.
- Servir `dist/` con los archivos prerenderizados.
- Fallback SPA para rutas no prerenderizadas.
- `/assets/*` con cache inmutable.
- `index.html` y HTML prerenderizado con cache corta.
- Dominio canónico único (`www` o sin `www`) con redirección 301.
- 404 real para rutas inexistentes si el hosting lo permite.

## Netlify

`dist/_redirects`:

```text
/*    /index.html   200
```

Los archivos existentes se sirven antes del fallback. Verificar que `/productos/<slug>/index.html` se resuelva.

Cabeceras recomendadas (`dist/_headers`):

```text
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
  X-Frame-Options: DENY
```

## Vercel

`vercel.json`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

## Nginx

```nginx
root /var/www/zona-lab/dist;
index index.html;

location /assets/ {
  try_files $uri =404;
  add_header Cache-Control "public, max-age=31536000, immutable";
}

location / {
  try_files $uri $uri/ /index.html;
}

add_header X-Content-Type-Options nosniff always;
add_header Referrer-Policy strict-origin-when-cross-origin always;
add_header X-Frame-Options DENY always;
```

## Apache

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^ index.html [L]
```

## CSP

La CSP depende del dominio de la API y de los IDs de analítica. Si las imágenes se sirven desde Cloudinary, `img-src` debe incluir `https://res.cloudinary.com`. Ejemplo base:

```text
default-src 'self';
img-src 'self' data: https://api.tudominio.com https://res.cloudinary.com;
script-src 'self' https://www.googletagmanager.com https://connect.facebook.net;
connect-src 'self' https://api.tudominio.com https://www.google-analytics.com https://region1.google-analytics.com;
style-src 'self' 'unsafe-inline';
font-src 'self';
frame-src https://www.googletagmanager.com;
```

Ajustar según proveedores y evitar `unsafe-inline` en scripts.
