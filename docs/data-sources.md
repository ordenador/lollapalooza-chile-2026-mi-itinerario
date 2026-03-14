# Data Sources

Documentación mínima del origen de datos para previews y escucha por artista.

## Snapshot

- Fecha de snapshot: **March 14, 2026**
- Dataset consumido por la app: [artist-previews.ts](/Users/mfaundez/git/github/ordenador/lollapalooza-chile-2026-mi-itinerario/src/features/lineup/data/artist-previews.ts)

## Fuentes y alternativas de escucha (gratis)

- iTunes Search API (sin API key): títulos de canciones, `previewUrl` de 30 segundos y links de Apple Music.
- Spotify Web: links de búsqueda por artista y por canción.
- YouTube Web: links de búsqueda por artista y por canción.

## Flujo de generación

1. Tomar la lista oficial de artistas de `artists.ts`.
2. Usar canciones base del snapshot previo para no perder curaduría.
3. Resolver metadata de escucha con iTunes Search API (preview/audio + link de track/artist).
4. Generar links de fallback para Spotify y YouTube.
5. Escribir el dataset estático en `artist-previews.ts`.

Comando:

```bash
pnpm sync:listening-data
```

## Excepciones conocidas

- `Wassa Wassa`: sin match único verificable en iTunes/Spotify, se mantienen links de búsqueda.
- `¥ØU$UK€ ¥UK1MAT$U`: catálogo irregular según región, varios tracks quedan sin preview de 30s.
- `31 Minutos`: canciones disponibles sin preview en iTunes para algunas búsquedas.

## Política de actualización

Cuando se actualicen canciones o artistas:

1. Ejecutar `pnpm sync:listening-data`.
2. Confirmar que `artist-previews.ts` trae `previewUrl`, `artistLinks` y `links` por canción.
3. Cambiar fecha de snapshot en este documento.
4. Ejecutar `make check` antes de commit.
