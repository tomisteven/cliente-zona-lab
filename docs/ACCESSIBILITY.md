# Accesibilidad

## Implementado

- HTML semántico, landmarks y jerarquía de títulos.
- Labels en todos los controles de formulario.
- Foco visible y navegación por teclado.
- `aria-pressed` en filtros y cantidades.
- Mensajes de error con `role="alert"` y estados con `role="status"`.
- Diálogo de cookies con título accesible y controles etiquetados.
- Imágenes con `alt`; miniaturas con botones etiquetados.
- `prefers-reduced-motion` respetado.
- Panel y login marcados como `noindex`.

## Auditoría manual recomendada

1. Navegar todo el sitio solo con teclado.
2. Verificar orden de tabulación y foco visible.
3. Probar el wizard completo con lector de pantalla.
4. Revisar contraste con DevTools o axe.
5. Verificar zoom al 200 % y viewport móvil.
6. Probar el banner de cookies y las preferencias.
7. Verificar mensajes de error del formulario de pedido y contacto.

## Pendiente

- Ejecución automática de axe en cada PR (hoy corre por workflow manual de E2E).
- Pruebas con VoiceOver/NVDA.
- Auditoría WCAG 2.2 AA formal.
