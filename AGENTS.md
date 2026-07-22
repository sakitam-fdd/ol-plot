# OL Plot Agent Guide

This file is the repository entry point for coding agents. Keep changes compatible with the public SDK, the documented demos, and every supported OpenLayers major version.

## Read the relevant references first

| Work area | Required reference |
| --- | --- |
| SDK lifecycle, public API, geometry or algorithms | [`docs/development/architecture.md`](docs/development/architecture.md) |
| OpenLayers imports, interactions or compatibility | [`docs/development/openlayers-compatibility.md`](docs/development/openlayers-compatibility.md) |
| VitePress, playgrounds or UI examples | [`docs/development/demos.md`](docs/development/demos.md) |
| Tests, build validation or release-sensitive changes | [`docs/development/verification.md`](docs/development/verification.md) |

Read all references that match the task. User-facing guides live under `docs/guide`, API documentation under `docs/sdk`, and runnable examples under `docs/examples`.

## Repository map

- `packages/ol-plot`: framework-independent TypeScript SDK.
- `packages/ol-plot-vue`: Vue 2/3 integration built on `vue-demi`.
- `docs`: VitePress 2 documentation and the primary interactive Demo.
- `playground/single`: standalone TypeScript/Vite Demo.
- `playground/vue2` and `playground/vue3`: framework integration examples.
- `.github/workflows/ci.yml`: Node, OpenLayers compatibility, docs and release gates.

## Non-negotiable contracts

- Support `ol >= 6.15.0 < 11`; do not rely on an API introduced after OpenLayers 6.15 without a guarded fallback.
- Keep every `ol` import external in SDK builds. Never bundle a second OpenLayers runtime.
- Preserve existing public exports and deprecated aliases unless a documented breaking release explicitly removes them.
- Restore any map interaction state changed by drawing or editing. Do not blindly enable an interaction that was disabled before OL Plot used it.
- Serialize enough geometry, control points and style data for `getFeatures()` → `addFeatures()` round trips.
- Keep docs and standalone examples usable on desktop, tablet and mobile; all controls require visible focus and disabled states.

## Working commands

```bash
pnpm install
pnpm lint
pnpm type-check
pnpm test
pnpm docs:build
pnpm --dir playground/single build
pnpm --dir playground/vue2 build
pnpm --dir playground/vue3 build
```

Run the narrowest checks while iterating, then the checks required by [`docs/development/verification.md`](docs/development/verification.md) before handoff. Do not edit generated `dist`, VitePress cache, or coverage output.

## Completion checklist

- Source, public types, documentation and examples agree.
- Interaction cleanup works for completion, cancellation and instance destruction.
- OpenLayers 6.15, 7, 8, 9 and 10 compatibility-sensitive paths are covered.
- User-visible behavior is demonstrated in the VitePress playground or a focused runnable example.
- Relevant tests, type checks and builds pass.
