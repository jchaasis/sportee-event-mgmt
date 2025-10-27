# Environment Setup Guide

## Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

## Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Create a new project or select an existing one
3. Navigate to **Project Settings** → **API**
4. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon/public key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role key** → `SUPABASE_SERVICE_ROLE_KEY`

## Important Notes

- **Never commit `.env.local` to version control** - it's already in `.gitignore`
- **Never expose the service_role key** on the client side
- The service_role key should only be used in server-side operations
- The anon key is safe to expose to the client (used in browser)

## Next Steps After Environment Setup

1. Set up your Supabase database schema (see Phase 2 in project plan)
2. Configure authentication providers in Supabase
3. Run the application with `npm run dev`

