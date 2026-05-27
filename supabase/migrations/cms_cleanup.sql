-- CMS Cleanup Migration

-- 1. Delete Hidden Projects
DELETE FROM projects WHERE id IN ('vantage', 'nexus', 'synthetix', 'weekend', 'streamer-portfolio');

-- 2. Upsert Active Projects

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('krampus', 'Krampus Slap Fight', 'Interactive AR', '8th Wall / WebAR', 'A strength-based AR mini-game where users ''slap'' a character to trigger branching reaction animations.', '## Executive Summary

**Krampus Slap Fight** is a multi-step AR mini-game designed for a holiday campaign. Users engage in a strength-based interaction: holding a ''slap'' button builds up power, which triggers one of several branching reaction animations from the 3D Krampus character. The experience concludes with a ''My turn'' retaliation sequence, an outro loop with randomized backgrounds, and a retry/share flow.

## The Challenge

The primary technical challenge was creating a responsive, physics-like interaction (the ''slap'') within the constraints of WebAR. The system needed to detect touch duration, map it to a strength variance, and seamlessly blend into the correct animation state (weak vs. strong reaction) without visual popping. Additionally, the asset pipeline required optimizing a high-fidelity character rig for mobile browser performance while maintaining detailed facial expressions.

## Key Features

- **Strength-Based Input**: A ''charge-up'' mechanic that branches the narrative based on user participation.
- **Branching Animation Tree**: Distinct reaction timelines for ''Tickle'', ''Normal'', and ''Powerful'' hits.
- **Dynamic Outro**: A randomized background system that keeps the replay loop fresh.
- **Desktop Capability**: A fallback flow to ensure the campaign was accessible on all devices, despite being mobile-first.', ARRAY['8thwall', 'three', 'javascript', 'html5', 'css3'], NULL, ARRAY[]::text[], 'local')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('box-nn', '8th Wall Box + Naughty/Nice', 'Interactive AR', '8th Wall / WebAR', 'A combined image-tracking and face-tracking experience merging a physical box scan with a Naughty/Nice determination.', '## Executive Summary

This project merged two distinct AR modalities—image tracking and face tracking—into a single seamless web experience. Users scan a physical gift box to unlock content, which then transitions into a selfie-based ''Naughty or Nice'' determination game. The experience drives users to a commercial CTA (ticket purchase) upon completion.

## The Challenge

Memory management was the critical bottleneck. Running image tracking (for the box) and face tracking (for the game) simultaneously in a mobile browser pushed the limits of WebGL memory. We had to implement aggressive asset disposal and de-scoping (removing non-essential particle effects and a beautifying layer) to ensure stability across mid-range devices. The ''no native background removal'' constraint of 8th Wall also required creative vignetting to frame the user.

## Key Features

- **Hybrid Tracking**: Seamless handover from world-tracking/image-target to front-facing camera.
- **Logic Gating**: A ''max re-trigger'' logic to prevent users from spamming the determination result.
- **Integrated Commerce**: A direct ''Buy Tickets'' flow woven into the AR ending.', ARRAY['8thwall', 'three', 'javascript', 'glsl'], NULL, ARRAY[]::text[], 'local')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('nn-snap', 'Naughty/Nice (Snap)', 'Social AR', 'Snapchat Lens', 'A viral social lens using facial feature detection (smile/no-smile) to determine a user''s holiday status.', '## Executive Summary

**Naughty/Nice (Snap)** is a social-first lens built for the Snapchat platform. Unlike the WebAR version, this lens leverages Snap''s native facial feature detection to drive the logic: the ''Smile'' vs. ''No Smile'' state directly triggers the Naughty or Nice outcome. The experience is optimized for rapid sharing, with a clean UI-free ''selfie moment'' at the climax.

## The Challenge

The main engineering hurdle was tuning the determination logic to feel fair but random. We encountered issues where the randomizer would streak (e.g., 5 ''Nice'' results in a row), requiring a pseudo-random distribution fix. We also had to rigorously optimize the ''meter'' animation to ensure the needle movement felt weighted and physical, rather than just playing a linear video.

## Key Features

- **Smile Detection Trigger**: ''Not Smiling'' is the trigger input, inverting standard AR interactions.
- **Clean Capture Mode**: Automated UI hiding ensures the final shared asset is free of buttons or text clutter.
- **Polished Physics**: Custom animation curves for the determination wheel to remove ''robotic'' pauses.', ARRAY['lens-studio', 'javascript', 'visual-scripting'], NULL, ARRAY[]::text[], 'local')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('snowmen', 'Snowmen Attack', 'AR Game', '8th Wall / WebAR', 'A survival shooter where an ice cream truck spawns attacking snowmen. Features headshot mechanics and high scores.', '## Executive Summary

**Snowmen Attack** is a full-featured AR survival shooter. An ice cream truck drives into the user''s real-world environment, opens its doors, and spawns waves of hostile snowmen. The user must tap to shoot, with distinct damage modeling for headshots (instakill) vs. body shots. The game tracks a high score and features a polished particle system for enemy defeat.

## The Challenge

Balancing gameplay performace with tracking stability was key. We had to implement a ''camera flip'' workaround because 8th Wall restricts custom buttons from triggering hardware camera swaps, requiring a custom instructional UI flow. On the rendering side, we used object pooling for the snowballs and snowmen to maintain a steady 60fps even during chaotic waves.

## Key Features

- **Damage Modeling**: Headshots grant more points and instant kills; body shots require double taps.
- **Particle Emitters**: Custom particle systems for ''snow explosion'' death effects.
- **Object Pooling**: Optimized entity management to prevent garbage collection stutters.
- **Spatial Audio**: 3D sound effects for truck arrival and projectile impacts.', ARRAY['8thwall', 'three', 'a-frame', 'javascript'], NULL, ARRAY[]::text[], 'local')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('hawkeye', 'Hawkeye', 'Engineering', 'Computer Vision', 'A high-frequency skeletal tracking visualization engine for sports analytics, processing 60Hz joint data for 3D game reconstruction.', '## Overview

Hawkeye is a specialized visualization engine designed for professional sports analytics. It ingests raw computer vision data—specifically 3D skeletal tracking of 22 joints per player—and reconstructs the game in a high-fidelity 3D environment.

## The Problem

Coaches and analysts struggle to see the "whole picture" from broadcast angles. 2D video flattens depth and obscures off-ball movement. Hawkeye provides a god-mode view of the court, allowing for spatial querying and tactical analysis that was previously impossible.

## Key Features

- **60Hz Smooth Playback**: Custom interpolation logic to handle dropped frames and sensor noise.
- **Spatial Queries**: Filter plays by player spacing, defensive breakdown, or shot arc.
- **3D Replay**: View any play from any angle, including the player''s own perspective (First-Person View).', ARRAY['@react-three/drei', '@react-three/fiber', 'leva', 'maath', 'react', 'react-dom', 'three'], NULL, ARRAY[]::text[], 'local')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;

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
- **UI System**: Tailwind CSS with a custom design system for a cohesive, athletic aesthetic.', ARRAY['next', 'supabase', 'stripe', 'tailwind', 'typescript', 'postgresql'], NULL, ARRAY['/work/mvpiq/hero.png', '/work/mvpiq/logo.svg'], 'local')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;

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
', ARRAY['@react-three/drei', '@react-three/fiber', '@react-three/postprocessing', '@types/three', 'leva', 'postprocessing'], NULL, ARRAY[]::text[], 'local')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;

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
', ARRAY['@stripe/react-stripe-js', '@stripe/stripe-js', '@supabase/ssr', '@supabase/supabase-js', 'clsx', 'hls.js'], NULL, ARRAY[]::text[], 'local')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;

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
', ARRAY['@ai-sdk/openai', '@ai-sdk/react', '@react-three/drei', '@react-three/fiber', '@react-three/postprocessing', '@react-three/xr'], NULL, ARRAY[]::text[], 'local')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;

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
Supabase Row Level Security (RLS) policies are used strictly for enforcement. The database stores opaque ciphertext blobs which it cannot inspect, ensuring true Zero Knowledge storage.', ARRAY['next', 'supabase', 'webcrypto', 'tailwind', 'typescript', 'zustand'], 'https://github.com/zpennachi/0ghost', ARRAY[]::text[], 'local')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;

INSERT INTO projects (id, title, category, medium, description, content, stack, repo, images, source)
VALUES ('OHM-site', 'OHM', 'Brand', 'Web', 'No description provided.', '# OHM-site', ARRAY[]::text[], NULL, ARRAY[]::text[], 'remote')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  medium = EXCLUDED.medium,
  description = EXCLUDED.description,
  content = EXCLUDED.content,
  stack = EXCLUDED.stack,
  repo = EXCLUDED.repo,
  images = EXCLUDED.images,
  source = EXCLUDED.source;
