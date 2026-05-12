# Tatomir — Visual CMS Platform

**Version:** 0.3  
**Date:** 2026-05-12  
**Stack:** Next.js 16 · GrapesJS OSS · Tailwind v4 · Prisma · Lucide React

---

## Table of Contents

1. [Vision](#1-vision)
2. [Architecture — Single Next.js App](#2-architecture--single-nextjs-app)
3. [Folder Structure](#3-folder-structure)
4. [Route Architecture](#4-route-architecture)
5. [Internal Module System](#5-internal-module-system)
6. [Technology Stack](#6-technology-stack)
7. [Webflow-Identical Editor UI](#7-webflow-identical-editor-ui)
8. [Block Library & Symbols](#8-block-library--symbols)
9. [Advanced Post Types & Blog](#9-advanced-post-types--blog)
10. [Multi-Provider Database](#10-multi-provider-database)
11. [Site Authentication & Member Areas](#11-site-authentication--member-areas)
12. [Internationalisation](#12-internationalisation)
13. [Custom UI Component System](#13-custom-ui-component-system)
14. [Sprint Plan](#14-sprint-plan)
15. [Sprint Specifications](#15-sprint-specifications)
16. [Database Schema](#16-database-schema)
17. [Performance Strategy](#17-performance-strategy)
18. [Deployment](#18-deployment)

---

## 1. Vision

Tatomir is a self-hosted visual CMS — one Next.js application, one `vercel deploy`.

| Pillar | Target |
|--------|--------|
| Single app | Admin + Studio + public renderer in one Next.js 16 project |
| Visual editor | Webflow-identical design — GrapesJS OSS engine + full custom React UI |
| Icons | Lucide React everywhere — zero emojis in any UI surface |
| Animations | GSAP ScrollTrigger + Framer Motion + interaction builder |
| Block library | Reusable global blocks (Symbols) + built-in block presets |
| Post types | Blog, Portfolio, Team + custom ACF-style types with taxonomies |
| Site auth | Per-site member areas, protected pages, auth pages designed in editor |
| Multi-DB | Prisma — PostgreSQL, MySQL, Supabase, SQLite via one env var |
| Multi-lang | Admin i18n, editor i18n, site content — fully segmented |
| Deploy | `vercel deploy` — one command, zero config |

---

## 2. Architecture — Single Next.js App

No monorepo. No Turborepo. One `package.json`. One deployment unit.

All concerns — admin dashboard, visual editor, public site renderer — live in a single Next.js 16 App Router project. They are separated by **route groups** and share code through **internal modules** under `src/lib/`.

```
One Next.js app handles:

  /admin/**          Admin dashboard (auth-protected, server-rendered)
  /studio/**         Visual page editor (auth-protected, heavy client bundle)
  /*                 Public site renderer (multi-tenant, edge-cached, PPR)

middleware.ts routes:
  - Custom domain (e.g., client.com)  → resolves siteId, renders public site
  - tatomir.app/admin/**              → admin dashboard, checks admin session
  - tatomir.app/studio/**             → editor, checks admin session
  - tatomir.app/**                    → platform marketing / default site
```

### Why not a monorepo

- One `vercel deploy` pushes everything. No project linking, no build pipeline config.
- No `pnpm-workspace.yaml`, no `turbo.json`, no cross-package version management.
- Shared code lives in `src/lib/` — imported with path aliases, zero overhead.
- A junior dev can clone, `npm install`, `npm run dev` and be productive immediately.
- Vercel detects a Next.js root, auto-configures. Nothing to override.

### Trade-off acknowledged

The GrapesJS editor bundle (~600kb gzipped) is large. It is **never loaded on public site pages** — it is dynamically imported with `ssr: false` exclusively in the `/studio/**` route group. Public visitors never pay for it. The Next.js bundle splitter handles this automatically via route-based code splitting.

---

## 3. Folder Structure

```
tatomir/
├── src/
│   ├── app/                        Next.js App Router
│   │   ├── (admin)/                Route group — admin dashboard
│   │   │   └── admin/
│   │   │       ├── layout.tsx      Admin shell layout
│   │   │       ├── page.tsx        Dashboard
│   │   │       ├── auth/
│   │   │       │   ├── login/
│   │   │       │   └── forgot-password/
│   │   │       ├── sites/
│   │   │       ├── collections/
│   │   │       │   └── [collectionId]/
│   │   │       │       └── [entryId]/
│   │   │       ├── post-types/
│   │   │       │   ├── [postTypeId]/
│   │   │       │   │   └── [postId]/
│   │   │       │   └── taxonomies/
│   │   │       ├── media/
│   │   │       ├── pages/
│   │   │       ├── design-system/
│   │   │       └── settings/
│   │   │           ├── members/
│   │   │           ├── auth/
│   │   │           ├── domains/
│   │   │           └── billing/
│   │   │
│   │   ├── (studio)/               Route group — visual editor
│   │   │   └── studio/
│   │   │       ├── layout.tsx      Studio shell (minimal, no admin chrome)
│   │   │       └── [siteId]/
│   │   │           └── [pageId]/
│   │   │               ├── page.tsx
│   │   │               └── loading.tsx
│   │   │
│   │   ├── (site)/                 Route group — public site renderer
│   │   │   └── [locale]/
│   │   │       ├── layout.tsx      Site layout (from CMS global layout block)
│   │   │       ├── [...slug]/
│   │   │       │   ├── page.tsx
│   │   │       │   ├── loading.tsx
│   │   │       │   └── not-found.tsx
│   │   │       └── auth/           Site member auth pages
│   │   │           ├── login/
│   │   │           ├── register/
│   │   │           ├── reset-password/
│   │   │           └── dashboard/
│   │   │
│   │   ├── api/                    API routes
│   │   │   ├── auth/[...nextauth]/ Auth.js handler
│   │   │   ├── upload/             Media upload endpoint
│   │   │   ├── preview/            Signed preview URL handler
│   │   │   └── og/                 OG image generation (@vercel/og)
│   │   │
│   │   ├── layout.tsx              Root layout (fonts, providers)
│   │   └── globals.css             Global styles + Tailwind imports
│   │
│   ├── components/                 React components
│   │   ├── ui/                     Custom UI kit (zero native components)
│   │   │   ├── button/
│   │   │   ├── input/
│   │   │   ├── select/
│   │   │   ├── switch/
│   │   │   ├── dialog/
│   │   │   ├── drawer/
│   │   │   ├── dropdown/
│   │   │   ├── tabs/
│   │   │   ├── scroll-area/
│   │   │   ├── tooltip/
│   │   │   ├── toast/
│   │   │   ├── color-picker/
│   │   │   ├── date-picker/
│   │   │   ├── combobox/
│   │   │   ├── slider/
│   │   │   └── ...
│   │   │
│   │   ├── admin/                  Admin-specific components
│   │   │   ├── layout/
│   │   │   │   ├── sidebar.tsx
│   │   │   │   ├── topbar.tsx
│   │   │   │   └── breadcrumb.tsx
│   │   │   ├── collections/
│   │   │   ├── post-types/
│   │   │   ├── media/
│   │   │   └── settings/
│   │   │
│   │   ├── editor/                 Visual editor components
│   │   │   ├── canvas/             GrapesJS canvas bridge
│   │   │   ├── toolbar/            Top toolbar
│   │   │   ├── left-panel/
│   │   │   │   ├── elements/       Block library panel
│   │   │   │   ├── navigator/      Layer tree panel
│   │   │   │   ├── cms/            CMS bindings panel
│   │   │   │   ├── assets/         Media panel
│   │   │   │   └── pages/          Pages panel
│   │   │   ├── right-panel/
│   │   │   │   ├── style/          Style panel (layout, spacing, typo...)
│   │   │   │   ├── settings/       Component settings panel
│   │   │   │   ├── interactions/   Animation builder panel
│   │   │   │   └── seo/            SEO panel
│   │   │   └── context-menu/
│   │   │
│   │   ├── blocks/                 CMS block components (used in editor + renderer)
│   │   │   ├── layout/
│   │   │   │   ├── section/
│   │   │   │   ├── container/
│   │   │   │   ├── grid/
│   │   │   │   └── columns/
│   │   │   ├── typography/
│   │   │   │   ├── heading/
│   │   │   │   ├── paragraph/
│   │   │   │   └── rich-text/
│   │   │   ├── media/
│   │   │   │   ├── image/
│   │   │   │   ├── video/
│   │   │   │   └── lottie/
│   │   │   ├── navigation/
│   │   │   ├── cms/
│   │   │   │   ├── collection-loop/
│   │   │   │   ├── cms-text/
│   │   │   │   ├── cms-image/
│   │   │   │   └── conditional/
│   │   │   ├── forms/
│   │   │   ├── members/
│   │   │   │   ├── login-form/
│   │   │   │   ├── register-form/
│   │   │   │   ├── gated-content/
│   │   │   │   └── member-dashboard/
│   │   │   └── interactive/
│   │   │       ├── tabs/
│   │   │       ├── accordion/
│   │   │       └── carousel/
│   │   │
│   │   └── site/                   Public renderer components
│   │       ├── page-renderer.tsx   Renders page JSON → React tree
│   │       ├── symbol-renderer.tsx Resolves global blocks
│   │       └── interaction-runtime.tsx GSAP runtime init
│   │
│   ├── lib/                        Internal modules (the "packages")
│   │   ├── db/
│   │   │   ├── client.ts           Prisma client singleton
│   │   │   ├── queries/            All DB query functions
│   │   │   │   ├── pages.ts
│   │   │   │   ├── collections.ts
│   │   │   │   ├── post-types.ts
│   │   │   │   ├── media.ts
│   │   │   │   ├── sites.ts
│   │   │   │   ├── members.ts
│   │   │   │   └── tokens.ts
│   │   │   └── mutations/          All DB mutation functions
│   │   │       ├── pages.ts
│   │   │       ├── collections.ts
│   │   │       └── ...
│   │   │
│   │   ├── auth/
│   │   │   ├── admin-auth.ts       Auth.js config for admin users
│   │   │   ├── site-auth.ts        Auth logic for site members
│   │   │   └── permissions.ts      Role checks
│   │   │
│   │   ├── cms/
│   │   │   ├── collections.ts      Collection data API
│   │   │   ├── post-types.ts       Post type data API
│   │   │   ├── pages.ts            Page data API
│   │   │   ├── variables.ts        CMS variables
│   │   │   ├── storage/            Media storage adapters
│   │   │   │   ├── adapter.ts      Interface
│   │   │   │   ├── uploadthing.ts
│   │   │   │   ├── supabase.ts
│   │   │   │   ├── vercel-blob.ts
│   │   │   │   └── minio.ts
│   │   │   └── resolver.ts         Resolves CMS bindings in page JSON
│   │   │
│   │   ├── editor/
│   │   │   ├── grapesjs-config.ts  GrapesJS init options
│   │   │   ├── block-registry.ts   Registers all blocks into GrapesJS
│   │   │   ├── storage-plugin.ts   GrapesJS ↔ Server Actions bridge
│   │   │   └── event-bridge.ts     GrapesJS events → React state
│   │   │
│   │   ├── animations/
│   │   │   ├── compiler.ts         Interaction JSON → GSAP timeline code
│   │   │   └── presets.ts          Built-in animation presets
│   │   │
│   │   ├── i18n/
│   │   │   ├── config.ts           next-intl config, supported locales
│   │   │   └── request.ts          next-intl server request config
│   │   │
│   │   └── utils/
│   │       ├── slugify.ts
│   │       ├── reading-time.ts
│   │       ├── og-image.ts
│   │       └── cn.ts               clsx + tailwind-merge helper
│   │
│   ├── actions/                    Next.js Server Actions
│   │   ├── pages.ts
│   │   ├── collections.ts
│   │   ├── post-types.ts
│   │   ├── media.ts
│   │   ├── sites.ts
│   │   ├── auth.ts
│   │   └── members.ts
│   │
│   ├── hooks/                      Client-side React hooks
│   │   ├── use-toast.ts
│   │   ├── use-editor-state.ts     Zustand editor store
│   │   ├── use-member-session.ts
│   │   └── use-debounce.ts
│   │
│   ├── types/                      TypeScript types
│   │   ├── page.ts                 PageModel, BlockNode, etc.
│   │   ├── cms.ts                  FieldDefinition, CollectionSchema
│   │   ├── editor.ts               EditorState, PanelState
│   │   ├── auth.ts                 Session, MemberSession
│   │   └── index.ts                Re-exports
│   │
│   └── config/
│       ├── blocks.ts               Block library config (categories, order)
│       ├── post-types.ts           Built-in post type definitions
│       └── tokens.ts               Default design token values
│
├── locales/                        i18n message files
│   ├── admin/
│   │   ├── en/
│   │   │   ├── auth.json
│   │   │   ├── common.json
│   │   │   ├── collections.json
│   │   │   ├── post-types.json
│   │   │   ├── media.json
│   │   │   ├── pages.json
│   │   │   ├── settings.json
│   │   │   ├── users.json
│   │   │   ├── members.json
│   │   │   ├── dashboard.json
│   │   │   ├── design-system.json
│   │   │   └── notifications.json
│   │   └── fr/
│   │       └── (same structure)
│   └── editor/
│       ├── en/
│       │   ├── toolbar.json
│       │   ├── panels.json
│       │   ├── blocks.json
│       │   ├── styles.json
│       │   ├── animations.json
│       │   ├── interactions.json
│       │   ├── layers.json
│       │   ├── seo.json
│       │   ├── typography.json
│       │   └── errors.json
│       └── fr/
│           └── (same structure)
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── public/
│   ├── fonts/
│   └── images/
│
├── .env.example
├── .env.local                      (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── middleware.ts
├── biome.json
└── package.json
```

---

## 4. Route Architecture

### Route Groups

Three route groups share one Next.js app but have independent layouts and bundle strategies:

```ts
// src/app/(admin)/admin/layout.tsx
// — dark admin shell, sidebar + topbar
// — requires adminSession (redirects to /admin/auth/login)
// — loads admin i18n namespace

// src/app/(studio)/studio/[siteId]/[pageId]/page.tsx
// — minimal chrome layout, editor fills viewport
// — requires adminSession
// — GrapesJS loaded via dynamic() — stays out of admin/site bundles

// src/app/(site)/[locale]/[...slug]/page.tsx
// — no chrome, pure site content
// — PPR enabled
// — GrapesJS NEVER imported here
```

### Middleware

```ts
// middleware.ts
export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const pathname = request.nextUrl.pathname

  // 1. Custom domain → route to site renderer
  if (!hostname.includes('tatomir.app')) {
    // Lookup siteId from hostname, rewrite to /(site) route group
    return resolveSite(hostname, pathname, request)
  }

  // 2. Admin routes → session check
  if (pathname.startsWith('/admin') || pathname.startsWith('/studio')) {
    return requireAdminSession(request)
  }

  // 3. Locale detection for site routes
  return handleLocale(request)
}
```

### Path Aliases (tsconfig.json)

```json
{
  "compilerOptions": {
    "paths": {
      "@/components/*": ["./src/components/*"],
      "@/lib/*":        ["./src/lib/*"],
      "@/actions/*":    ["./src/actions/*"],
      "@/hooks/*":      ["./src/hooks/*"],
      "@/types/*":      ["./src/types/*"],
      "@/config/*":     ["./src/config/*"]
    }
  }
}
```

No barrel file hell. Every import is explicit by path.

---

## 5. Internal Module System

`src/lib/` is the "packages" layer — clean, typed, no circular dependencies.

### Dependency rules

```
app/             → can import from components/, lib/, actions/, hooks/, types/
components/      → can import from lib/, hooks/, types/
actions/         → can import from lib/, types/
lib/             → can import from types/ only (no upward imports)
types/           → no imports (pure types)
```

Never import `actions/` from `lib/`. Never import `components/` from `lib/`. These rules are enforced by ESLint `import/no-restricted-paths` plugin (via Biome custom rules).

### lib/db — Database access

All Prisma queries are functions in `src/lib/db/queries/` and `src/lib/db/mutations/`. No raw Prisma calls outside of this folder.

```ts
// src/lib/db/queries/pages.ts
import "use cache"
export async function getPublishedPage(siteId: string, slug: string, locale: string) {
  "use cache"
  return prisma.page.findFirst({
    where: { siteId, slug, locale, status: "PUBLISHED" },
    select: { publishedJson: true, metaTitle: true, metaDesc: true }
  })
}
```

### lib/cms — Content API

The CMS module provides a typed, provider-agnostic API consumed by both the renderer and the admin:

```ts
import { getEntries, getEntry, createEntry, updateEntry } from "@/lib/cms/collections"
import { getPosts, getPost }                              from "@/lib/cms/post-types"
import { getCmsVariable }                                from "@/lib/cms/variables"
```

### lib/editor — GrapesJS bridge

GrapesJS is never imported in this file — only type definitions and configuration objects that are lazy-loaded by the studio route:

```ts
// src/lib/editor/grapesjs-config.ts
export function buildGrapesConfig(pageJson: PageModel, siteId: string) {
  return {
    container: '#gjs',
    storageManager: false,  // we handle storage via Server Actions
    plugins: [],            // registered lazily in the studio route
    components: pageJson,
  }
}
```

### lib/animations — GSAP compiler

```ts
// src/lib/animations/compiler.ts
// Input:  page JSON with interaction descriptors
// Output: GSAP script string injected as <script> in the rendered page
export function compileInteractions(pageJson: PageModel): string
```

---

## 6. Technology Stack

### Core

| Layer | Library | Why |
|-------|---------|-----|
| Framework | Next.js 16 | App Router, PPR, Server Actions, `use cache` |
| Language | TypeScript 5.8 | Strict mode, path aliases |
| Styling | Tailwind v4 | CSS vars via `@theme`, JIT |
| Database ORM | Prisma 6 | Multi-provider, type-safe, migrations |
| Auth (admin) | Auth.js v5 | Next.js native, credentials + OAuth |
| Linter/Formatter | Biome | Faster than ESLint+Prettier, single config |

### Editor

| Layer | Library | Why |
|-------|---------|-----|
| Editor engine | GrapesJS 0.22 OSS | Battle-tested, full canvas API, BSD-3 |
| Rich text | TipTap 2 | Headless, extensible, ProseMirror-based |
| Code block | Monaco Editor | Industry standard, lazy-loaded |
| Lottie | @lottiefiles/react-lottie-player | Lightweight Lottie renderer |

### UI Primitives

| Layer | Library | Why |
|-------|---------|-----|
| Accessibility | Radix UI Primitives | Unstyled, keyboard/ARIA correct |
| Animations | Framer Motion | Declarative, layout animations |
| Popover/tooltip | Floating UI | Best-in-class positioning |
| Color picker | react-colorful | Tiny (2.8kb), headless |
| Date picker | react-day-picker | Accessible, no native input |
| Icons | Lucide React | Tree-shakable, 1400+ icons |

### Data & State

| Layer | Library | Why |
|-------|---------|-----|
| Server state | TanStack Query v5 | Cache, mutations, optimistic UI |
| Editor state | Zustand | Lightweight, outside React tree |
| Forms | react-hook-form + Zod | Performant, schema-driven |
| Tables | TanStack Table v9 | Headless, virtualisable |
| Virtual lists | TanStack Virtual v3 | Layers panel (1000+ nodes) |

### Site / Performance

| Layer | Library | Why |
|-------|---------|-----|
| Scroll animations | GSAP + ScrollTrigger | Most capable, free for commercial use |
| Page transitions | Framer Motion AnimatePresence | Route transitions |
| OG images | @vercel/og | Edge-rendered, fast |
| Media upload | Uploadthing v7 | Vercel-friendly, simple |
| Email | Resend + React Email | Transactional, React templates |

---

## 7. Webflow-Identical Editor UI

### Layout (exact dimensions)

```
┌────────────────────────────────────────────────────────────────────┐
│  TOOLBAR  48px                                                     │
│  [logo][Site▾][Page▾]    [Mobile][Tablet][Desktop]    [↩][↪]  [Preview][Publish] │
├──────────┬─────────────────────────────────────┬───────────────────┤
│          │                                     │                   │
│  LEFT    │                                     │   RIGHT           │
│  240px   │        CANVAS                       │   240px           │
│          │        (GrapesJS)                   │                   │
│  icon    │                                     │   icon tabs top   │
│  tabs    │   selected element: blue border     │                   │
│  bottom  │   + handles + dimension badge       │   Style /         │
│          │                                     │   Settings /      │
│  Elem.   │                                     │   Interact. /     │
│  Nav.    │                                     │   SEO             │
│  CMS     │                                     │                   │
│  Assets  │                                     │                   │
│  Pages   │                                     │                   │
└──────────┴─────────────────────────────────────┴───────────────────┘
```

### Color tokens (editor chrome)

```css
/* src/app/globals.css — editor-specific vars */
.editor-chrome {
  --editor-bg:           #1a1a2a;
  --panel-bg:            #1e1e2e;
  --panel-bg-hover:      #252538;
  --panel-border:        #2e2e42;
  --panel-section-bg:    #16161f;
  --canvas-bg:           #d9d9d9;
  --select-blue:         #4353ff;
  --select-blue-fill:    rgba(67, 83, 255, 0.12);
  --text-primary:        #e8e8f0;
  --text-secondary:      #9191a8;
  --text-disabled:       #4e4e60;
  --accent:              #4353ff;
  --accent-hover:        #5563ff;
  --destructive:         #ff4444;
  --input-bg:            #2a2a3e;
  --input-border:        #3a3a52;
  --input-border-focus:  #4353ff;
  --font-ui:             'Inter', system-ui, sans-serif;
  --text-xs:             11px;
  --text-sm:             12px;
  --text-base:           13px;
}
```

### Icon map (Lucide — all 16px, strokeWidth 1.5)

| Section | Icon name |
|---------|-----------|
| Elements panel | `LayoutGrid` |
| Navigator panel | `Layers` |
| CMS panel | `Database` |
| Assets panel | `Image` |
| Pages panel | `Globe` |
| Style tab | `Paintbrush` |
| Settings tab | `Settings2` |
| Interactions tab | `Zap` |
| SEO tab | `Search` |
| Undo | `Undo2` |
| Redo | `Redo2` |
| Preview | `Eye` |
| Publish | `Globe` |
| Mobile device | `Smartphone` |
| Tablet device | `Tablet` |
| Desktop device | `Monitor` |
| Layer visible | `Eye` |
| Layer hidden | `EyeOff` |
| Layer locked | `Lock` |
| Convert to symbol | `Bookmark` |
| Link/bind CMS | `Link2` |
| Unlink | `Unlink` |
| Add | `Plus` |
| Delete | `Trash2` |
| Duplicate | `Copy` |
| Edit | `Pencil` |

---

## 8. Block Library & Symbols

### Block anatomy

Each block is a self-contained folder under `src/components/blocks/{category}/{name}/`:

```
src/components/blocks/layout/section/
├── index.tsx          React component — renders in canvas AND public site
├── block.ts           GrapesJS block descriptor
├── settings.tsx       Settings panel (right panel > Settings tab)
└── schema.ts          Zod schema for this block's props
```

`index.tsx` is a shared component — the same file renders in the GrapesJS canvas and on the public site. No duplication.

`block.ts` exports the GrapesJS block config:

```ts
export const sectionBlock = {
  id: 'section',
  label: 'Section',           // shown in Elements panel
  category: 'Layout',
  content: { type: 'section' },
  // media: inline SVG icon string (shown in Elements panel grid)
}
```

### Block categories

```
Layout        Section, Container, Grid, Flex, Columns, Spacer, Divider
Typography    Heading (H1-H6), Paragraph, Rich Text, Link, Label, Blockquote
Media         Image, Video, Lottie, Icon, SVG, Background Video
Navigation    Navbar, Link, Logo, Burger Menu, Breadcrumb, Pagination
CMS           Collection Loop, CMS Text, CMS Image, CMS Link, CMS Rich Text, Conditional
Forms         Form, Text Input, Email Input, Textarea, Select, Checkbox, Submit
Members       Login Form, Register Form, Reset Password, Member Dashboard, Gated Content
Interactive   Tabs, Accordion, Modal, Tooltip trigger, Carousel, Marquee, Counter
```

### Symbol (Global Block) system

A Symbol is a Global Block — defined once, reused across pages, instances synced to master.

**Creating a symbol:**
1. Right-click any element on canvas → "Convert to Symbol"
2. Name dialog → saved to DB as `GlobalBlock`
3. All existing instances of that element on any page become references

**Symbol instance rendering:**
```ts
// PageModel node for a symbol instance:
{
  type: "symbol-instance",
  symbolId: "clx...",
  overrides: {
    "heading-text": "Custom override text for this page"
  }
}
```

At render time, `src/components/site/symbol-renderer.tsx` merges `masterJson` with `overrides`.

**Editing a symbol:**
- In Navigator, symbol instances show a `<Bookmark />` icon
- Clicking "Edit Symbol" opens the master in a special canvas mode with a blue banner: "Editing shared Symbol — changes apply everywhere"
- Overriding a field in instance settings shows `<Unlink />` icon indicating local override

---

## 9. Advanced Post Types & Blog

### Built-in post types

Pre-installed on every new site. Schema is fixed but the field list is extended in the post type builder.

| Slug | Name | Key fields |
|------|------|-----------|
| `blog-post` | Blog | title, slug, content (rich text), excerpt, featured image, author, publishedAt, category[], tag[] |
| `portfolio` | Portfolio | title, slug, description, cover image, gallery[], client, year, tags[], link |
| `team-member` | Team | name, role, bio, photo, social links[], order |
| `testimonial` | Testimonials | author, role, company, avatar, quote, rating |
| `faq` | FAQ | question, answer, category, order |
| `event` | Events | title, date, end date, location, description, image, registration link |
| `job` | Jobs | title, department, location, type, description, apply link, active |

### Custom post types

Admin > Post Types > New Post Type:
1. Name, slug, icon (Lucide `IconPicker`), description.
2. Add fields (same field system as Collections).
3. Attach taxonomies.
4. Configure archive + single page templates.
5. Enable: public API, RSS feed, sitemap, search index.

### Taxonomies

```
Category   hierarchical (parent/child), shared across post types
Tag        flat, shared
Custom     user-defined, hierarchical or flat
```

### Auto-generated routes

When a post type has archive and single templates set:

```
/[locale]/blog/                → archive page (collection loop of blog-post)
/[locale]/blog/[slug]/         → single post page
/[locale]/blog/category/[term] → category archive
/[locale]/blog/tag/[term]      → tag archive
/[locale]/blog/feed.xml        → RSS
```

These routes are registered dynamically by `src/app/(site)/[locale]/[...slug]/page.tsx` based on the site's post type config.

### Blog extra features

- Reading time — calculated on save from word count
- Related posts — by tag overlap (configurable)
- OG image — auto-generated via `@vercel/og` using featured image + title
- Table of contents — extracted from H2/H3 in rich text
- Sitemap — all published posts included automatically
- RSS — `/[postTypeSlug]/feed.xml` per post type per site

---

## 10. Multi-Provider Database

### Configuration

```env
# PostgreSQL — Neon, Supabase, Railway, self-hosted
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://user:pass@host:5432/tatomir

# MySQL — PlanetScale, Railway, self-hosted
DATABASE_PROVIDER=mysql
DATABASE_URL=mysql://user:pass@host:3306/tatomir

# SQLite — local dev only
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./tatomir.db

# Supabase (PostgreSQL + optional extras)
DATABASE_PROVIDER=postgresql
DATABASE_URL=postgresql://postgres:[pass]@db.[ref].supabase.co:5432/postgres
SUPABASE_URL=https://[ref].supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

### Prisma schema declaration

```prisma
datasource db {
  provider = env("DATABASE_PROVIDER")
  url      = env("DATABASE_URL")
}
```

### Media storage adapter

Configured by `STORAGE_PROVIDER` env var. Interface in `src/lib/cms/storage/adapter.ts`:

```ts
interface StorageAdapter {
  upload(file: Buffer, filename: string, mimeType: string): Promise<string>
  delete(url: string): Promise<void>
  getSignedUrl(url: string, expiresIn: number): Promise<string>
}
```

Implementations: `uploadthing.ts`, `supabase.ts`, `vercel-blob.ts`, `minio.ts`.

### Provider compatibility notes

| Feature | PostgreSQL | MySQL | SQLite |
|---------|-----------|-------|--------|
| UUID default | `cuid()` ✓ | `cuid()` ✓ | `cuid()` ✓ |
| Full-text search | Prisma `search` mode | Raw query | Not supported |
| FK constraints | ✓ | PlanetScale: off | ✓ |
| JSON columns | ✓ | ✓ (5.7+) | ✓ |
| Arrays | ✓ (native) | Stored as JSON | Stored as JSON |

---

## 11. Site Authentication & Member Areas

### Separation from admin auth

Admin users (Tatomir operators) and Site Members (end-users of published sites) are completely separate systems. Different tables, different sessions, different cookies.

```
Admin auth   → Auth.js v5, adminSession cookie, /admin and /studio only
Site auth    → Custom JWT, memberSession cookie, /{siteId}/auth/** routes
```

### Site member flows

1. **Register** — email + password or OAuth provider configured per site.
2. **Email verification** — required or optional (per site setting).
3. **Login** — credential check + memberSession JWT set in cookie.
4. **Password reset** — Resend email with signed token.
5. **OAuth** — Google, GitHub, Apple (configured per site in Admin > Settings > Auth).

### Protected pages

Set per page in page settings:

```ts
type AccessControl = {
  type: 'public' | 'members' | 'group'
  groupIds?: string[]    // required when type = 'group'
  redirectTo?: string    // default: /auth/login
}
```

Evaluated in `middleware.ts` — unauthenticated requests redirect before any React renders.

### Gated Content block

Wraps any blocks with a visibility condition:
- Member is logged in
- Member belongs to group X
- Member metadata field equals Y
- Date condition (show after / show before)

Fallback slot: show a CTA or "members only" message to non-members.

### Auth pages

When Member Area is enabled, these pages are created automatically and can be fully designed in the visual editor:

- `/auth/login` — Login Form block
- `/auth/register` — Register Form block
- `/auth/reset-password` — Reset Password Form block
- `/auth/dashboard` — Member Dashboard block

Auth form labels and error messages are CMS Variables — translated per locale, editable without touching code.

---

## 12. Internationalisation

### Three isolated domains

```
locales/
  admin/    Strings for /admin/**
  editor/   Strings for /studio/**
  (site)    Site content lives in DB — no static files
```

### Admin namespaces (`locales/admin/{locale}/`)

| File | Contents |
|------|----------|
| `auth.json` | Login, register, 2FA, session expiry |
| `common.json` | Save, Cancel, Delete, Confirm, Loading, Error, Empty |
| `collections.json` | Collection builder, field types, entry states |
| `post-types.json` | Post type builder, taxonomy manager |
| `media.json` | Upload, folders, bulk actions |
| `pages.json` | Pages list, page settings, access control labels |
| `settings.json` | Site settings, domains, integrations |
| `users.json` | Team members, roles, invite |
| `members.json` | Site members, groups, auth providers |
| `dashboard.json` | Widget labels, stats, quick actions |
| `design-system.json` | Token editor labels |
| `notifications.json` | Toast messages, alerts |

### Editor namespaces (`locales/editor/{locale}/`)

| File | Contents |
|------|----------|
| `toolbar.json` | Preview, Publish, Undo, Redo, device names |
| `panels.json` | Panel titles, empty states |
| `blocks.json` | Block library names and descriptions |
| `styles.json` | CSS property labels in style panel |
| `animations.json` | Animation type names, easing labels |
| `interactions.json` | Trigger and action names |
| `layers.json` | Navigator context menu actions |
| `seo.json` | Meta, OG, canonical, robots labels |
| `typography.json` | Font weight and transform labels |
| `errors.json` | Editor error messages |

### next-intl setup

```ts
// src/lib/i18n/config.ts
export const locales = ['en', 'fr', 'es', 'de', 'pt', 'ja', 'zh'] as const
export const defaultLocale = 'en'

// src/lib/i18n/request.ts  (next-intl server config)
export default getRequestConfig(async ({ requestLocale }) => {
  const locale = await requestLocale
  const domain = requestPathDomain() // 'admin' | 'editor'
  const messages = await loadMessages(domain, locale)
  return { locale, messages }
})
```

---

## 13. Custom UI Component System

Zero native browser widgets. Every component in `src/components/ui/`.

Foundation: **Radix UI Primitives** (keyboard/ARIA) + **Tailwind v4** (visual) + **Framer Motion** (transitions) + **Lucide React** (icons).

### Component list

```
Inputs
  Input           text, email, password, number — prefix/suffix/clear
  Textarea        auto-resize, char count
  NumberInput     +/- controls, unit suffix, min/max/step
  ColorPicker     react-colorful HSL + hex + alpha + site palette swatches
  SliderInput     custom track + thumb + drag tooltip
  TagInput        tokenized, keyboard nav
  ComboBox        search, async, virtual list
  DatePicker      react-day-picker, no native input
  DateRangePicker two-month calendar, range selection

Selection
  Select          animated dropdown, icons, descriptions, optgroups
  MultiSelect     checkbox list in popover, search, select all
  RadioGroup      card style, icon support
  Switch          animated thumb
  Checkbox        animated check, indeterminate
  SegmentedControl animated active pill

Navigation & Overlay
  Tabs            animated active indicator, keyboard nav
  Accordion       animated expand/collapse
  Popover         Floating UI, animated
  Tooltip         200ms delay, auto-direction, Lucide icons
  Dropdown        keyboard nav, nested sub-menus, dividers
  Dialog          focus trap, animated overlay, size variants
  Drawer          slide left/right/bottom, animated
  ContextMenu     right-click + keyboard, nested
  ScrollArea      custom scrollbar (both axes) — used everywhere

Feedback
  Toast           stacked via useToast(), Lucide icon per type
  Skeleton        shimmer animation
  Progress        linear + circular, animated
  Badge           status chips, dot indicator
  Alert           Lucide icon, inline feedback

Data Display
  Table           TanStack Table v9, sort, row select, sticky header
  Avatar          image + initials fallback
  FileDropzone    drag-drop, multi-file, type validation, progress
  ImageCrop       react-image-crop
  VirtualList     TanStack Virtual
  IconPicker      searchable Lucide icon grid
```

Each component exports its TypeScript prop types. All accept `className` for Tailwind overrides.

---

## 14. Sprint Plan

| # | Sprint | Duration | Priority | Depends |
|---|--------|----------|----------|---------|
| S0 | Repo Setup, CI, Vercel config | 1w | P0 | — |
| S1 | Core: Auth, DB, i18n, middleware | 2w | P0 | S0 |
| S2 | UI Kit Phase 1 (blocking components) | 2w | P0 | S0 |
| S3 | Admin Shell & Dashboard | 2w | P1 | S1, S2 |
| S4 | Collections & Content Types | 3w | P1 | S1 |
| S5 | Advanced Post Types & Blog | 2w | P1 | S4 |
| S6 | Multi-Provider DB & Storage adapters | 1w | P1 | S1 |
| S7 | Visual Editor Core (GrapesJS + Webflow UI) | 5w | P0 | S1, S2 |
| S8 | Block Library & Symbol System | 2w | P1 | S7 |
| S9 | Design System Panel & Tokens | 2w | P1 | S7 |
| S10 | Animation & Interaction Builder | 3w | P1 | S7 |
| S11 | CMS Bindings & Dynamic Data | 3w | P0 | S7, S4 |
| S12 | Publishing Pipeline | 2w | P0 | S11 |
| S13 | Site Auth & Member Areas | 3w | P1 | S12 |
| S14 | Multi-lingual Site Content | 2w | P1 | S12 |
| S15 | Media Library | 2w | P1 | S3 |
| S16 | UI Kit Phase 2 (remaining components) | 1w | P2 | S2 |
| S17 | Performance & Caching Audit | 2w | P1 | S12 |
| S18 | Multi-site & Templates | 2w | P2 | S12 |
| S19 | Beta Stabilisation | 2w | P1 | All |

**MVP** (editor works, page publishes, public visible): S0 → S1 → S2 → S7 → S11 → S12 = **15 weeks**

---

## 15. Sprint Specifications

---

### S0 — Repo Setup (1 week)

1. `npx create-next-app@latest tatomir --ts --tailwind --app --src-dir --import-alias "@/*"`
2. Configure Tailwind v4 — install, move config to CSS-first `@theme` in `globals.css`.
3. Add Biome: `npm install --save-dev --save-exact @biomejs/biome` + `biome.json`.
4. Add path aliases in `tsconfig.json` for `@/components`, `@/lib`, `@/actions`, `@/hooks`, `@/types`, `@/config`.
5. Create folder skeleton: all directories listed in Section 3 (empty `index.ts` files for non-leaf nodes).
6. Set up `prisma init`, add `schema.prisma` with initial `User` and `Site` models.
7. GitHub Actions CI: `biome check`, `tsc --noEmit` on every PR.
8. Vercel project linked to repo: auto-deploy on push to `main`.
9. `.env.example` with all required vars documented and grouped.

**Deliverable:** `npm run dev` starts. Vercel preview URL works. CI passes.

---

### S1 — Core Infrastructure (2 weeks)

**Week 1 — Auth & DB:**
1. Prisma schema: `User`, `AdminSession`, `Site`, `SiteMembership` (see Section 16).
2. Auth.js v5: credentials provider + Google OAuth. Session stored in DB.
3. `src/lib/auth/admin-auth.ts` exports `auth()`, `signIn()`, `signOut()`.
4. `middleware.ts`: protect `/admin/**` and `/studio/**`, resolve custom hostname, handle locale.
5. Admin login page using temporary `<input>` (replaced in S2).
6. DB seed script: 1 user, 1 site, 3 sample pages with placeholder JSON.

**Week 2 — i18n:**
1. `next-intl` installed. `src/lib/i18n/config.ts` and `src/lib/i18n/request.ts`.
2. `locales/admin/en/` — all namespace files with real strings (min 10 per file).
3. `locales/editor/en/` — all namespace files.
4. TypeScript type generation for message keys (next-intl `createTranslator` inferred).
5. Locale switcher in admin topbar.
6. User locale preference persisted in `User.locale` DB column.
7. FR stubs: `auth.json` and `common.json` fully translated, others machine-translated + marked `// TODO`.

---

### S2 — UI Kit Phase 1 (2 weeks)

All components styled to the Webflow dark theme using CSS custom properties defined in S0.
Lucide React icons throughout — zero emoji, zero native controls.

**Week 1:**
- `Button` — primary, secondary, ghost, destructive, icon-only; sizes sm/md/lg; loading state with `Loader2` spinner icon
- `Input` — prefix/suffix slots, clear button (`X` icon), error state, sizes
- `Textarea` — auto-resize, character counter
- `Select` — Radix Select + Floating UI, animated dropdown, icon support
- `Switch` — Radix Switch, Framer Motion thumb animation
- `Checkbox` — Radix Checkbox, animated check mark
- `Tooltip` — Floating UI, 200ms show delay, auto-placement

**Week 2:**
- `Popover` — Floating UI + Framer Motion scale-in animation
- `Dialog` — Radix Dialog, focus trap, animated overlay + panel
- `Drawer` — slide animation (Framer Motion), left/right/bottom variants
- `Dropdown` — Radix DropdownMenu, nested support, dividers, icon slots
- `Tabs` — Radix Tabs, animated active indicator (layoutId)
- `ScrollArea` — Radix ScrollArea, custom thin thumb (no native scrollbar)
- `Toast` + `useToast()` — stacked, Framer Motion exit animations, `CheckCircle2`/`AlertCircle`/`Info`/`XCircle` icons
- `Badge`, `Skeleton`, `Avatar`

---

### S3 — Admin Shell & Dashboard (2 weeks)

Design: exact Webflow admin dark aesthetic.

**Sidebar (240px, collapsible to 56px):**
- Top: Tatomir logo + site switcher dropdown
- Nav links with Lucide icons — `LayoutDashboard`, `FileText`, `Database`, `BookOpen`, `Image`, `Palette`, `Settings2`, `Users`
- Active state: 2px `--accent` left border, `--panel-bg-hover` background
- Tooltip on hover when collapsed (icon-only mode)
- Bottom: user avatar + name + `ChevronDown` dropdown (profile, locale, sign out)

**Topbar (56px):**
- Left: breadcrumb (page title)
- Right: locale switcher (`Languages` icon), notifications (`Bell` icon), site selector

**Dashboard:**
- Stat cards: pages, collections, posts, media, members
- Recent activity feed (last 10 actions with user avatar + action + time)
- Quick actions: New Page, New Post, Upload Media

---

### S4 — Collections & Content Types (3 weeks)

Field types and their custom controls:

| Field | Custom control |
|-------|---------------|
| Short text | `Input` |
| Long text | `Textarea` |
| Rich text | TipTap 2 with toolbar |
| Number | `NumberInput` |
| Boolean | `Switch` |
| Date | `DatePicker` |
| DateTime | `DatePicker` with time |
| Single select | `Select` |
| Multi select | `MultiSelect` |
| Relation (one) | `ComboBox` → collection entries |
| Relation (many) | Multi-relation picker |
| Media | `FileDropzone` → media library |
| Color | `ColorPicker` |
| JSON | Monaco Editor in `Dialog` |
| Slug | `Input` + auto-generate from title field |
| SEO | Compound: meta title + meta desc + OG image |

Collection builder: drag-to-reorder fields (dnd-kit), collapsible field settings, collection icon picker (`IconPicker`).

Entries list: TanStack Table, sort, filter, search, bulk delete, status filter (`Select` multi).

Entry editor: form generated from schema, auto-save draft every 30s, revision history sidebar.

---

### S5 — Advanced Post Types & Blog (2 weeks)

1. Post type builder (same field engine as collections + taxonomy linking).
2. Taxonomy manager: hierarchical categories, flat tags, drag-to-sort.
3. 7 built-in post types pre-installed on `db:seed`.
4. Post editor: TipTap 2 full rich text, featured image, taxonomy checkboxes, SEO panel.
5. Auto-generated routes registered via `src/config/post-types.ts` → `generateStaticParams()`.
6. RSS route at `/[locale]/[postTypeSlug]/feed.xml`.
7. Sitemap entries for all published posts.
8. Reading time calculated and stored on `PostEntry.readingTime` on save.
9. OG image route `src/app/api/og/route.tsx` using `@vercel/og`.

---

### S6 — Multi-Provider DB & Storage (1 week)

1. Prisma schema: `provider = env("DATABASE_PROVIDER")`.
2. Test migrations on PostgreSQL + MySQL in CI.
3. MySQL compatibility: no native array columns (stored as JSON), PlanetScale FK mode.
4. Storage adapter interface (`src/lib/cms/storage/adapter.ts`) + 4 implementations.
5. `STORAGE_PROVIDER` env var selects adapter at startup.
6. `docs/DATABASE.md` — setup guide for each provider.

---

### S7 — Visual Editor Core (5 weeks)

**Week 1 — GrapesJS bootstrap:**
1. GrapesJS installed. Imported only via `dynamic(() => import('grapesjs'), { ssr: false })` in the studio route.
2. `src/lib/editor/grapesjs-config.ts` — init options, canvas CSS injection (Tailwind + site tokens).
3. `src/lib/editor/storage-plugin.ts` — bridges GrapesJS storage events to Server Actions (`savePageDraft`).
4. `src/lib/editor/event-bridge.ts` — maps GrapesJS events to Zustand store updates (selected component, hover state, panel refresh triggers).
5. `src/lib/editor/block-registry.ts` — registers all blocks from `src/components/blocks/` into GrapesJS.
6. Canvas renders real Tailwind components using GrapesJS React Renderer plugin.
7. Undo/redo: GrapesJS UndoManager, 50-state cap, Cmd+Z / Cmd+Shift+Z.

**Week 2 — Toolbar + canvas controls:**
1. Top toolbar component (`src/components/editor/toolbar/`):
   - Left: logo, site dropdown, page dropdown
   - Center: device switcher (3 icon buttons, no labels)
   - Right: Undo, Redo, Preview, Publish
2. Canvas selection handles: blue border, resize handles, dimension badge (positioned via GrapesJS canvas events).
3. Hover highlight: 1px blue border at 50% opacity.
4. Drop indicator: blue insertion line when dragging a block.
5. Zoom: Cmd+Scroll, range 25%-200%.
6. Canvas keyboard shortcuts: Delete, Escape, Arrow nudge (1px), Shift+Arrow (10px).

**Week 3 — Left panel:**
1. Elements panel: searchable, 6 categories, 70×60px block cards with Lucide icon + label.
2. Navigator panel: TanStack Virtual tree (handles 1000+ nodes), indent + expand, Eye/Lock toggles, right-click context menu.
3. CMS panel: collections list + fields as draggable items, variables section at bottom.
4. Assets panel: media grid, upload shortcut.
5. Pages panel: site pages list, active page highlighted, New Page button.

**Week 4 — Right panel — Style:**
Full Webflow-style panel. 8 sections: Layout, Spacing, Size, Position, Typography, Backgrounds, Borders, Effects. Each section collapsible, dense 28px rows, 11px text, no native inputs.

**Week 5 — Right panel — Settings, Interactions, SEO + context menu:**
1. Settings panel: component-specific props (image alt/src, link href, heading level, etc.).
2. Interactions panel skeleton (wired up fully in S10).
3. SEO panel (page root only): meta title, meta desc, OG, canonical, robots.
4. Right-click context menu: Cut, Copy, Paste, Duplicate, Delete, Wrap in Container, Convert to Symbol.

---

### S8 — Block Library & Symbol System (2 weeks)

1. `GlobalBlock` table in Prisma + query/mutation functions.
2. "Convert to Symbol" in context menu → name dialog → saved + page JSON updated to `symbol-instance` type.
3. Symbol instance rendering in both editor canvas and public renderer.
4. Symbol manager panel: list, thumbnail preview, usage count, edit master / detach instance.
5. "Editing Symbol" canvas mode: blue banner, transparent background for non-symbol elements.
6. Instance override UI: field with override shows `<Unlink />` icon in settings panel.
7. 15 built-in block presets accessible from Elements panel bottom section.

---

### S9 — Design System Panel & Tokens (2 weeks)

1. Admin > Design System: color palette, typography scale, spacing tokens, shadows, radii, gradients.
2. Tokens stored as `DesignToken` rows in DB per site.
3. Tokens served as `/api/tokens/[siteId].css` — CSS custom properties file.
4. GrapesJS canvas loads this file in canvas context so tokens render live in editor.
5. Color picker in style panel: site palette swatches before the color wheel.
6. Font selector: site font tokens listed first.
7. Token hot-reload: editing a token in admin triggers a Server-Sent Event — editor canvases update without full refresh.

---

### S10 — Animation & Interaction Builder (3 weeks)

**Week 1 — Interactions UI (right panel):**
```
Interactions tab content:

[+ Add Interaction]

When [On Scroll Into View ▾]:
  Timeline:
  ① Move Y: 40px → 0  600ms  ease-out  delay: 0ms   [edit][×]
  ② Opacity: 0 → 1    600ms  ease-out  delay: 100ms  [edit][×]
  [+ Add Action]
```

Trigger types: On Page Load, On Scroll Into View, On Scroll Out of View, On Mouse Enter, On Mouse Leave, On Click, On Scroll (continuous parallax).

Action types: Move X/Y, Scale, Rotate, Opacity, Background Color, Blur, Border Color.

Easing picker: grid of 12 visual curve previews (ease-in, ease-out, ease-in-out, back, bounce, spring, linear, custom).

**Week 2 — GSAP compiler:**
`src/lib/animations/compiler.ts` compiles interaction JSON → GSAP ScrollTrigger script:
- Each interactive element gets `data-ta-id` attribute during server render
- Compiler outputs a `<script>` block that registers GSAP timelines per element
- Only GSAP modules actually used are imported (tree-shaken)
- Runs client-side on public page load

**Week 3 — Presets + page transitions:**
1. Built-in animation presets: Fade In, Slide Up, Slide Right, Scale In, Stagger Children — single click in Interactions panel.
2. Framer Motion `AnimatePresence` page transitions in `src/app/(site)/[locale]/layout.tsx`.
3. Lottie block: upload `.json` via media, configure autoplay/loop/trigger.
4. CSS `@keyframes` custom code block (Monaco editor in Dialog).

---

### S11 — CMS Bindings & Dynamic Data (3 weeks)

**Week 1 — Binding UI:**
1. Settings panel: every text/attribute shows `<Link2 />` icon to enter binding mode.
2. Binding picker: `ComboBox` → collection or post type → field.
3. Bound elements show `{{post.title}}` in canvas.
4. `src/lib/cms/resolver.ts` resolves bindings at render time.

**Week 2 — Collection Loops:**
1. Collection Loop block: source (collection/post type), filters, sort, limit, offset.
2. Inside loop: child blocks access `item.*` binding namespace.
3. Pagination block wired to loop's offset/limit.
4. `generateStaticParams()` called for collection-driven dynamic routes.

**Week 3 — Conditionals, Dynamic Routes, Variables:**
1. Conditional block: visibility conditions evaluated server-side.
2. Dynamic page routes: page settings → link to collection → `[slug]` route registered.
3. CMS Variables panel in editor and admin management page.
4. Member conditions: `member.isLoggedIn`, `member.group === 'x'`.

---

### S12 — Publishing Pipeline (2 weeks)

1. Publish Server Action:
   - `Page.status = PUBLISHED`, `publishedAt = now()`
   - Copy `draftJson` → `publishedJson`
   - `revalidateTag("page:${slug}:${siteId}")`
   - `revalidateTag("site:${siteId}:nav")`
2. Draft/published JSON stored separately.
3. Preview: signed URL (1h TTL) showing draft JSON in public renderer.
4. Scheduled publish: datetime picker → Vercel Cron (`/api/cron/publish`) checks every minute.
5. Unpublish / archive page.
6. Custom 404 page per site (designed in editor).
7. Redirect manager in Admin > Settings > Redirects.
8. Rollback: restore any of last 20 `PageRevision` snapshots.

---

### S13 — Site Auth & Member Areas (3 weeks)

1. `SiteMember`, `MemberGroup`, `MemberGroupMember`, `MemberSession` tables.
2. `src/lib/auth/site-auth.ts`: JWT-based member session, separate from admin auth.
3. `middleware.ts` extended: check member session for protected pages.
4. Auth Server Actions: `memberSignIn`, `memberSignOut`, `memberRegister`, `memberResetPassword`.
5. Login Form, Register Form, Reset Password Form, Gated Content, Member Dashboard blocks built.
6. Auth pages auto-created when Member Area enabled in site settings.
7. Auth form labels/errors as CMS variables — translatable per locale.
8. OAuth providers per site: Google, GitHub (Auth.js providers, configured per site).

---

### S14 — Multi-lingual Site Content (2 weeks)

1. Site locales configured in Admin > Settings.
2. Studio toolbar locale switcher — reloads page JSON for selected locale.
3. Missing translation indicator: `<AlertCircle />` on untranslated fields.
4. Locale URL strategies: prefix (`/fr/`), subdomain, per-domain.
5. `hreflang` auto-injected in `<head>`.
6. Collection/post entry locale-aware queries.
7. Locale-aware sitemaps.

---

### S15 — Media Library (2 weeks)

1. Grid + list view, TanStack Virtual for large libraries.
2. Folder tree, drag-to-move files.
3. `FileDropzone` multi-upload with per-file progress bars.
4. Image optimization on upload: sharp, WebP + AVIF, multiple breakpoints.
5. Search by name, filter by type/date/folder.
6. Bulk select, move, delete, download ZIP.
7. Image editor: `react-image-crop` + canvas brightness/contrast.
8. Per-file metadata (alt, caption) per locale.

---

### S16 — UI Kit Phase 2 (1 week)

- `Table` (TanStack Table, sort, row select)
- `FileDropzone` full implementation
- `ImageCrop` (react-image-crop)
- `ColorPicker` (react-colorful, full HSL + hex + alpha + history)
- `DatePicker` / `DateRangePicker`
- `ComboBox` async + virtual list
- `SegmentedControl`
- `ContextMenu`
- `SliderInput`
- `NumberInput`
- `TagInput`
- `IconPicker`

---

### S17 — Performance & Caching Audit (2 weeks)

1. `use cache` audit: every CMS query tagged correctly.
2. PPR enabled (`cacheComponents: true` in `next.config.ts`).
3. Verify GrapesJS chunk absent from public page bundle (Webpack Bundle Analyzer).
4. `next/image` audit: correct `sizes`, `priority` on above-fold images.
5. Font subsetting per locale.
6. DB indexes: all queried columns, composite on `(siteId, status, locale)`.
7. Prisma Accelerate for serverless connection pooling.
8. Lighthouse CI gate: performance ≥ 90 on 3 sample pages.

---

### S18 — Multi-site & Templates (2 weeks)

1. Multi-site support: one installation, multiple sites, isolated data.
2. Site creation wizard: blank / built-in template / clone site.
3. Page templates: save → template → apply to new page.
4. Site templates: clone site (schema only, no entries).
5. 20+ built-in templates in template gallery.
6. Export site as ZIP (page JSONs + assets manifest + settings).

---

### S19 — Beta Stabilisation (2 weeks)

1. Playwright E2E: create site → build page → publish → verify URL → member login → gated content.
2. Unit tests: `src/lib/cms/`, `src/lib/animations/compiler.ts`.
3. Fix top-20 issues from internal dogfood.
4. Onboarding wizard: first-time user → create site → build first page → publish.
5. Error boundaries in editor with fallback + error report.
6. Rate limiting on Server Actions (upstash/ratelimit or custom).
7. CSRF audit.
8. `npm audit` — resolve all high/critical.
9. Complete docs: `docs/DATABASE.md`, `docs/DEPLOYMENT.md`, `docs/I18N.md`.

---

## 16. Database Schema

See `prisma/schema.prisma` — kept in the same single-app repo.

Key models: `User`, `AdminSession`, `Site`, `SiteMembership`, `Page`, `PageRevision`, `Collection`, `CollectionEntry`, `PostType`, `PostEntry`, `Taxonomy`, `Term`, `GlobalBlock`, `MediaFolder`, `MediaFile`, `DesignToken`, `CmsVariable`, `SiteRedirect`, `SiteMember`, `MemberGroup`, `MemberGroupMember`, `MemberSession`.

Full schema in [SCHEMA.md](SCHEMA.md).

---

## 17. Performance Strategy

| Concern | Strategy |
|---------|---------|
| Public page TTFB | PPR — static shell from CDN edge, dynamic content streams |
| CMS data caching | `use cache: remote` + `revalidateTag()` on publish |
| Editor bundle isolation | GrapesJS chunk never in public bundle (route-based splitting) |
| Image delivery | `next/image`, WebP/AVIF, responsive `sizes` |
| Fonts | `next/font`, `display: swap`, locale-specific subsetting |
| Virtual lists | TanStack Virtual in Navigator panel (1000+ elements) |
| Editor auto-save | Debounced 30s, JSON diff |
| DB queries | Cursor-based pagination, composite indexes, Prisma Accelerate |
| Admin RSC | Server Components for data-heavy views, Suspense + Skeleton |

---

## 18. Deployment

### Vercel (recommended)

```bash
# Clone and configure
git clone ... tatomir && cd tatomir
cp .env.example .env.local
# Fill in DATABASE_URL, NEXTAUTH_SECRET, etc.

# Deploy
vercel deploy --prod
```

Vercel detects a Next.js root automatically. No `vercel.json` needed for a standard setup.

Custom domains: add in Vercel dashboard → auto-provisioned SSL → `middleware.ts` resolves hostname to siteId.

Vercel Cron for scheduled publish:
```json
// vercel.json
{
  "crons": [
    { "path": "/api/cron/publish", "schedule": "* * * * *" }
  ]
}
```

### Self-hosted (Docker)

```dockerfile
# Dockerfile (Next.js standalone output)
FROM node:22-alpine AS builder
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:22-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
CMD ["node", "server.js"]
```

```yaml
# docker-compose.yml
services:
  app:
    build: .
    ports: ["3000:3000"]
    env_file: .env
  db:
    image: postgres:16-alpine
    volumes: ["pgdata:/var/lib/postgresql/data"]
    environment:
      POSTGRES_DB: tatomir
      POSTGRES_USER: tatomir
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
volumes:
  pgdata:
```

```bash
docker compose up -d
# Tatomir running at http://localhost:3000
```

### Environment Variables

```env
# Required
DATABASE_PROVIDER=postgresql
DATABASE_URL=
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# Optional — defaults to local SQLite for dev
DATABASE_PROVIDER=sqlite
DATABASE_URL=file:./tatomir.db

# Storage (default: uploadthing)
STORAGE_PROVIDER=uploadthing
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Email
RESEND_API_KEY=
EMAIL_FROM=noreply@tatomir.app

# OAuth (admin)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Supabase extras (optional)
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Internal
CRON_SECRET=        # validates /api/cron/* routes
```

---

*Project: Tatomir — v0.3 — 2026-05-12*
