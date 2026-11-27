# Portfolio Builder

An AI-assisted portfolio website builder. Upload your resume (`.tex`, `.md`, `.pdf`, `.docx`) and get a polished, animated portfolio website you can edit, customize, and publish — all in-browser.

**Live at:** [alro.website](https://alro.website)

---

## Features

- **Resume parsing** — `.tex` and `.md` files are parsed locally with zero AI tokens. `.pdf`/`.docx` use IBM Bob Shell if available.
- **4 templates** — Classic (dark hero), Minimal (editorial), Bold (dark + gradients), Vibrant (color-blocked orange/yellow)
- **Sticky nav** — scroll-aware navigation bar auto-highlights the active section on all templates
- **WYSIWYG editing** — click any text to edit in-place
- **Sidebar form editor** — add/remove experience, education, and project entries from the right panel
- **Image uploads** — attach photos to your portfolio
- **Game / featured work section** — dedicated card for your side project or game
- **Export** — download a self-contained static HTML file or publish to a shareable link
- **GitHub Pages wizard** — deploy directly to your own GitHub Pages site
- **localStorage auto-save** — your edits are saved between browser sessions

---

## Getting started

```bash
# From the workspace root:
npm run dev

# Or directly:
cd portfolio-app
npm run dev
```

Then open **http://localhost:3000**.

---

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values you need:

```bash
cp portfolio-app/.env.local.example portfolio-app/.env.local
```

| Variable | Required | Purpose |
|---|---|---|
| `BOB_API_KEY` | Optional | Enables AI bio generation and `.pdf`/`.docx` parsing via IBM Bob Shell |
| `BOB_PATH` | Optional | Path to `bob` binary (default: `bob`) |
| `BLOB_READ_WRITE_TOKEN` | Optional | Vercel Blob token for hosted portfolio URLs |
| `NEXT_PUBLIC_BASE_URL` | Optional | Base URL for shareable links (default: `http://localhost:3000`) |

If `BOB_API_KEY` is not set, `.tex` and `.md` parsing still work fully offline and AI steps are silently skipped.

---

## Project structure

```
portfolio-app/
├── app/
│   ├── page.tsx                  # Landing page
│   ├── build/page.tsx            # Main builder (upload → edit → publish)
│   └── portfolio/[slug]/page.tsx # Published portfolio viewer
├── components/
│   ├── editor/
│   │   ├── DataEditor.tsx        # Sidebar: add/remove/edit entries
│   │   └── EditableText.tsx      # Click-to-edit WYSIWYG components
│   ├── templates/
│   │   ├── ClassicTemplate.tsx   # Dark navy hero + timeline experience
│   │   ├── MinimalTemplate.tsx   # Editorial, full-screen giant type
│   │   ├── BoldTemplate.tsx      # Dark bg with gradient orbs
│   │   └── VibrantTemplate.tsx   # Color-blocked orange/yellow gradient
│   ├── publish/PublishPanel.tsx  # Download HTML + shareable link + GitHub Pages
│   ├── UploadZone.tsx            # Drag-and-drop file upload
│   └── TemplateSelector.tsx      # Template picker
├── lib/
│   ├── types.ts                  # PortfolioData interfaces
│   ├── granite.ts                # Bob Shell client (runBob via child_process)
│   ├── templateRegistry.ts       # Maps TemplateId → component
│   ├── parsers/
│   │   ├── tex.ts                # LaTeX parser (Allan's letter-class format)
│   │   └── md.ts                 # Markdown parser with gray-matter
│   ├── export/staticHtml.ts      # Generate self-contained HTML bundle
│   └── hooks/
│       ├── usePortfolioEditor.ts # State + localStorage auto-save
│       └── useScrollReveal.ts    # IntersectionObserver scroll animations
└── data/portfolios/
    └── demo.json                 # Demo portfolio (Allan Rondeau / alro.website)
```

---

## Deploying to alro.website (Vercel)

1. Push the repo to GitHub.
2. Import `portfolio-app` as the **root directory** in Vercel.
3. Add the environment variables from `.env.local.example`.
4. Set your custom domain to `alro.website` in Vercel Project Settings → Domains.
5. Update your DNS records to point `alro.website` to Vercel's nameservers.

For hosted portfolio URLs (`alro.website/portfolio/<slug>`), you also need a Vercel Blob store. Create one in the Vercel dashboard and set `BLOB_READ_WRITE_TOKEN`.
