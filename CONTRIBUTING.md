# Contributing

Gracias por colaborar.

## Setup

```bash
corepack enable
make install-dependencies
make install-hooks
```

## Flujo recomendado

1. Crear rama desde `main`.
2. Hacer cambios pequeños y atómicos.
3. Ejecutar validaciones:

```bash
make check
```

4. Abrir PR con:

- Resumen breve de cambios
- Riesgos o decisiones relevantes
- Evidencia de tests/checks

## Reglas de calidad

- Respetar [docs/PROJECT_ORDER.md](/Users/mfaundez/git/github/ordenador/lollapalooza-chile-2026-mi-itinerario/docs/PROJECT_ORDER.md).
- No introducir secretos ni claves en el repo.
- Mantener documentación al día si cambian flujos o datos.
