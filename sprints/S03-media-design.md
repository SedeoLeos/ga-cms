# S03 — Media, Design Tokens, Global Blocks

**Statut :** DONE

## Objectif

Construire la bibliothèque de médias uploadable, le système de design tokens CSS, et les blocs globaux réutilisables dans le studio.

## Livré

### Media Library
- Upload fichiers (`/api/upload`) — stockage local `/public/uploads/`
- Liste des médias (`/admin/media`) avec grille et sélecteur
- `MediaPickerField` — champ réutilisable dans tous les formulaires d'entrées
- Modèle Prisma `MediaFile` + `MediaFolder`

### Design Tokens
- Éditeur de tokens (`/admin/design-system`) — couleurs, spacing, typographie, border-radius, shadows
- API `/api/tokens` — retourne les tokens sous forme de CSS custom properties (`--color-primary: #4353ff`)
- Modèle Prisma `DesignToken`

### Global Blocks
- Liste des blocs globaux (`/admin/global-blocks`)
- CRUD : créer, éditer JSON, supprimer
- API `/api/studio/blocks` — retourne les blocs pour injection dans le studio
- Modèle Prisma `GlobalBlock`

### Membres
- Liste des membres (`/admin/members`)
- Modèle Prisma `SiteMember`

## Fichiers clés

```
src/app/(admin)/admin/media/page.tsx
src/app/(admin)/admin/design-system/page.tsx
src/app/(admin)/admin/global-blocks/page.tsx
src/app/(admin)/admin/members/page.tsx
src/app/api/upload/route.ts
src/app/api/tokens/route.ts
src/app/api/studio/blocks/route.ts
src/components/admin/media/MediaPickerField.tsx
src/lib/actions/media.ts
src/lib/actions/design-tokens.ts
src/lib/actions/global-blocks.ts
```

## Décisions

- **Upload local** vers `/public/uploads/` — simple et fonctionnel, S3/Cloudflare R2 en option future
- **Design tokens en CSS custom properties** — injectés via `<link rel="stylesheet" href="/api/tokens">` dans le studio et le site
- **Global Blocks comme JSON brut** — le studio les ajoute au `BlockManager` de GrapesJS au runtime
