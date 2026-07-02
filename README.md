
# ☁️ CloudCanvas — Photo Gallery

A modern, responsive photo gallery app with an upload form, a masonry-style grid, and delete functionality. Built with React + TypeScript + Tailwind, backed by [Supabase](https://supabase.com) for storage and database — with a **zero-config local demo mode** that works out of the box, no backend required.

> Note: the in-app header currently displays "MemoryBox" as the product name — feel free to update `src/App.tsx` if you'd like it to say "CloudCanvas" instead.

## Features

- 🖼️ **Upload & caption photos** through a simple drag-and-drop form
- 🗂️ **Responsive grid gallery** with smooth animations (via `motion`)
- 🗑️ **Delete photos** with instant UI updates
- ☁️ **Dual storage mode**
  - **Supabase mode** — photos are uploaded to a Supabase Storage bucket and tracked in a Postgres table
  - **Local demo mode** — if no Supabase credentials are configured, the app automatically falls back to `localStorage` (photos are stored as base64) and ships with a handful of starter images so it's usable immediately
- 🧭 **Built-in setup guide** — an in-app modal walks you through creating and connecting your own Supabase project, including the exact SQL to run

## Tech Stack

- [React 19](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) for tooling and dev server
- [Tailwind CSS 4](https://tailwindcss.com/)
- [Supabase](https://supabase.com/) (Postgres + Storage)
- [lucide-react](https://lucide.dev/) for icons, [motion](https://motion.dev/) for animation

## Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)

## Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **(Optional) Configure Supabase**

   The app runs fine without this step — it'll use local demo mode. To enable persistent cloud storage:

   - Create a project at [supabase.com](https://supabase.com)
   - In the **SQL Editor**, run:
     ```sql
     CREATE TABLE photos (
       id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
       created_at TIMESTAMPTZ DEFAULT NOW(),
       url TEXT NOT NULL,
       caption TEXT,
       storage_path TEXT
     );

     ALTER TABLE photos ENABLE ROW LEVEL SECURITY;

     CREATE POLICY "Allow public read access" ON photos FOR SELECT USING (true);
     CREATE POLICY "Allow public insert access" ON photos FOR INSERT WITH CHECK (true);
     CREATE POLICY "Allow public delete access" ON photos FOR DELETE USING (true);
     ```
   - In the **Storage** tab, create a new **public** bucket named exactly `photos`
   - Copy `.env.example` to `.env.local` and fill in your project's URL and anon key:
     ```bash
     VITE_SUPABASE_URL="https://your-project-id.supabase.co"
     VITE_SUPABASE_ANON_KEY="your-anon-key-here"
     ```

   You can also find these instructions in-app via the **"Setup Supabase"** button.

3. **Run the app**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Type-check without emitting output |
| `npm run preview` | Preview the production build locally |

## Project Structure

```
src/
├── components/
│   ├── UploadForm.tsx     # Photo upload form
│   ├── PhotoGrid.tsx      # Responsive gallery grid
│   ├── PhotoCard.tsx      # Individual photo card with delete action
│   └── SupabaseGuide.tsx  # In-app setup guide modal
├── services/
│   └── photoService.ts    # Dual-mode data layer (Supabase / localStorage)
├── types.ts                # Shared TypeScript types
└── App.tsx                 # App shell & state management
```

## Clone & Run

```bash
git clone https://github.com/<your-username>/cloudcanvas.git
cd cloudcanvas
npm install
npm run dev
```


>>>>>>> 64602738871b5a4a99660dbc862bd05e318a2621
