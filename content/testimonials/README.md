# Testimonials

Every `.md` file in this folder is shown in the "What farmers say" section at
the bottom of the News page (`/news`) the next time the site is deployed —
commit it, push to `main`, and Vercel does the rest. While this folder has no
testimonials, the section is hidden.

Only publish real testimonials, from people who agreed to be quoted.

## Adding a testimonial

1. Create a file named **`YYYY-MM-DD-short-name.md`**, e.g. `2026-12-01-amina.md`.
   - The date is when you received it; the newest is shown first.
   - Use lowercase letters, numbers and dashes only in the short name.
2. Write a header, then the quote in English. French is optional, below a
   `=== fr ===` line:

```
---
name: Amina T.
role: Poultry farmer, Bafoussam
roleFr: Éleveuse de volailles, Bafoussam
---

PoultryPath helped me plan my first batch of 500 broilers. I lost far fewer
chicks than my neighbours, and I knew my profit before I sold a single bird.

=== fr ===

PoultryPath m’a aidée à préparer ma première bande de 500 poulets de chair…
```

- Only `name` and the quote are required. `role` (who they are, where they
  farm) is optional. Without French, French visitors see the English quote.
- Text is plain: blank lines make paragraphs. Keep quotes short — two to four
  sentences read best.
- To keep a testimonial without showing it yet, add `draft: true` to its header.
- To remove one, delete its file and deploy.

If a file has a mistake (missing name, bad file name or date), the build stops
with a message naming the file. Run `npm run build` locally to check before pushing.
