# Editor UI Specification — Tatomir Studio

Visual reference and implementation spec for the GrapesJS-based visual editor.
Design target: identical to Webflow Designer.

---

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────────┐
│  TOOLBAR (48px height)                                              │
│  [Logo] [Site▾] [Page▾]    [Mobile][Tablet][Desktop]    [Undo][Redo]  [Preview] [Publish] │
├───────────┬─────────────────────────────────────┬───────────────────┤
│           │                                     │                   │
│  LEFT     │                                     │   RIGHT           │
│  PANEL    │         CANVAS                      │   PANEL           │
│  240px    │         (GrapesJS)                  │   240px           │
│           │                                     │                   │
│  [tabs    │   ┌──────────────────────────────┐  │  [tabs at top]    │
│  at       │   │  white page                  │  │                   │
│  bottom]  │   │  selected element:           │  │  Style /          │
│           │   │  ┌─────────────────────────┐ │  │  Settings /       │
│           │   │  │ blue border + handles   │ │  │  Interactions /   │
│           │   │  └─────────────────────────┘ │  │  SEO              │
│           │   └──────────────────────────────┘  │                   │
└───────────┴─────────────────────────────────────┴───────────────────┘
```

---

## Toolbar (top, 48px)

### Left section
- Tatomir logo mark (SVG, 20px wide)
- Vertical divider (1px, `--panel-border`)
- Site name + chevron-down — dropdown to switch site
- Vertical divider
- Page name + chevron-down — dropdown to switch page or create new

### Center section
- Device switcher (3 icon buttons, no labels):
  - `<Smartphone size={16} />` — Mobile (375px)
  - `<Tablet size={16} />` — Tablet (768px)
  - `<Monitor size={16} />` — Desktop (1440px, default)
  - Active device: `--accent` background, white icon
  - Inactive: `--text-secondary` icon

### Right section
- `<Undo2 size={16} />` — Cmd+Z, disabled when no history
- `<Redo2 size={16} />` — Cmd+Shift+Z, disabled when no future
- Vertical divider
- `<Eye size={16} />` "Preview" — opens preview in new tab (signed URL)
- `<Globe size={16} />` "Publish" — primary button style, `--accent` background

---

## Left Panel (240px, fixed)

### Tab bar (bottom of panel, 48px)

Five icon tabs, Lucide 18px, tooltip on hover:

```
[ LayoutGrid ]  [ Layers ]  [ Database ]  [ Image ]  [ Globe ]
  Elements      Navigator     CMS          Assets     Pages
