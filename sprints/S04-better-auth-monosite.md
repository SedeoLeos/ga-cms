# S04 — Better Auth + Refactor Mono-site

**Statut :** DONE

## Objectif

Migrer l'authentification de NextAuth vers Better Auth, et simplifier l'architecture de multi-site vers mono-site (un seul site par instance CMS).

## Livré

### Suppression NextAuth
- Suppression des routes `/api/auth/[...nextauth]/`
- Suppression de `next-auth` de `package.json`
- Suppression des pages admin `sites/` (multi-site)

### Migration Better Auth
- `src/lib/auth/session.ts` — helper `getSession()` via `auth.api.getSession`
- `src/lib/auth/actions.ts` — `logoutAction` server action
- `src/app/(admin)/admin/layout.tsx` — protection via `getSession()`
- `src/app/(admin)/admin/auth/login/page.tsx` — page login Better Auth

### Refactor Mono-site
- Suppression du modèle `Site` du schéma Prisma
- `Settings` remplace `Site` (table unique id=1)
- `getSettings()` helper — retourne name, url, locales, defaultLocale, favicon, logo
- Tous les composants admin migrés pour utiliser `getSettings()` au lieu de `site.*`
- Sidebar : suppression "Sites", ajout "Membres"

### Studio layout
- `src/app/(studio)/studio/layout.tsx` — simplifié à `<>{children}</>`

## Fichiers clés

```
src/lib/auth/session.ts
src/lib/auth/actions.ts
src/lib/settings.ts
src/app/(admin)/admin/layout.tsx
src/app/(admin)/admin/auth/login/page.tsx
src/components/admin/layout/AdminSidebar.tsx
prisma/sqlite/schema.prisma  (suppression Site, ajout Settings)
```

## Décisions

- **Mono-site** — une instance CMS = un site. Simplifie tout : pas de siteId dans les queries, pas de tabs par site dans l'UI
- **Better Auth** — meilleure intégration App Router que NextAuth, pas de JWT custom, sessions DB

## Dette

- `prisma/seed.ts` — encore des références `site.*` et `passwordHash` → à réécrire
- Plusieurs pages admin (`collections/page.tsx`, `post-types/page.tsx`) avaient encore des props `sites`/`tabs` — partiellement corrigé
- `admin/page.tsx` (dashboard) contient encore `prisma.site` → à corriger
- `api/cron/publish/route.ts` contient encore `siteId` → à corriger
