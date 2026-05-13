# S05 — Studio GrapesJS

**Statut :** DONE — à migrer vers Puck (voir S07)

## Objectif

Construire l'éditeur visuel de pages avec GrapesJS : drag-and-drop de blocs, save/publish, preview, intégration des GlobalBlocks.

## Livré

- **`StudioEditor`** — éditeur GrapesJS complet
  - Import dynamique (`next/dynamic`, `ssr: false`)
  - Panels custom : blocs, styles, layers, traits
  - 14 blocs intégrés : Section, 2 colonnes, 3 colonnes, Texte, H1/H2/H3, Image, Bouton, Lien, Séparateur, Vidéo, Hero, Features
  - Device manager : Desktop / Tablet / Mobile
  - Canvas avec injection des design tokens via `href="/api/tokens"`
  - GlobalBlocks chargés depuis `/api/studio/blocks` au runtime
- **Cmd+S** — raccourci clavier pour sauvegarder
- **Actions** : `savePageDraftAction`, `publishPageAction`
- **Preview** : `generatePreviewTokenAction` → `window.open` sur route Next.js directe avec token (pas d'iframe)
- **Toast** — feedback succès/erreur
- **Renderer** (`src/lib/site/renderer.ts`) — `renderPageJson()` extrait HTML + CSS du format GrapesJS v0.22
- **Route preview** — `/preview/[pageId]?token=...`

## Fichiers clés

```
src/app/(studio)/studio/[pageId]/page.tsx
src/app/(studio)/studio/[pageId]/StudioEditor.tsx
src/lib/actions/pages.ts
src/lib/site/renderer.ts
src/app/api/studio/blocks/route.ts
src/app/(preview)/preview/[pageId]/page.tsx
```

## Décisions

- **GrapesJS v0.22** — `storageManager: false`, `panels: { defaults: [] }`, panels appendés manuellement
- **Format données** : `getProjectData()` → stocké en `draftJson`, copié en `publishedJson` à la publication
- **Compat format legacy** : `extractComponents()` gère les deux formats GrapesJS (v0.21 et v0.22)

## Problèmes résolus

- `dangerouslySetInnerHTML` sur `<style>` — `renderStyles()` retourne du CSS brut, pas enveloppé
- `noNonNullAssertion` sur `containerRef.current` — extrait vers `const container` avant `grapesjs.init()`
- `useExhaustiveDependencies` — `handlePreview` en fonction simple (pas `useCallback`)
- Biome `biome-ignore` doit être sur la ligne directement au-dessus de la violation

## Pourquoi migrer vers Puck (S07)

GrapesJS génère du HTML brut injecté via `dangerouslySetInnerHTML`. Dans un stack Next.js/React :
- Pas de SSR propre
- Design tokens et composants partagés difficiles à connecter
- Pas de TypeScript sur les blocs
- Friction permanente avec l'App Router

Puck stocke les pages comme un arbre de composants React → `<Render data={...} />` côté site, zéro injection HTML.
