# S07 — Migration GrapesJS → Puck

**Statut :** DONE

## Pourquoi

GrapesJS génère du HTML brut injecté via `dangerouslySetInnerHTML`. C'est une friction structurelle dans un stack Next.js/React :

| Problème | Impact |
|----------|--------|
| Output = HTML string | `dangerouslySetInnerHTML` partout, pas de SSR React propre |
| Blocs = strings HTML | Pas de TypeScript, pas de props, pas de design system natif |
| CSS séparé | Injection `<style>` manuelle, conflits potentiels |
| Pas React-natif | Import dynamique forcé, `ssr: false`, contournements constants |

**Puck** résout tout cela : React-natif, blocs = composants typés, output = JSON de composants, rendu via `<Render data={...} />`.

## Périmètre

### Supprimer
- `StudioEditor.tsx` — logique GrapesJS complète
- `src/lib/site/renderer.ts` — `renderPageJson()` plus nécessaire
- Dépendance `grapesjs` + `grapesjs/dist/css/grapes.min.css`

### Créer
- `src/lib/puck/config.tsx` — configuration Puck : définition de tous les composants/blocs
- `src/lib/puck/render.tsx` — `<PuckRenderer data={...} />` pour le site public
- `src/app/(studio)/studio/[pageId]/StudioEditor.tsx` — réécrit avec `<Puck>`

### Modifier
- `src/app/(site)/[locale]/[...slug]/page.tsx` — remplacer `renderPageJson()` par `<PuckRenderer>`
- `src/lib/actions/pages.ts` — `savePageDraftAction` inchangé (stocke toujours du JSON)
- `src/app/api/studio/blocks/route.ts` — adapter les GlobalBlocks au format Puck

## Architecture Puck

### Config (`src/lib/puck/config.tsx`)

```tsx
import type { Config } from '@measured/puck'

export const puckConfig: Config = {
  components: {
    Section: {
      fields: { background: { type: 'text' } },
      render: ({ background, puck: { renderDropZone } }) => (
        <section style={{ background }}>
          {renderDropZone({ zone: 'content' })}
        </section>
      ),
    },
    Text: {
      fields: { content: { type: 'textarea' }, size: { type: 'select', options: [...] } },
      render: ({ content, size }) => <p style={{ fontSize: size }}>{content}</p>,
    },
    // ... autres composants
  },
}
```

### Studio (`StudioEditor.tsx`)

```tsx
'use client'
import { Puck } from '@measured/puck'
import '@measured/puck/puck.css'
import { puckConfig } from '@/lib/puck/config'

export default function StudioEditor({ pageId, initialData }) {
  return (
    <Puck
      config={puckConfig}
      data={initialData ?? { content: [], root: {} }}
      onPublish={async (data) => {
        await savePageDraftAction(pageId, data)
        await publishPageAction(pageId)
      }}
    />
  )
}
```

### Rendu site (`PuckRenderer`)

```tsx
import { Render } from '@measured/puck'
import { puckConfig } from '@/lib/puck/config'

export function PuckRenderer({ data }: { data: unknown }) {
  if (!data) return null
  return <Render config={puckConfig} data={data as Data} />
}
```

## Composants à définir

| Composant | Champs | Notes |
|-----------|--------|-------|
| `Hero` | title, subtitle, cta (text+url), background | DropZone optionnelle |
| `Section` | background, padding | DropZone `content` |
| `Columns` | count (2/3), gap | DropZones par colonne |
| `Text` | content, size, align, color | Inline editing |
| `Heading` | text, level (1-4), align | |
| `Image` | src (media picker), alt, width | |
| `Button` | label, href, variant | |
| `Divider` | color, margin | |
| `RichText` | html | Éditeur richtext inline |
| `Video` | url | YouTube/Vimeo embed |
| `Features` | title, items (repeat) | |
| `GlobalBlock` | blockId | Référence à un GlobalBlock |

## GlobalBlocks dans Puck

Option A — Composant `GlobalBlock` qui fetch et rend le JSON du bloc  
Option B — Les blocs globaux sont copiés comme composants Puck normaux au moment de l'ajout

→ **Option A** recommandée : un seul endroit pour modifier le bloc, propagation automatique.

## Format données

Puck stocke :
```json
{
  "content": [
    { "type": "Hero", "props": { "title": "Bienvenue", "subtitle": "..." } },
    { "type": "Section", "props": { "background": "#fff" }, "zones": { "content": [...] } }
  ],
  "root": { "props": {} }
}
```

Ce JSON est stocké dans `page.draftJson` / `page.publishedJson` — identique à avant, seul le format change.

## Tâches

- [x] `npm install @measured/puck` (v0.20.2)
- [x] Créer `src/lib/puck/config.tsx` avec tous les composants
- [x] Réécrire `StudioEditor.tsx` — `<Puck>` + `overrides.header` custom toolbar
- [x] Créer `src/lib/puck/render.tsx` — `<PuckRenderer>` client component
- [x] Mettre à jour `[...slug]/page.tsx` — `renderPageJson` → `<PuckRenderer>`
- [x] Mettre à jour `preview/[token]/page.tsx` — idem
- [x] Supprimer `src/lib/site/renderer.ts`
- [x] Remplacer `grapesjsPlugin` par `puckPlugin` dans `src/plugins/`
- [x] `npm uninstall grapesjs`
- [ ] Tester save / publish / preview (à valider en dev)
