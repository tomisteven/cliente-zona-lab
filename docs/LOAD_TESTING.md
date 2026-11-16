# Pruebas de carga

Se incluye un escenario k6 en `tests/load/catalog-quotes.js`.

## Ejecución

```bash
k6 run tests/load/catalog-quotes.js
```

Con otra URL:

```bash
BASE_URL=https://api.tudominio.com/api k6 run tests/load/catalog-quotes.js
```

## Qué mide

- Catálogo público.
- Estimación de precio.
- Errores HTTP y percentil 95 de latencia.

## Umbrales iniciales

- Fallos HTTP menores al 1 %.
- p95 menor a 800 ms.

Ajustar según infraestructura y tráfico real. No ejecutar contra producción sin autorización.
