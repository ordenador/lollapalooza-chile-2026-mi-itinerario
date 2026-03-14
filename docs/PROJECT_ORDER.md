# Project Order

Convenciones mínimas para mantener el repo consistente y fácil de colaborar.

## Estructura

1. `src/app`: solo rutas/layouts.
2. `src/features/<dominio>`: tipos, data, hooks, utils.
3. `src/components`: UI reutilizable.
4. `src/lib`: utilidades transversales.
5. `src/tests`: pruebas.
6. Alias obligatorio: `@/*`.

## Nombres

- Componentes: `PascalCase.tsx`
- Hooks: `useX.ts`
- Utils: `camelCase.ts`
- Data: `kebab-or-lower.ts`

## Calidad

- Antes de abrir PR: `make check`.
- Hooks de git: `make install-hooks`.
- `make dev` intenta instalar hooks automáticamente si `pre-commit` está disponible.

## Criterio para nuevas features

Cada feature nueva debe incluir, como mínimo:

1. Tipos
2. Data o service
3. Hook o util (si aplica)
4. Al menos una prueba