```

Active tab: `--accent` colored icon + thin `--accent` top border indicator.

---

### Tab: Elements (Block Library)

```
┌────────────────────────────────────┐
│  [Search... ]              [Grid/List toggle] │
├────────────────────────────────────┤
│  Layout                            │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │ Sec- │ │Cont- │ │ Grid │       │
│  │ tion │ │ainer │ │      │       │
│  └──────┘ └──────┘ └──────┘       │
│  Typography                        │
│  ┌──────┐ ┌──────┐ ┌──────┐       │
│  │  H1  │ │  P   │ │RichTx│       │
│  └──────┘ └──────┘ └──────┘       │
│  ...                               │
└────────────────────────────────────┘
```

Each block item:
- 70×60px card
- Lucide icon (24px) centered
- Label below (11px, `--text-secondary`)
- Hover: `--panel-bg-hover` background, `--text-primary` label
- Drag to canvas or click to insert at selection

---

### Tab: Navigator (Layer Tree)

```
┌────────────────────────────────────┐
│  [Search layers...]                │
├────────────────────────────────────┤
│ ▼ Body                  [eye][lock]│
│   ▼ Section             [eye][lock]│
│     ▼ Container         [eye][lock]│
│       ▼ Flex            [eye][lock]│
│         ■ Heading       [eye][lock]│
│         ■ Paragraph     [eye][lock]│
│       ■ Image           [eye][lock]│
└────────────────────────────────────┘
```

Each row (28px height):
- Indent: 12px per level
- Expand chevron (`ChevronRight` → `ChevronDown` animated)
- Block type icon (Lucide, 12px, `--text-secondary`)
- Element label (12px, editable on double-click)
- On hover: `<Eye size={12} />` and `<Lock size={12} />` appear on right
- Selected: `--accent` left border, `--panel-bg-hover` background
- Hidden elements: label at 40% opacity
- Locked elements: label at 60% opacity, italic

Right-click context menu:
- Duplicate `<Copy size={14} />`
- Delete `<Trash2 size={14} />`
- Group `<Group size={14} />`
- Ungroup
- Convert to Symbol `<Bookmark size={14} />`
- Rename `<Pencil size={14} />`
- Move to `<FolderInput size={14} />`

---

### Tab: CMS

```
┌────────────────────────────────────┐
│  Collections                       │
│  ┌──────────────────────────────┐  │
│  │ [Database 12px] Blog Posts   │  │
│  │   title         [drag]       │  │
│  │   content       [drag]       │  │
│  │   featured_image[drag]       │  │
│  └──────────────────────────────┘  │
│  ┌──────────────────────────────┐  │
│  │ [Database 12px] Portfolio    │  │
│  │   ...                        │  │
│  └──────────────────────────────┘  │
│  ─────────────────────────────     │
│  Variables                         │
│  ┌──────────────────────────────┐  │
│  │  phone_number    [drag]      │  │
│  │  address         [drag]      │  │
│  └──────────────────────────────┘  │
└────────────────────────────────────┘
```

Dragging a collection field → canvas creates a CMS-bound text/image element.

---

### Tab: Assets (Media Library mini)

Grid of recent media files. Click to insert at selection. `<Upload size={14} />` button to upload new file.

---

### Tab: Pages

Flat list of pages in current site. Active page highlighted. `<Plus size={14} />` to create new page.

---

## Right Panel (240px, fixed)

### Tab bar (top of panel, 36px)

Four icon tabs, Lucide 16px, tooltip on hover:

```
[ Paintbrush ]  [ Settings2 ]  [ Zap ]  [ Search ]
  Style          Settings       Inter.   SEO
```

---

### Tab: Style

Section anatomy (all sections):
- Header row: 11px uppercase label + Lucide 12px icon left + `<ChevronRight />` collapse right
- Section background: `--panel-section-bg`
- Property rows: 28px height, 11px text
- Label column: 40% width, `--text-secondary`
- Control column: 60% width

#### Layout section

```
Display:  [Block][Flex][Grid][None]   (icon buttons)

[When Flex]:
Direction: [→][↓][←][↑]  (icon buttons)
Justify:   [⊢][⊣][⊞][⊠][⊡]
Align:     [⊤][⊞][⊥]
Wrap:      [No wrap][Wrap]
Gap H: [___4__] px    Gap V: [___4__] px

[When Grid]:
Columns: [___3___]  Rows: [auto]
Col gap: [___16__]  Row gap: [___16__]
```

#### Spacing section

Visual box model widget — a nested box with 4 margin inputs (outside) and 4 padding inputs (inside). Values update on change. Linked mode (all sides equal) toggled by center lock icon.

#### Size section

```
W: [___320___] [px▾]   H: [___auto__] [px▾]
Min W: [_______]        Max W: [_______]
Min H: [_______]        Max H: [_______]
```

#### Position section

```
Position: [Static][Relative][Absolute][Fixed][Sticky]
[When not Static]:
Top:  [___0___] px     Right:  [___0___] px
Bot:  [___0___] px     Left:   [___0___] px
Z:    [___0___]
```

#### Typography section

```
Font:   [Inter                     ▾]
Size:   [_16_] px   Weight: [Regular    ▾]
LH:     [_1.5_]     LS:     [_0_] px
Color:  [■] #1a1a2a
Align:  [≡][≡][≡][≡]   (Left/Center/Right/Justify icons)
Decor:  [U][S][—]       Transform: [aA][AA][aa][Aa]
```

#### Backgrounds section

```
[+ Add Background]
┌────────────────────────────────┐
│ [■] Color   #ffffff     [×]   │
└────────────────────────────────┘
```

Supported: solid color, linear gradient, radial gradient, image (from media library).

#### Borders section

```
[+ Add Border]
┌────────────────────────────────┐
│ [All sides ▾] [■] #e5e7eb 1px solid [×] │
└────────────────────────────────┘
```

#### Effects section

```
Opacity:  [────●───────] 100%
Blur:     [________] px
Shadow:   [+ Add shadow]
  ┌──────────────────────────────┐
  │ X: 0  Y: 4  Blur: 8  [■] rgba(0,0,0,0.1) [×] │
  └──────────────────────────────┘
