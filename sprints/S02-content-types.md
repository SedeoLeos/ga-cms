# S02 — Collections, Post Types, Entry Editors

**Statut :** DONE

## Objectif

Construire le système de contenu structuré : collections (données JSON libres) et post types (articles avec slug, statut, taxonomies), avec leurs éditeurs d'entrées complets.

## Livré

### Collections
- Liste des collections (`/admin/collections`)
- Éditeur de schéma via `SchemaBuilder` — champs drag-and-drop (text, textarea, richtext, number, boolean, date, select, media, relation)
- Liste des entrées (`/admin/collections/[id]/entries`) avec `EntriesList`
- Éditeur d'entrée (`/admin/collections/[id]/entries/[entryId]`) — formulaire généré depuis le schéma

### Post Types
- Liste des post types (`/admin/post-types`)
- Éditeur de schéma — réutilise `SchemaBuilder`
- Liste des billets (`/admin/post-types/[id]/entries`) avec `PostEntriesList`
- Éditeur de billet (`/admin/post-types/[id]/entries/[entryId]`) — `PostEntryForm` avec sidebar statut/locale/dates

### Partagé
- `SchemaBuilder` — constructeur de schéma JSON réutilisable
- `MediaPickerField` — sélecteur de média dans les formulaires
- Server actions : `createPostEntryAndRedirect`, `updatePostEntryAction`, `updatePostEntryStatusAction`, `deletePostEntryAction`

## Fichiers clés

```
src/components/admin/collections/SchemaBuilder.tsx
src/components/admin/collections/EntriesList.tsx
src/components/admin/post-types/PostEntriesList.tsx
src/components/admin/post-types/PostEntryForm.tsx
src/lib/actions/collections.ts
src/lib/actions/entries.ts
src/lib/actions/post-entries.ts
src/lib/actions/post-types.ts
src/app/(admin)/admin/collections/
src/app/(admin)/admin/post-types/
```

## Décisions

- **Schéma JSON** stocké en colonne `Json` Prisma — flexible, pas de migration par ajout de champ
- **Formulaire généré dynamiquement** depuis le schéma — un seul composant `FieldInput` couvre tous les types
- **Status workflow** : DRAFT → PUBLISHED → ARCHIVED, avec actions directes depuis la sidebar
- **Slug auto-généré** depuis le titre, éditable manuellement

## Problèmes résolus

- `noNonNullAssertion` Biome sur les refs — extrait vers une const avant usage
- Import order Biome — `biome check --write` systématique
