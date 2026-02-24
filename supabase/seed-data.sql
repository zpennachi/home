-- Seed data for projects table

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('hawkeye', 'Hawkeye', 'Engineering', 'Computer Vision', 'A high-frequency skeletal tracking visualization engine for sports analytics, processing 60Hz joint data for 3D game reconstruction.', '## Overview

Hawkeye is a specialized visualization engine designed for professional sports analytics. It ingests raw computer vision data—specifically 3D skeletal tracking of 22 joints per player—and reconstructs the game in a high-fidelity 3D environment.

## The Problem

Coaches and analysts struggle to see the "whole picture" from broadcast angles. 2D video flattens depth and obscures off-ball movement. Hawkeye provides a god-mode view of the court, allowing for spatial querying and tactical analysis that was previously impossible.

## Key Features

- **60Hz Smooth Playback**: Custom interpolation logic to handle dropped frames and sensor noise.
- **Spatial Queries**: Filter plays by player spacing, defensive breakdown, or shot arc.
- **3D Replay**: View any play from any angle, including the player''s own perspective (First-Person View).', ARRAY['@react-three/drei', '@react-three/fiber', 'leva', 'maath', 'react', 'react-dom', 'three'], NULL, ARRAY[]::text[], 'supabase')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  images = EXCLUDED.images;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('MVPIQ', 'MVP IQ', 'Product', 'Web App', 'A platform connecting high school football players with professional athletes for video analysis and feedback.', '## Overview

MVP IQ is a video feedback platform that democratizes access to elite coaching. It enables high school football players to upload game footage and receive detailed, time-stamped video analysis from professional athletes and mentors.

## Key Features

- **Player & Mentor Dashboards**: Distinct interfaces for athletes to manage submissions and mentors to provide feedback.
- **Video Analysis Pipeline**: Secure video upload (Supabase Storage), transcoding, and playback.
- **Monetization**: Integrated Stripe payments for per-submission feedback fees.
- **Role-Based Security**: Strict Row Level Security (RLS) policies ensuring data privacy between users.

## User Journey

### Player Flow
1. **Upload**: Players upload raw game footage (up to 100MB).
2. **Request**: They select a specific play or clip and request feedback ($50/video).
3. **Payment**: Secure checkout via Stripe triggers the feedback request.
4. **Review**: Once analyzed, they receive a notification to view the annotated video.

### Mentor Flow
1. **Queue**: Mentors view a dashboard of pending submissions.
2. **Analyze**: They watch the footage and provide a star rating + detailed written critique.
3. **Complete**: Submitting the feedback triggers the payout and notifies the player.

## Technical Architecture

Built on **Next.js 14** (App Router) for server-side rendering and performance. **Supabase** handles the heavy lifting of authentication, database (PostgreSQL), and real-time event subscriptions.

- **Authentication**: Supabase Auth with custom role management (Player vs. Mentor).
- **Database**: PostgreSQL with complex RLS policies to secure user data.
- **Payments**: Stripe Connect integration for handling payout flows to mentors.
- **UI System**: Tailwind CSS with a custom design system for a cohesive, athletic aesthetic.', ARRAY['next', 'supabase', 'stripe', 'tailwind', 'typescript', 'postgresql'], NULL, ARRAY['/work/mvpiq/hero.png', '/work/mvpiq/logo.svg'], 'supabase')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  images = EXCLUDED.images;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('particle-life-131', 'Particle Life', 'Creative Coding', 'WebGL', 'This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.', '# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores([''dist'']),
  {
    files: [''**/*.{ts,tsx}''],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: [''./tsconfig.node.json'', ''./tsconfig.app.json''],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from ''eslint-plugin-react-x''
import reactDom from ''eslint-plugin-react-dom''

export default defineConfig([
  globalIgnores([''dist'']),
  {
    files: [''**/*.{ts,tsx}''],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs[''recommended-typescript''],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: [''./tsconfig.node.json'', ''./tsconfig.app.json''],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
', ARRAY['@react-three/drei', '@react-three/fiber', '@react-three/postprocessing', '@types/three', 'leva', 'postprocessing'], NULL, ARRAY[]::text[], 'supabase')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  images = EXCLUDED.images;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('streamer', 'Streamer Tools', 'Engineering', 'Node.js', 'Invite-only, authenticated livestream page with realtime chat + admin moderation.', '## Streamer MVP (private Twitch-like)

Invite-only, authenticated livestream page with realtime chat + admin moderation.

**Stack**
- Next.js (App Router, TypeScript)
- Supabase (Auth magic links, Postgres, Realtime)
- Tailwind CSS
- Video via AWS IVS (RTMP ingest → HLS playback) or Cloudflare Stream Live

## Getting Started

### 1) Configure environment variables

Create `.env.local` from `env.example.txt` and fill in values.

### 2) Create Supabase schema (roles/invites/chat/moderation)

In your Supabase project:
- Go to **SQL Editor**
- Run `supabase/schema.sql`

Then in **Auth → URL Configuration**, set:
- **Site URL**: `http://localhost:3005`
- (Magic link redirect URLs are not needed for the current email+password MVP)

### 3) Run the dev server

```bash
npm run dev
```

Open `http://localhost:3005`.

### 4) First admin

To create your first admin, insert an invite row for your email with role `admin`:
- Table: `public.invites`
- Columns: `email`, `role`

Then log in using email + password (account created in Supabase Auth).

---

More detailed setup (Supabase + AWS IVS/Cloudflare + OBS) is in `supabase/SETUP.md`.
', ARRAY['@stripe/react-stripe-js', '@stripe/stripe-js', '@supabase/ssr', '@supabase/supabase-js', 'clsx', 'hls.js'], NULL, ARRAY[]::text[], 'supabase')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  images = EXCLUDED.images;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('streamer-portfolio', 'Streamer Portfolio', 'Design', 'Web', 'Award‑worthy designer portfolio: editorial typography, high contrast, intentional motion, performance‑first. Suited for Awwwards / Dribbble‑style presentation.', '# Designer Portfolio

Award‑worthy designer portfolio: editorial typography, high contrast, intentional motion, performance‑first. Suited for Awwwards / Dribbble‑style presentation.

---

## Tech Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** — utility‑first, design tokens (spacing, type, color)
- **Framer Motion** — scroll reveals, hero animations, reduced‑motion support
- **Inter** (variable font) via `next/font`

Optional extensions (not included): **GSAP ScrollTrigger**, **Locomotive Scroll**, **R3F / WebGL** for project heroes.

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Run dev server

```bash
npm run dev
```

Open [http://localhost:3005](http://localhost:3005).

### 3. Build for production

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
├── app/
│   ├── globals.css       # Design tokens (CSS vars), base styles, reduced-motion
│   ├── layout.tsx        # Root layout: Nav, main, Footer, FluidCursor, skip link
│   ├── page.tsx          # Homepage: Hero → Work → About → Contact
│   ├── not-found.tsx     # Global 404
│   └── projects/
│       └── [slug]/
│           ├── page.tsx        # Project detail (dynamic)
│           └── not-found.tsx   # Project 404
├── components/
│   ├── Nav.tsx           # Sticky nav; hidden-until-scroll background; mobile menu
│   ├── Hero.tsx          # Oversized headline, subline, CTA
│   ├── ProjectCard.tsx   # Project grid item; image + title; hover scale
│   ├── ProjectGrid.tsx   # Work section; grid of ProjectCards
│   ├── ProjectDetailTemplate.tsx  # Split layout: content + visuals
│   ├── About.tsx         # About section
│   ├── Contact.tsx       # Contact section
│   ├── Footer.tsx        # Footer nav + socials + copyright
│   ├── ScrollReveal.tsx  # Scroll-triggered reveal (IntersectionObserver)
│   └── FluidCursor.tsx   # Desktop-only cursor glow; reduced-motion aware
├── data/
│   └── projects.ts       # Project index + detail data; replace with real content
├── lib/
│   └── design-tokens.ts  # Tokens for JS (Figma handoff, etc.)
└── ...
docs/
├── FIGMA_STYLE_GUIDE.md  # Colors, grid, type scale, motion — Figma-ready
├── COMPONENT_LIST.md     # Components, states, ARIA
├── HOMEPAGE_LAYOUT.md    # Hero → Work → About → Contact
└── PROTOTYPING_OUTLINE.md # Routes, interactions, keyboard nav
public/                   # Static assets (favicon, images)
```

---

## What Each Piece Does

### Layout & global

- **`layout.tsx`** — Wraps all pages with Nav, main (`#main`), Footer. Injects skip link and FluidCursor. Uses Inter via `next/font`.
- **`globals.css`** — Tailwind base; CSS variables for colors, grid, motion. `prefers-reduced-motion` overrides durations to 0.

### Homepage

- **`page.tsx`** — Composes Hero, ProjectGrid, About, Contact. Single scroll flow.
- **`Hero`** — Large headline (≥96px), optional subline, “View work” CTA. Staggered fade‑in; respects reduced motion.
- **`ProjectGrid`** — “Selected work” heading + grid of `ProjectCard`s. Data from `data/projects`.
- **`ProjectCard`** — Image (4:3), title, meta. Link to `/projects/[slug]`. Hover scale + overlay; scroll reveal with stagger.
- **`About`** / **`Contact`** — ScrollReveal sections; short copy and email link.

### Project detail

- **`projects/[slug]/page.tsx`** — Resolves `slug` via `getProjectBySlug`, renders `ProjectDetailTemplate`. `generateStaticParams` prebuilds known slugs.
- **`ProjectDetailTemplate`** — Back link, hero image, split layout: left = title/meta/description, right = body + gallery. Scroll reveals throughout.

### Shared components

- **`Nav`** — Logo, Work / About / Contact. Background appears on scroll. Mobile: hamburger + collapsible menu.
- **`Footer`** — Same nav links + socials + copyright.
- **`ScrollReveal`** — Wraps children; when in view (Framer `whileInView`), animates opacity + y/x. `once`, optional delay, `amount`. Disabled when `prefers-reduced-motion: reduce`.
- **`FluidCursor`** — Follows mouse; glow scales on hover. Desktop only; hidden on touch and when reduced motion.

### Data & config

- **`data/projects`** — `projects` (grid), `projectDetails` (detail), `getProjectBySlug`. Replace with your projects and assets.
- **`tailwind.config`** — Design tokens: spacing (8pt grid), colors, type scale, motion. Mirrors `design-tokens.ts` and style guide.
- **`next.config`** — `images.remotePatterns` for picsum (or your image host).

---

## Design Constraints

- **Typography:** Hero ≥96px, H2 ≥56px, body 18–20px. Inter (or swap for GT America / Neue Haas Grotesk).
- **Color:** Black / near‑black bg, white text, **one accent** (`#ff3d00`).
- **Spacing:** 8pt base grid.
- **Motion:** Scroll reveals, hover micro‑interactions, fluid cursor. All respect `prefers-reduced-motion`.

---

## Accessibility

- Skip link to `#main`; focus‑visible only.
- Semantic layout: `main`, `nav`, `header`, `footer`, `article`, sections with `aria-labelledby`.
- Keyboard navigation; focus rings (accent, 2px offset).
- Reduced motion: no scroll/load animations when user prefers reduced motion.

---

## Performance

- **Code‑splitting:** Next.js automatic; project detail route is its own chunk.
- **Images:** `next/image`; `priority` on hero and first two project cards; lazy load rest. `remotePatterns` for external URLs.
- **Fonts:** `next/font` for Inter; minimal layout shift.

---

## Docs

| Doc | Purpose |
|-----|---------|
| **FIGMA_STYLE_GUIDE** | Colors, grid, type scale, motion — Figma setup |
| **COMPONENT_LIST** | Components, states, ARIA |
| **HOMEPAGE_LAYOUT** | Hero → Work → About → Contact |
| **PROTOTYPING_OUTLINE** | Routes, clicks, scroll, keyboard |
| **DESIGN_TOKENS.json** | Machine-readable tokens (Figma, etc.) |

---

## Customization

1. **Content:** Edit `data/projects.ts`; add real images (e.g. under `public/`) and update `image` paths.
2. **Colors / type:** Adjust `tailwind.config` and `globals.css`; keep `design-tokens` and `FIGMA_STYLE_GUIDE` in sync.
3. **Nav / footer:** Update links in `Nav`, `Footer`, and project data.
4. **Contact:** Change `mailto` in `Contact.tsx`.

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Dev server (port 3005) |
| `npm run build` | Production build |
| `npm start` | Run production server |
| `npm run lint` | Next.js ESLint |

---

Built with Next.js, Tailwind, and Framer Motion. Replace placeholder copy and images with your work to ship.
', ARRAY['next', 'react', 'react-dom', 'framer-motion', '@types/node', '@types/react'], NULL, ARRAY[]::text[], 'supabase')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  images = EXCLUDED.images;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('Volumetric-Design-System-ESR--main', 'Volumetric Design System', 'Research', 'VR / Unity', 'The **Volumetric Design System** is an immersive audio-visual platform developed for **Edge Sound Research (ESR)**. It translates complex spatial data—such as NBA player tracking (Hawkeye) and biometric sensors—into premium, high-fidelity 3D experiences with integrated spatial audio.', '# Volumetric Design System (ESR)

![ESR Logo](https://img.shields.io/badge/Edge_Sound_Research-Volumetric-orange)
![Tech Stack](https://img.shields.io/badge/Stack-Next.js%20|%20R3F%20|%20Supabase-blue)

The **Volumetric Design System** is an immersive audio-visual platform developed for **Edge Sound Research (ESR)**. It translates complex spatial data—such as NBA player tracking (Hawkeye) and biometric sensors—into premium, high-fidelity 3D experiences with integrated spatial audio.

## 🚀 Vision
To redefine how audiences experience live sports and digital environments by "embodying" sound within physical and virtual space. Our system doesn''t just show data; it creates a visceral connection between the viewer and the event through synchronized volumetric rendering and HLS-driven spatial audio.

## 🛠 Tech Stack
- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **3D Engine**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) / [Three.js](https://threejs.org/)
- **State Management**: [Zustand](https://github.com/pmndrs/zustand)
- **Database/Auth**: [Supabase](https://supabase.com/) (pgvector for AI memory)
- **Animations**: [GSAP](https://greensock.com/gsap/) & [Framer Motion](https://www.framer.com/motion/)
- **Data Ingestion**: Server-Sent Events (SSE) for raw tracking feeds

## 💎 Key Features

### 1. Hawkeye Live NBA Visualization
A real-time 3D reconstruction of NBA games using Hawkeye tracking data.
- **Interpolated Sync**: Custom playback engine that synchronizes jittery raw data into smooth 60fps animations.
- **Embedded Audio**: HLS audio streams are "attached" to the ball or players in 3D space with professional-grade attenuation.
- **Skeleton Rendering**: Full 17-point skeletal pose estimation reconstructed in real-time.

### 2. ESR Intelligence (AI Chat & Slack)
A sophisticated AI layer that provides context and insight over the entire ESR ecosystem.
- **Global Truth Node**: Centralized knowledge base of ESR business logic and project history.
- **Slack Integration**: An automated bot that monitors channels for design/dev feedback and updates the knowledge graph.
- **Vector Memory**: Uses `pgvector` in Supabase to maintain long-term context across conversations.

### 3. "Embodied Sound" Painter
A premium generative art experience that visualizes sound as a "painter" moving through space.
- **Dynamic Particles**: GPU-accelerated particle systems that react to audio frequencies.
- **Organic Motion**: Physics-based character controllers that simulate "dancing" or "sitting" based on ambient data.

## 📂 Project Structure
- `/app`: Next.js pages and API routes.
- `/components/hawkeye`: Core logic for the NBA tracking visualization.
- `/components/painter`: Generative art and character logic.
- `/lib/supabase`: Database schemas and vector search utilities.
- `/agent`: Custom AI agent workflows and context.

## 🛠 Getting Started
1. Clone the repository.
2. Install dependencies: `npm install`
3. Set up environment variables for Supabase and NBA API.
4. Run the development server: `npm run dev`

---
© 2024 Edge Sound Research. Confidential & Proprietary.
', ARRAY['@ai-sdk/openai', '@ai-sdk/react', '@react-three/drei', '@react-three/fiber', '@react-three/postprocessing', '@react-three/xr'], NULL, ARRAY[]::text[], 'supabase')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  images = EXCLUDED.images;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('0ghost-chat', '0Ghost', 'Engineering', 'Zero-Trust Architecture', 'A comprehensive engineering deep-dive into a Zero-Trust communication protocol, featuring Capability-Based Access Control (CapBAC) and client-side RSA-OAEP key exchange.', '## Engineering Overview

0Ghost (codenamed `athoughtful.fun`) is an implementation of **Zero-Trust Architecture** applied to messaging. It challenges the traditional server-authoritative model by pushing all identity and cryptographic operations to the client edge.

## Core Architecture

### 1. Capability-Based Access Control (CapBAC)
Unlike Role-Based Access Control (RBAC) which asks "Who are you?", CapBAC asks "What can you do?". Users possess cryptographic **Capability Tokens**—high-entropy bearer keys—that grant specific, temporary rights (e.g., `SEND_MESSAGE`, `READ_CIRCLE`) to the relay server. This decouples permission from identity.

### 2. Client-Side Cryptography
- **Identity**: `RSA-OAEP` keypairs generated via `crypto.subtle` in the browser. Keys are stored in `IndexedDB` and never transmitted.
- **Transport**: Messages are encrypted with `AES-256-GCM` using rotating symmetric keys.
- **Exchange**: Key distribution is 100% out-of-band (QR Code / Manual). The server never brokers keys, eliminating Man-in-the-Middle vectors.

### 3. Database Isolation
Supabase Row Level Security (RLS) policies are used strictly for enforcement. The database stores opaque ciphertext blobs which it cannot inspect, ensuring true Zero Knowledge storage.', ARRAY['next', 'supabase', 'webcrypto', 'tailwind', 'typescript', 'zustand'], 'https://github.com/zpennachi/0ghost', ARRAY[]::text[], 'supabase')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  images = EXCLUDED.images;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('OHM-site', 'OHM', 'Brand', 'Web', 'No description provided.', '# OHM-site', ARRAY[]::text[], NULL, ARRAY[]::text[], 'supabase')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  images = EXCLUDED.images;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('weekend', 'Weekend', 'Creative Engineering', 'React Three Fiber', 'A cinematic, high-performance 3D portfolio foundation. A ''ghost-weight'' framework for immersive web experiences.', '## Overview

Weekend is a production-ready research project into high-performance, cinematic 3D web experiences. It serves as a "ghost-weight" foundation—invisible but omnipresent—handling the heavy lifting of WebGL state management, asset preloading, and scroll synchronization so creators can focus purely on the art.

## The Philosophy

Most 3D websites feel heavy. They load slowly, scroll jankily, and drain batteries. Weekend was built to prove that **immersion doesn''t require optimization sacrifices**. It treats the scrollbar as a timeline, turning a website into a playable movie.

## Key Capabilities

- **Cinematic Pacing**: Scroll acts as a ''playhead'', scrubbing through GSAP timelines and R3F animations seamlessly.
- **Adaptive Performance**: Automatically scales internal resolution (DPR) based on device power and current frame variance.
- **Hybrid Animation**: A unique orchestrator that syncs DOM (Framer Motion) and Canvas (GSAP/Maath) timelines.
- **Accessibility First**: First-class support for `prefers-reduced-motion`, instantly swapping 3D flythroughs for static optimized compositions.

## Technical Core

- **Renderer**: React Three Fiber (Three.js) with custom shader materials.
- **State**: Zustand for global gl/dom synchronization.
- **Motion**: GSAP for complex timelines, Framer Motion for UI entry/exit.
- **Optimization**: Draco compression, texture atlasing, and aggressive lazy-loading of off-screen geometry.', ARRAY['@react-three/fiber', '@react-three/drei', 'gsap', 'framer-motion', 'zustand', 'vite'], 'https://github.com/zpennachi/weekend', ARRAY[]::text[], 'supabase')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  images = EXCLUDED.images;
