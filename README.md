# ilmora.space — public site mirror

This repository contains a **public HTTP mirror** of [https://ilmora.space](https://ilmora.space), captured without VPS/SSH access.

It is **not** a full private server dump. Backend source, database contents, environment secrets, and upload media are not included unless they were publicly reachable at mirror time.

## Included

- Static pages: `/`, `/about`, `/privacy`, `/terms`, `/contact`, `/admin` (admin HTML/CSS/JS shell only)
- Front-end assets: `styles.css`, `fonts.css`, `app.js`, `api.js`, `watch.js`, fonts (WOFF2 + TTF fallback), `assets/hero.webp`
- `robots.txt`, `sitemap.xml`, favicon / apple-touch icon
- Cloudflare Pages–style `_headers` (static cache + HSTS) and `_redirects` (HTTP→HTTPS, www→apex, pretty URLs)
- Sample public API responses under `docs/api-samples/` (e.g. `/api/health`, truncated `/api/videos`)

## Deploy note (redirects / cache)

If the live origin is a custom Node (or other) server behind Cloudflare — not Pages — enable **Always Use HTTPS** and a **www → apex** redirect in the Cloudflare dashboard so host canonicalization applies at the edge. `_headers` / `_redirects` apply automatically on Cloudflare Pages (and Netlify-compatible static hosts).

## Likely missing (needs server / private access)

- Node (or other) server source and deploy config
- Database dump / migrations
- `.env` / secrets / admin credentials
- Uploaded media under `/media` or admin upload storage
- Auth-only API data (`/api/stats`, `/api/shows`, `/api/catalog`, `/api/admin/*`)

## Mirror note

Captured from the live origin. Query-string cache-busting (`?v=admin2`) was normalized to clean filenames. HTML still references `/path` style URLs as on the live site.
