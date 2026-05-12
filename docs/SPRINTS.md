# Sprint Tracker — Tatomir

Full specs in PROJECT.md § 15.

| # | Sprint | Duration | Status | Priority | Depends |
|---|--------|----------|--------|----------|---------|
| S0 | Repo Setup, CI, Vercel | 1w | PENDING | P0 | — |
| S1 | Core: Auth, DB, i18n, middleware | 2w | PENDING | P0 | S0 |
| S2 | UI Kit Phase 1 | 2w | PENDING | P0 | S0 |
| S3 | Admin Shell & Dashboard | 2w | PENDING | P1 | S1, S2 |
| S4 | Collections & Content Types | 3w | PENDING | P1 | S1 |
| S5 | Advanced Post Types & Blog | 2w | PENDING | P1 | S4 |
| S6 | Multi-Provider DB & Storage | 1w | PENDING | P1 | S1 |
| S7 | Visual Editor Core (GrapesJS + Webflow UI) | 5w | PENDING | P0 | S1, S2 |
| S8 | Block Library & Symbol System | 2w | PENDING | P1 | S7 |
| S9 | Design System Panel & Tokens | 2w | PENDING | P1 | S7 |
| S10 | Animation & Interaction Builder | 3w | PENDING | P1 | S7 |
| S11 | CMS Bindings & Dynamic Data | 3w | PENDING | P0 | S7, S4 |
| S12 | Publishing Pipeline | 2w | PENDING | P0 | S11 |
| S13 | Site Auth & Member Areas | 3w | PENDING | P1 | S12 |
| S14 | Multi-lingual Site Content | 2w | PENDING | P1 | S12 |
| S15 | Media Library | 2w | PENDING | P1 | S3 |
| S16 | UI Kit Phase 2 | 1w | PENDING | P2 | S2 |
| S17 | Performance & Caching Audit | 2w | PENDING | P1 | S12 |
| S18 | Multi-site & Templates | 2w | PENDING | P2 | S12 |
| S19 | Beta Stabilisation | 2w | PENDING | P1 | All |

---

## Execution Paths

### MVP — editor works, page publishes publicly (15 weeks)
```
S0 (1w) → S1 (2w) → S2 (2w) → S7 (5w) → S11 (3w) → S12 (2w)
```

### Content Platform — add collections, posts, media (+ 9 weeks on MVP)
```
MVP + S3 (2w) + S4 (3w) + S5 (2w) + S15 (2w)
```

### Full Beta — all P0 + P1 (42 weeks, all except S16 + S18)
```
S0 → S1 → S2 → S3+S4+S6 (parallel) → S5+S7 (parallel) → S8+S9+S10+S11+S15 → S12 → S13+S14 → S17 → S19
```

---

## Priority Legend

| Level | Meaning |
|-------|---------|
| P0 | Product does not function without it |
| P1 | Core product value — required for public beta |
| P2 | Post-beta quality of life |

## Status Values

`PENDING` `IN_PROGRESS` `IN_REVIEW` `DONE` `BLOCKED`