```

---

### Tab: Settings

Component-specific controls. Examples:

**Image:**
```
Src:   [media picker]
Alt:   [_______________]
CMS:   [Link field ▾]  [✕ unbind]
Fit:   [Cover][Contain][Fill]
Loading: [Lazy][Eager]
```

**Link:**
```
Href:    [_______________]
Target:  [Same tab][New tab]
Rel:     [_______________]
CMS:     [Link field ▾]
```

**Heading:**
```
Tag:   [H1][H2][H3][H4][H5][H6]
CMS:   [Link field ▾]
```

---

### Tab: Interactions

```
[+ Add Interaction]

┌────────────────────────────────────┐
│ On Scroll Into View          [×]  │
├────────────────────────────────────┤
│ ① Fade In                   [edit]│
│   Opacity: 0→1  600ms  ease-out   │
│   Delay: 0ms                      │
│ ② Slide Up                  [edit]│
│   Y: 40px→0  600ms  ease-out      │
│   Delay: 100ms                    │
│ [+ Add Action]                    │
└────────────────────────────────────┘
```

Easing picker: grid of visual curve previews (ease-in, ease-out, ease-in-out, spring, bounce, linear, custom).

---

### Tab: SEO (page root only)

```
Meta Title
[________________________________]
Google preview:
┌──────────────────────────────────┐
│ tatomir.app › page-slug          │
│ Page Title Here                  │
│ Meta description preview text... │
└──────────────────────────────────┘
Characters: 48 / 60

Meta Description
[________________________________]
[                                ]
Characters: 120 / 160

OG Image
[Drop image or click to pick]
1200 × 630 recommended

Canonical URL  [_______________]
Robots         [Index, Follow ▾]
```

---

## Canvas Interactions

### Selection state
- Selected element: 2px `--select-blue` border on all sides
- Handles: 6px × 6px square handles at corners and mid-edges, white fill + `--select-blue` border
- Dimension badge: `W × H` in 10px font, positioned top-right outside the selection border, `--select-blue` background

### Hover state
- Hovered non-selected element: 1px `--select-blue` border at 50% opacity

### Drop indicator
- Dragging block over canvas: blue 2px horizontal line shows insertion point
- Dragging into container: blue background fill at 15% opacity in target container

### Multi-select
- Cmd+click: add/remove from selection
- Drag on empty canvas: rubber-band selection rect (dashed blue border, 10% blue fill)
- Multi-selected: single bounding box around all selected elements

---

## Keyboard Shortcuts

| Action | Shortcut |
|--------|---------|
| Undo | Cmd+Z |
| Redo | Cmd+Shift+Z |
| Save | Cmd+S |
| Delete selected | Delete / Backspace |
| Duplicate | Cmd+D |
| Copy | Cmd+C |
| Paste | Cmd+V |
| Paste in place | Cmd+Shift+V |
| Select all | Cmd+A |
| Deselect | Escape |
| Nudge (1px) | Arrow keys |
| Nudge (10px) | Shift+Arrow keys |
| Zoom in | Cmd+= |
| Zoom out | Cmd+- |
| Zoom to fit | Cmd+0 |
| Zoom to 100% | Cmd+1 |
| Preview | Cmd+Shift+P |
| Toggle left panel | Cmd+\ |
