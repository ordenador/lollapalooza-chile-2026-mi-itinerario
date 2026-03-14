# Lollapalooza Chile 2026 - Mi Itinerario

App web para planificar la ruta del festival, marcar favoritos y escuchar previews de artistas.

Demo: [https://lollapalooza-chile-2026-mi-itinerar.vercel.app/](https://lollapalooza-chile-2026-mi-itinerar.vercel.app/)

## Requisitos

- Node.js `24.x`
- pnpm `10.x`

## Uso local

```bash
corepack enable
make install-dependencies
make dev
```

Abrir: `http://localhost:3000`

## Comandos útiles

```bash
make dev
make build
make check
make update
pnpm sync:listening-data
```

## Estructura

```txt
src/app          rutas y layout
src/components   UI
src/features     dominio lineup
src/tests        pruebas
```

## Notas

- No requiere variables de entorno para correr.
- Datos de escucha/previews: `src/features/lineup/data/artist-previews.ts`
- Fuentes de datos: `docs/data-sources.md`
