# Database Schema — Tatomir

File: `prisma/schema.prisma`

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = env("DATABASE_PROVIDER")
  url      = env("DATABASE_URL")
}

// ─── Admin Users ────────────────────────────────────────────────────

model User {
  id           String           @id @default(cuid())
  email        String           @unique
  name         String?
  avatarUrl    String?
  passwordHash String?
  locale       String           @default("en")
  createdAt    DateTime         @default(now())
  memberships  SiteMembership[]
  sessions     AdminSession[]
}

model AdminSession {
  id        String   @id @default(cuid())
  userId    String
  token     String   @unique
  expiresAt DateTime
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// ─── Sites ──────────────────────────────────────────────────────────

model Site {
  id                  String           @id @default(cuid())
  name                String
  slug                String           @unique
  favicon             String?
  customDomain        String?          @unique
  locales             String[]         @default(["en"])
  defaultLocale       String           @default("en")
  memberAuthEnabled   Boolean          @default(false)
  memberAuthProviders String[]         @default(["email"])
  createdAt           DateTime         @default(now())
  memberships         SiteMembership[]
  pages               Page[]
  collections         Collection[]
  postTypes           PostType[]
  mediaFiles          MediaFile[]
  mediaFolders        MediaFolder[]
  tokens              DesignToken[]
  variables           CmsVariable[]
  redirects           SiteRedirect[]
  globalBlocks        GlobalBlock[]
  siteMembers         SiteMember[]
  memberGroups        MemberGroup[]
}

model SiteMembership {
  id     String    @id @default(cuid())
  siteId String
  userId String
  role   AdminRole
  site   Site      @relation(fields: [siteId], references: [id], onDelete: Cascade)
  user   User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  @@unique([siteId, userId])
}

enum AdminRole {
  OWNER
  ADMIN
  EDITOR
  VIEWER
}

// ─── Pages ──────────────────────────────────────────────────────────

model Page {
  id            String       @id @default(cuid())
  siteId        String
  title         String
  slug          String
  locale        String       @default("en")
  status        PageStatus   @default(DRAFT)
  draftJson     Json?
  publishedJson Json?
  metaTitle     String?
  metaDesc      String?
  ogImage       String?
  canonicalUrl  String?
  robots        String?
  isDynamic     Boolean      @default(false)
  collectionId  String?
  postTypeId    String?
  accessControl Json?        // AccessControl type
  scheduledAt   DateTime?
  publishedAt   DateTime?
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
  site          Site         @relation(fields: [siteId], references: [id], onDelete: Cascade)
  revisions     PageRevision[]
  @@unique([siteId, slug, locale])
}

enum PageStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

model PageRevision {
  id          String   @id @default(cuid())
  pageId      String
  json        Json
  publishedBy String?
  createdAt   DateTime @default(now())
  page        Page     @relation(fields: [pageId], references: [id], onDelete: Cascade)
}

// ─── Collections ────────────────────────────────────────────────────

model Collection {
  id          String            @id @default(cuid())
  siteId      String
  name        String
  slug        String
  icon        String?
  description String?
  schema      Json              // FieldDefinition[]
  createdAt   DateTime          @default(now())
  site        Site              @relation(fields: [siteId], references: [id], onDelete: Cascade)
  entries     CollectionEntry[]
  @@unique([siteId, slug])
}

model CollectionEntry {
  id           String     @id @default(cuid())
  collectionId String
  locale       String     @default("en")
  status       PageStatus @default(DRAFT)
  data         Json
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
}

// ─── Post Types ─────────────────────────────────────────────────────

model PostType {
  id          String             @id @default(cuid())
  siteId      String
  name        String
  slug        String
  icon        String?
  description String?
  isBuiltIn   Boolean            @default(false)
  schema      Json               // FieldDefinition[]
  hasArchive  Boolean            @default(true)
  hasRss      Boolean            @default(true)
  createdAt   DateTime           @default(now())
  site        Site               @relation(fields: [siteId], references: [id], onDelete: Cascade)
  entries     PostEntry[]
  taxonomies  PostTypeTaxonomy[]
  @@unique([siteId, slug])
}

model PostEntry {
  id          String        @id @default(cuid())
  postTypeId  String
  locale      String        @default("en")
  status      PageStatus    @default(DRAFT)
  title       String
  slug        String
  readingTime Int?
  data        Json
  publishedAt DateTime?
  createdAt   DateTime      @default(now())
  updatedAt   DateTime      @updatedAt
  postType    PostType      @relation(fields: [postTypeId], references: [id], onDelete: Cascade)
  terms       PostEntryTerm[]
  @@unique([postTypeId, slug, locale])
}

model Taxonomy {
  id           String             @id @default(cuid())
  siteId       String
  name         String
  slug         String
  hierarchical Boolean            @default(false)
  postTypes    PostTypeTaxonomy[]
  terms        Term[]
  @@unique([siteId, slug])
}

model PostTypeTaxonomy {
  postTypeId String
  taxonomyId String
  postType   PostType @relation(fields: [postTypeId], references: [id], onDelete: Cascade)
  taxonomy   Taxonomy @relation(fields: [taxonomyId], references: [id], onDelete: Cascade)
  @@id([postTypeId, taxonomyId])
}

model Term {
  id         String          @id @default(cuid())
  taxonomyId String
  name       String
  slug       String
  parentId   String?
  taxonomy   Taxonomy        @relation(fields: [taxonomyId], references: [id], onDelete: Cascade)
  parent     Term?           @relation("TermChildren", fields: [parentId], references: [id])
  children   Term[]          @relation("TermChildren")
  entries    PostEntryTerm[]
  @@unique([taxonomyId, slug])
}

model PostEntryTerm {
  entryId String
  termId  String
  entry   PostEntry @relation(fields: [entryId], references: [id], onDelete: Cascade)
  term    Term      @relation(fields: [termId], references: [id], onDelete: Cascade)
  @@id([entryId, termId])
}

// ─── Global Blocks (Symbols) ────────────────────────────────────────

model GlobalBlock {
  id          String   @id @default(cuid())
  siteId      String
  name        String
  category    String?
  masterJson  Json
  propsSchema Json?
  thumbnail   String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  site        Site     @relation(fields: [siteId], references: [id], onDelete: Cascade)
}

// ─── Media ──────────────────────────────────────────────────────────

model MediaFolder {
  id       String        @id @default(cuid())
  siteId   String
  name     String
  parentId String?
  site     Site          @relation(fields: [siteId], references: [id], onDelete: Cascade)
  parent   MediaFolder?  @relation("FolderChildren", fields: [parentId], references: [id])
  children MediaFolder[] @relation("FolderChildren")
  files    MediaFile[]
}

model MediaFile {
  id        String       @id @default(cuid())
  siteId    String
  folderId  String?
  filename  String
  url       String
  mimeType  String
  size      Int
  width     Int?
  height    Int?
  alt       String?
  caption   String?
  locale    String       @default("en")
  createdAt DateTime     @default(now())
  site      Site         @relation(fields: [siteId], references: [id], onDelete: Cascade)
  folder    MediaFolder? @relation(fields: [folderId], references: [id])
}

// ─── Design Tokens ──────────────────────────────────────────────────

model DesignToken {
  id     String    @id @default(cuid())
  siteId String
  name   String
  value  String
  type   TokenType
  site   Site      @relation(fields: [siteId], references: [id], onDelete: Cascade)
  @@unique([siteId, name])
}

enum TokenType {
  COLOR
  TYPOGRAPHY
  SPACING
  SHADOW
  RADIUS
  GRADIENT
}

// ─── CMS Variables ──────────────────────────────────────────────────

model CmsVariable {
  id     String @id @default(cuid())
  siteId String
  key    String
  values Json   // { "en": "...", "fr": "..." }
  site   Site   @relation(fields: [siteId], references: [id], onDelete: Cascade)
  @@unique([siteId, key])
}

// ─── Redirects ──────────────────────────────────────────────────────

model SiteRedirect {
  id          String @id @default(cuid())
  siteId      String
  source      String
  destination String
  statusCode  Int    @default(301)
  site        Site   @relation(fields: [siteId], references: [id], onDelete: Cascade)
  @@unique([siteId, source])
}

// ─── Site Members (end-users of published sites) ────────────────────

model SiteMember {
  id            String              @id @default(cuid())
  siteId        String
  email         String
  name          String?
  avatarUrl     String?
  passwordHash  String?
  emailVerified Boolean             @default(false)
  metadata      Json?
  createdAt     DateTime            @default(now())
  lastLoginAt   DateTime?
  site          Site                @relation(fields: [siteId], references: [id], onDelete: Cascade)
  groups        MemberGroupMember[]
  sessions      MemberSession[]
  @@unique([siteId, email])
}

model MemberGroup {
  id      String              @id @default(cuid())
  siteId  String
  name    String
  slug    String
  site    Site                @relation(fields: [siteId], references: [id], onDelete: Cascade)
  members MemberGroupMember[]
  @@unique([siteId, slug])
}

model MemberGroupMember {
  memberId String
  groupId  String
  member   SiteMember  @relation(fields: [memberId], references: [id], onDelete: Cascade)
  group    MemberGroup @relation(fields: [groupId], references: [id], onDelete: Cascade)
  @@id([memberId, groupId])
}

model MemberSession {
  id        String     @id @default(cuid())
  memberId  String
  siteId    String
  token     String     @unique
  expiresAt DateTime
  member    SiteMember @relation(fields: [memberId], references: [id], onDelete: Cascade)
}
```

---

## TypeScript types mirroring the schema

```ts
// src/types/cms.ts

export type FieldType =
  | 'short-text'
  | 'long-text'
  | 'rich-text'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'single-select'
  | 'multi-select'
  | 'relation-one'
  | 'relation-many'
  | 'media'
  | 'color'
  | 'json'
  | 'slug'
  | 'seo'

export type FieldDefinition = {
  id: string
  name: string
  label: string
  type: FieldType
  required: boolean
  unique?: boolean
  defaultValue?: unknown
  options?: string[]          // for select fields
  relationTo?: string         // collection/postType slug
  validation?: {
    min?: number
    max?: number
    pattern?: string
  }
}

export type AccessControl = {
  type: 'public' | 'members' | 'group'
  groupIds?: string[]
  redirectTo?: string
}

export type BlockNode = {
  type: string
  id: string
  props?: Record<string, unknown>
  children?: BlockNode[]
  symbolId?: string           // set when type = 'symbol-instance'
  overrides?: Record<string, unknown>
  cmsBindings?: Record<string, string>  // propName → "collection.fieldName"
  interactions?: Interaction[]
  accessControl?: AccessControl
}

export type PageModel = {
  version: 1
  root: BlockNode
  interactions: Record<string, Interaction[]>
}

export type Interaction = {
  id: string
  trigger: InteractionTrigger
  actions: InteractionAction[]
}

export type InteractionTrigger =
  | 'page-load'
  | 'scroll-into-view'
  | 'scroll-out-of-view'
  | 'mouse-enter'
  | 'mouse-leave'
  | 'click'
  | 'scroll'

export type InteractionAction = {
  type: 'move' | 'scale' | 'rotate' | 'opacity' | 'bg-color' | 'blur' | 'border-color'
  duration: number
  delay: number
  easing: string
  from?: Record<string, number | string>
  to: Record<string, number | string>
}
```
