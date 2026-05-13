# S06 — Site Engine

**Statut :** DONE

## Objectif

Construire le moteur de rendu du site public : routing universel, archives, single posts, pages de termes de taxonomie, filtres admin, sitemap, flux RSS, et admin taxonomies complet.

## Livré

### Routing universel (`[locale]/[...slug]`)
Résolution prioritaire en 4 niveaux :
1. Page publiée (n'importe quel slug)
2. Archive post-type (1 segment, `hasArchive: true`)
3. Billet unique (`postTypeSlug/entrySlug`)
4. Terme de taxonomie (`taxonomySlug/termSlug`)

### Composants de rendu site
- `ArchiveView` — grille paginée (12/page), excerpt auto, date, temps de lecture
- `SinglePostView` — article complet avec breadcrumb, méta, termes groupés par taxonomie, `FieldRenderer`
- `TermArchiveView` — liste paginée des billets d'un terme, avec label du post type
- `FieldRenderer` — rendu schema-driven (richtext, text, textarea, media, number, boolean, date, select)
- `EmptyPage` — page publiée sans contenu

### Admin — Recherche & filtres
- **`AdminSearchBar`** — recherche debounced 300ms + filtre statut, URL-based (`useRouter.push`)
- Post-type entries — filtre titre + statut en mémoire
- Collection entries — idem + correction référence `collection.site.*`

### Admin — Taxonomies (pages complètes)
- `/admin/taxonomies` — liste + formulaire de création inline
- `/admin/taxonomies/[id]` — gestionnaire de termes :
  - Ajout terme avec slug auto + sélecteur parent (hiérarchique)
  - Édition inline (in-place)
  - Suppression terme
  - Association/désassociation post types (toggle)
  - Édition + suppression taxonomie
- Sidebar : ajout "Taxonomies" (icône Tag)

### Éditeur de billet — Taxonomies
- `PostEntryForm` — section "Taxonomies" dans la sidebar
- Sélection de termes par checkbox, sauvegarde optimiste via `useTransition`
- `updatePostEntryTermsAction` — delete-all + createMany en transaction

### SEO
- `src/app/sitemap.ts` — pages, archives, billets, termes (avec `lastModified`, `changeFrequency`, `priority`)
- `/api/rss/[postTypeSlug]` — RSS 2.0 valide (`hasRss: true` requis), 50 derniers billets, `Cache-Control` 1h/stale 24h

## Fichiers clés

```
src/app/(site)/[locale]/[...slug]/page.tsx
src/app/sitemap.ts
src/app/api/rss/[postTypeSlug]/route.ts
src/components/admin/shared/AdminSearchBar.tsx
src/components/admin/post-types/PostEntryForm.tsx
src/lib/actions/taxonomies.ts
src/lib/actions/post-entries.ts  (+ updatePostEntryTermsAction)
src/app/(admin)/admin/taxonomies/page.tsx
src/app/(admin)/admin/taxonomies/TaxonomyCreateForm.tsx
src/app/(admin)/admin/taxonomies/[taxonomyId]/page.tsx
src/app/(admin)/admin/taxonomies/[taxonomyId]/TaxonomyEditForm.tsx
src/app/(admin)/admin/taxonomies/[taxonomyId]/TermManager.tsx
src/app/(admin)/admin/post-types/[postTypeId]/page.tsx  (fix site.collections)
src/app/(admin)/admin/post-types/[postTypeId]/entries/page.tsx
src/app/(admin)/admin/collections/[collectionId]/entries/page.tsx
src/components/admin/layout/AdminSidebar.tsx
```

## Décisions

- **Filtrage en mémoire** pour search admin (pas de `mode: 'insensitive'` Prisma — non supporté en SQLite)
- **`prisma generate --schema=prisma/sqlite/schema.prisma`** — régénération client nécessaire après refactor mono-site
- **Taxonomies sans locale** — les termes sont globaux, la locale ne filtre que les entrées

## Problèmes résolus

- `StringFilter.mode` n'existe pas dans Prisma v7 / SQLite → filtrage JS en mémoire
- `skipDuplicates` non supporté sur SQLite dans `createMany` → supprimé (delete-all first)
- Client Prisma stale (encore `siteId` sur Taxonomy) → `prisma generate` avec le bon schéma

## Dette restante (hors scope S06)

- `prisma/seed.ts` — à réécrire entièrement (toujours multi-site)
- `src/app/(admin)/admin/page.tsx` — dashboard contient `prisma.site`
- `src/app/api/cron/publish/route.ts` — `siteId` stale
- `src/app/(admin)/admin/collections/page.tsx` — props `sites`/`tabs` stale
- `src/app/(admin)/admin/post-types/page.tsx` — idem
- `src/lib/actions/members.ts` — `SiteMember` à migrer
