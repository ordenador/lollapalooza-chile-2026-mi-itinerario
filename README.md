# Lollapalooza Chile 2026 - Mi Itinerario

Aplicación Next.js para planificar tu ruta del festival, marcar favoritos y ver una previa rápida por artista.

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- pnpm + Makefile
- Vitest + Testing Library
- pre-commit

## Requisitos

- Node.js 24.x (`.nvmrc`)
- pnpm
- pre-commit (recomendado: `pipx install pre-commit`)

## Inicio rápido

```bash
corepack enable
make install-dependencies
make dev
```

App local: [http://localhost:3000](http://localhost:3000)

## Comandos principales

```bash
make help
make dev
make build
make update
make check
make install-hooks
```

Comandos completos: revisar [Makefile](/Users/mfaundez/git/github/ordenador/lollapalooza-chile-2026-mi-itinerario/Makefile).

## CI

El workflow [ci.yml](/Users/mfaundez/git/github/ordenador/lollapalooza-chile-2026-mi-itinerario/.github/workflows/ci.yml) ejecuta `make check` en `push` a `main` y `pull_request`. `pre-commit` se mantiene para feedback local antes de commitear.

## Estructura del proyecto

```txt
src/
  app/            # rutas y layouts
  features/       # lógica de dominio (lineup)
  components/     # UI reutilizable
  lib/            # utilidades transversales
  styles/         # estilos globales
  tests/          # pruebas unitarias/smoke
```

Reglas de orden: [docs/PROJECT_ORDER.md](/Users/mfaundez/git/github/ordenador/lollapalooza-chile-2026-mi-itinerario/docs/PROJECT_ORDER.md)

## Datos de previews

Los previews de artistas son estáticos (sin IA runtime) y se cargan desde:

- [artist-previews.ts](/Users/mfaundez/git/github/ordenador/lollapalooza-chile-2026-mi-itinerario/src/features/lineup/data/artist-previews.ts)
- [docs/data-sources.md](/Users/mfaundez/git/github/ordenador/lollapalooza-chile-2026-mi-itinerario/docs/data-sources.md)

## Contribuir

Guía corta de contribución: [CONTRIBUTING.md](/Users/mfaundez/git/github/ordenador/lollapalooza-chile-2026-mi-itinerario/CONTRIBUTING.md)

## Deploy (Vercel)

1. Importar el repo en Vercel.
2. Confirmar:
   - Framework: `Next.js`
   - Install Command: `pnpm install --frozen-lockfile`
   - Build Command: `pnpm build`
3. Runtime:
   - Node.js: `24.x` (definido en `package.json`)
   - pnpm: `10.x` (definido en `package.json`)
4. Variables de entorno: no requiere para esta versión.

Configuración explícita en [vercel.json](/Users/mfaundez/git/github/ordenador/lollapalooza-chile-2026-mi-itinerario/vercel.json).
