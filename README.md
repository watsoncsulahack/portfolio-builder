# Portfolio Builder

An AI-assisted portfolio website builder. Upload your resume (`.tex`, `.md`, `.pdf`, `.docx`) and get a polished, animated portfolio website you can edit, customize, and publish — all in-browser.

Powered by **IBM Bob** on **watsonx.ai**.

---

## Features

- **Resume parsing** — `.tex` and `.md` files are parsed locally with zero AI tokens. `.pdf`/`.docx` files are sent to IBM Bob (watsonx.ai Granite) for extraction.
- **5 templates** — Classic (dark hero), Minimal (editorial), Bold (dark + gradients), Vibrant (color-blocked), Terminal (monospace)
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
cd portfolio-app
cp .env.local.example .env.local   # fill in your BOB_API_KEY
npm install
npm run dev
```

Then open **http://localhost:3000**.

---

## Environment variables

Copy `.env.local.example` to `.env.local` and fill in the values:

| Variable | Required | Purpose |
|---|---|---|
| `BOB_API_KEY` | Optional | Enables AI bio generation and `.pdf`/`.docx` parsing via IBM Bob |
| `BOB_PATH` | Optional | Path to `bob` binary (default: `bob`) |
| `BLOB_READ_WRITE_TOKEN` | Optional | Vercel Blob token for hosted portfolio URLs |
| `NEXT_PUBLIC_BASE_URL` | Optional | Base URL for shareable links |

If `BOB_API_KEY` is not set, `.tex` and `.md` parsing still work fully offline and AI steps are silently skipped.

---

## Deploying to Vercel

1. Push this repo to GitHub (already done — see `watsoncsulahack/portfolio-builder`).
2. Go to [vercel.com/new](https://vercel.com/new) → **Import Git Repository** → select `portfolio-builder`.
3. Set the **Root Directory** to `portfolio-app` (or leave blank if deploying from repo root).
4. Add environment variables from `.env.local.example` in the Vercel dashboard.
5. Click **Deploy**.

For hosted portfolio URLs (`/portfolio/<slug>`), create a Vercel Blob store in the dashboard and set `BLOB_READ_WRITE_TOKEN`.

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
│   ├── templates/                # 5 portfolio templates
│   ├── publish/PublishPanel.tsx  # Download HTML + shareable link + GitHub Pages
│   ├── UploadZone.tsx            # Drag-and-drop file upload
│   └── TemplateSelector.tsx     # Template picker
├── lib/
│   ├── types.ts                  # PortfolioData interfaces
│   ├── granite.ts                # IBM Bob Shell client (runBob via child_process)
│   ├── templateRegistry.ts       # Maps TemplateId → component
│   ├── parsers/
│   │   ├── tex.ts                # LaTeX resume parser
│   │   └── md.ts                 # Markdown parser (gray-matter)
│   ├── export/staticHtml.ts      # Generate self-contained HTML bundle
│   └── hooks/
│       ├── usePortfolioEditor.ts # State + localStorage auto-save
│       └── useScrollReveal.ts    # IntersectionObserver scroll animations
└── data/portfolios/
    └── demo.json                 # Sanitized demo portfolio
```
