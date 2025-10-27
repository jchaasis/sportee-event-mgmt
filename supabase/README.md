# Supabase Database Setup

This directory contains the database schema for the Sportee application.

## Setup Instructions

### 1. Open Supabase SQL Editor

1. Go to your [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Navigate to the **SQL Editor** in the left sidebar
4. Click **New query**

### 2. Run the Schema

1. Copy the contents of `schema.sql`
2. Paste it into the SQL Editor
3. Click **Run** (or press Cmd/Ctrl + Enter)

This will create:
- All necessary tables
- Indexes for performance
- Row Level Security (RLS) policies
- Triggers for automatic timestamp updates

### 3. Verify Installation

You can verify the installation by running this query in the SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('organizations', 'organization_members', 'events', 'venues', 'event_venues');
```

You should see all 5 tables listed.

### 4. Set Up Authentication Providers

1. Navigate to **Authentication** → **Providers** in your Supabase dashboard
2. Enable **Email** provider (enabled by default)
3. Enable **Google** provider:
   - Click on Google
   - Toggle "Enable Google provider"
   - Follow instructions to set up OAuth credentials
   - Add the redirect URL: `https://your-project.supabase.co/auth/v1/callback`

### 5. Configure Authentication Settings

1. Go to **Authentication** → **Settings**
2. Set **Site URL** to your development URL: `http://localhost:3000`
3. Add **Redirect URLs**:
   - `http://localhost:3000/**` (for development)
   - `https://your-domain.vercel.app/**` (for production - after deployment)

## Database Schema Overview

### Tables

- **organizations**: Stores organization/company information
- **organization_members**: Links users to organizations
- **venues**: Stores venue information (can be shared across events)
- **events**: Stores event information
- **event_venues**: Many-to-many relationship between events and venues

### Security

All tables have Row Level Security (RLS) enabled to ensure:
- Users can only see events from their own organization
- Users can only create/edit/delete events they created
- Organization members have appropriate access

## Next Steps

After setting up the database:

1. Configure your `.env.local` file with Supabase credentials
2. Test authentication locally
3. Start building features!

## Troubleshooting

### "relation already exists" errors

If you see errors about relations already existing, you can drop all tables first:

```sql
-- WARNING: This deletes ALL data!
DROP TABLE IF EXISTS event_venues CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS venues CASCADE;
DROP TABLE IF EXISTS organization_members CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;
```

Then run the schema again.

### RLS not working

Make sure RLS is enabled on all tables. You can check with:

```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

All tables should have `rowsecurity = true`.

