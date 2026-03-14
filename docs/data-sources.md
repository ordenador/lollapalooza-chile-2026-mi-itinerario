# Data Sources

Documentación mínima del origen de datos para previews de artistas.

## Snapshot

- Fecha de snapshot: **March 14, 2026**
- Dataset consumido por la app: [artist-previews.ts](/Users/mfaundez/git/github/ordenador/lollapalooza-chile-2026-mi-itinerario/src/features/lineup/data/artist-previews.ts)

## Fuente y método

- Fuente principal: Spotify Web (búsqueda + embed público de artista).
- Flujo usado:
  1. Resolver perfil del artista (`open.spotify.com/search/{artist}`).
  2. Leer top tracks desde `open.spotify.com/embed/artist/{id}`.
  3. Guardar 3 canciones por artista en dataset estático.

## Excepciones conocidas

- `Wassa Wassa`: sin perfil único verificable en Spotify; se usaron resultados top de búsqueda.
- `School of Rock`: se usó `School of Rock Cast` como match más cercano.
- `¥ØU$UK€ ¥UK1MAT$U`: perfil con catálogo limitado; se complementó con búsqueda relacionada.

## Política de actualización

Cuando se actualicen canciones o artistas:

1. Actualizar `artist-previews.ts`.
2. Cambiar fecha de snapshot en este documento.
3. Mantener notas de excepciones si aplican.
4. Ejecutar `make check` antes de commit.
