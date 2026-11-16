# Legal y consentimiento

## Páginas incluidas

- `/privacidad`: datos recopilados, finalidad, conservación y derechos.
- `/terminos`: condiciones del sitio y del proceso de cotización.
- `/cookies`: categorías de cookies y gestión del consentimiento.

Los textos son una base técnica y deben ser revisados por un asesor legal antes de publicar. Actualizá `VITE_BUSINESS_NAME`, `VITE_CONTACT_EMAIL` y `VITE_LEGAL_UPDATED_AT`.

## Consentimiento

- Banner de cookies con opciones: aceptar todo, solo necesarias o configurar.
- Se guarda en `localStorage` bajo `zl_cookie_consent`.
- La analítica y la publicidad no se cargan hasta que la categoría correspondiente es aceptada.
- Desde el footer se puede reabrir **Preferencias de cookies**.

## Analítica

Variables opcionales:

```dotenv
VITE_GA_MEASUREMENT_ID=
VITE_GTM_ID=
VITE_META_PIXEL_ID=
```

Eventos enviados:

- `page_view`
- `view_item`
- `quote_submitted`
- `whatsapp_click`

## Atribución

`captureAttribution` guarda el último origen UTM en `localStorage` (`zl_attribution`) y lo envía en el pedido. El panel muestra origen, medio y campaña.

## Pendiente operativo

- Revisión legal profesional.
- Definir retención y procedimiento de eliminación de datos.
- Configurar Search Console, Google Ads y Meta con los IDs reales.
- Añadir consentimiento explícito para comunicaciones comerciales si se implementa newsletter.
