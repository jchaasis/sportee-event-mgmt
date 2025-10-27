# Sportee - Sports Event Management

A full-stack sports event management application built with Next.js, TypeScript, Supabase, and Tailwind CSS.

## Features

- 🔐 Authentication with Supabase (Email/Password + Google OAuth)
- 📊 Dashboard to view all sports events
- ➕ Create, edit, and delete events
- 🏟️ Multiple venues per event
- 🔍 Search and filter functionality
- 📱 Responsive design

## Tech Stack

- **Framework:** Next.js 15+ (App Router)
- **Language:** TypeScript
- **Database:** Supabase (PostgreSQL)
- **Styling:** Tailwind CSS
- **UI Components:** shadcn/ui
- **Forms:** react-hook-form + zod
- **Deployment:** Vercel

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account

### Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

You can find these values in your Supabase project settings under API.

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
npm run build
npm start
```

## Project Structure

```
app/
├── (auth)/           # Authentication pages (login, signup)
├── (dashboard)/      # Protected dashboard pages
├── api/              # API routes
└── layout.tsx        # Root layout

components/
├── auth/             # Authentication components
├── events/           # Event-related components
└── ui/               # shadcn UI components

lib/
├── supabase/         # Supabase client utilities
├── server-actions/   # Server actions
├── validations/      # Zod schemas
└── utils.ts          # Utility functions
```

## Key Features Implementation

- **Server-Side Only:** All database interactions happen server-side using Server Actions
- **Type Safety:** Full TypeScript support with Zod validation
- **RLS Policies:** Row-level security enforced via Supabase
- **Authentication:** Protected routes with middleware
- **Organizations:** Multi-tenant support with organization membership

## Next Steps

1. Set up your Supabase database schema
2. Configure authentication providers (email + Google OAuth)
3. Deploy to Vercel

## License

This project is part of a coding challenge.
