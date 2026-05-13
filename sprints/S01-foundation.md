# S01 — Foundation

**Statut :** DONE

## Objectif

Poser les bases techniques du CMS : stack Next.js App Router, base de données multi-provider, authentification, et shell admin.

## Livré

- **Next.js 15** App Router, TypeScript strict, Biome (linter/formatter)
- **Prisma multi-DB** — schémas séparés `prisma/sqlite/`, `prisma/postgresql/`, `prisma/mysql/`
- **Better Auth** — session, login, logout (`/admin/auth/login`)
- **Admin layout** — sidebar `AdminSidebar`, navigation par sections
- **Middleware** — protection des routes `/admin/*` et `/studio/*`
- **Design tokens API** — `/api/tokens` retourne du CSS custom properties
- **Settings** — table `Settings` + helper `getSettings()`

## Fichiers clés

```
src/lib/auth/session.ts
src/lib/db/client.ts
src/lib/settings.ts
src/app/(admin)/admin/layout.tsx
src/components/admin/layout/AdminSidebar.tsx
src/middleware.ts
src/app/api/tokens/route.ts
prisma/sqlite/schema.prisma
prisma/postgresql/schema.prisma
prisma/mysql/schema.prisma
```

## Décisions

- **Biome** plutôt qu'ESLint/Prettier — configuration unique, plus rapide
- **Inline styles React** pour tout le admin — pas de Tailwind, pas de CSS modules, cohérence absolue avec le thème sombre
- **`lineWidth: 100`** dans biome.json
- **Multi-DB via schémas séparés** — même code app, schéma adapté au provider

## Dette

- `prisma/seed.ts` contient encore des références à l'ancien modèle multi-site (`siteId`, `passwordHash`) — à mettre à jour
