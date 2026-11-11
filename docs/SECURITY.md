# Seguridad del frontend

## Principios

- El frontend no es una frontera de seguridad.
- La API decide precios, permisos y validaciones autoritativas.
- Todo dato recibido de la API o del usuario debe tratarse como no confiable.

## Secretos

- No incluir secretos en variables `VITE_*`.
- No commitear `.env`, `.env.production` ni credenciales.
- No registrar tokens, cookies ni datos personales en consola.
- No incrustar claves de servicios externos en el bundle.

## Autenticación

- La sesión usa cookies del backend.
- No guardar el token de sesión en `localStorage` ni `sessionStorage`.
- No leer la cookie HttpOnly desde JavaScript.
- El token CSRF se lee de `zl_admin_csrf` y se envía en `x-csrf-token`.
- Un `401` debe limpiar el estado de sesión y redirigir al login.

## XSS

- No usar `dangerouslySetInnerHTML` sin sanitización.
- No construir HTML con datos del usuario.
- Escapar contenido dinámico mediante JSX.
- Validar URLs antes de usarlas en `href` o `src`.
- Usar `rel="noreferrer"` en enlaces externos.

## Archivos

- Validar tipo y tamaño antes de subir.
- Respetar los límites del backend.
- No confiar solo en el MIME del navegador.
- No mostrar rutas privadas de archivos de pedidos.
- Las descargas privadas requieren sesión admin.

## API y CORS

- No asumir que CORS protege la API; la autorización debe estar en el backend.
- Codificar IDs y slugs con `encodeURIComponent`.
- No aceptar URLs de API desde parámetros del usuario.
- Manejar errores sin exponer detalles internos.

## Dependencias

- Revisar necesidad, mantenimiento y tamaño antes de agregar paquetes.
- Mantener actualizadas las dependencias críticas.
- Ejecutar auditoría cuando el equipo defina el flujo.
- No agregar scripts remotos sin control.

## Privacidad

- Minimizar datos personales en el frontend.
- No enviar datos a analítica sin consentimiento y base legal.
- No incluir datos de clientes en logs.
- No cachear respuestas privadas en el hosting.

## Checklist

- [ ] No hay secretos en el bundle.
- [ ] No se usa `localStorage` para sesión.
- [ ] CSRF se envía en mutaciones admin.
- [ ] No hay HTML sin sanitizar.
- [ ] Archivos validados antes de subir.
- [ ] URLs externas usan `rel="noreferrer"`.
- [ ] Errores no exponen detalles internos.
- [ ] Dependencias revisadas.
- [ ] Backend con CORS explícito y cookies correctas.
