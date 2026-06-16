# Basekit — AI Agent Instructions

## Project Overview

- **Monorepo**: pnpm workspace — 5 published packages + playground
- **Packages**: `@loykin/control-bar`, `@loykin/datetime-range`, `@loykin/filter-input`, `@loykin/side-panel`, `@loykin/unit`
- **Stack**: React 18/19, TypeScript, tsup, Tailwind CSS, Vitest

## Commands

```bash
pnpm build            # build all packages (tsc + tsup + CSS)
pnpm test             # vitest run (all packages)
pnpm lint             # eslint
pnpm type-check       # tsc --noEmit (all packages)
pnpm test:consumer    # verify published packages can be imported by a consumer app
pnpm release:check    # lint + test + build + test:consumer  ← full release gate
```

## Project Structure

```
packages/
  control-bar/      @loykin/control-bar     — resizable bottom bar with tab panels
  datetime-range/   @loykin/datetime-range  — headless datetime range picker
  filter-input/     @loykin/filter-input    — filter input component
  side-panel/       @loykin/side-panel      — side panel component
  unit/             @loykin/unit            — unit formatting utilities
playground/         Vite dev app (not published)
scripts/            Build and verification scripts
```

## Release Process

**All packages share a single version and are released together with one tag.**

```bash
git tag v1.0.0
git push origin v1.0.0
```

- Pre-release: `v1.0.0-dev.0`, `v1.0.0-alpha.1`, etc. → publishes to npm with that dist-tag
- GitHub Actions (`release.yml`) handles build → publish → GitHub Release automatically
- `pnpm -r publish` auto-discovers all packages in `packages/` — no hardcoded list in the workflow

**When adding or removing a package:**
1. Create or delete the directory under `packages/`
2. Update `const packages` array in `scripts/verify-package-consumer.mjs`
3. No changes needed in the release workflow — it picks up packages automatically

## Testing Conventions

- Unit/component tests live in `packages/<name>/src/__tests__/`
- Use **relative imports** in test files — path aliases are not available in Vitest project configs
  - ✓ `from '../datetime-utils'`
  - ✗ `from '@/datetime-utils'`

## Conventions

- No unnecessary comments — only add when the WHY is non-obvious
- CSS: Tailwind utility classes + CSS custom properties for theming
