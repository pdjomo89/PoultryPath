# News articles

Every `.md` file in this folder is published on the News page (`/news`) the next
time the site is deployed — commit it, push to `main`, and Vercel does the rest.
Articles written in the admin page (`/admin` → News) still work and appear
alongside these.

## Writing an article

1. Create a file named **`YYYY-MM-DD-short-name.md`**, e.g. `2026-12-01-feed-costs.md`.
   - The date is the article's publication date; the newest is shown first.
   - The short name becomes the link: `/news/feed-costs`. Use lowercase letters,
     numbers and dashes only, and don't change it once published (old links would break).
2. Start it with a header, then the English text. French is optional, below a
   `=== fr ===` line:

```
---
title: Cutting feed costs without cutting growth
titleFr: Réduire le coût de l’alimentation sans freiner la croissance
summary: One or two sentences shown on the News page card.
summaryFr: Une ou deux phrases affichées sur la carte de l’article.
---

First paragraph in English.

Second paragraph. Leave a blank line between paragraphs.

=== fr ===

Premier paragraphe en français.
```

- Only `title` is required. Without `summary`, the first paragraph is used.
  Without French, French visitors see the English article with a short note.
- Text is plain: blank lines make paragraphs. Markdown formatting such as
  `**bold**` or links is **not** applied — it shows as typed.
- To keep an article in the repo without publishing it yet, add `draft: true` to its header.
- To unpublish an article, delete its file (or mark it `draft: true`) and deploy.

If a file has a mistake (missing title, bad file name or date), the build stops
with a message naming the file, so nothing broken reaches the live site.
Run `npm run build` locally to check before pushing.
