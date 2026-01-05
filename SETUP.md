# Detailed Setup Guide

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create project at https://supabase.com
   - Run migrations in order (001, 002, 003, 004)
   - Create `attachments` storage bucket (private)
   - Copy project URL and anon key to `.env.local`

3. **Generate TypeScript types (recommended):**
   ```bash
   npx supabase gen types typescript --project-id <your-project-id> > types/database.types.ts
   ```
   This will replace the placeholder types with actual database types for full type safety.

4. **Create admin user:**
   - Sign up through Supabase Auth UI
   - Get user UUID from Authentication → Users
   - Run SQL: `INSERT INTO profiles (user_id, role, full_name) VALUES ('<uuid>', 'ADMIN', 'Admin');`

5. **Run development server:**
   ```bash
   npm run dev
   ```

## Database Migrations

Run these SQL files in Supabase SQL Editor in order:

1. `001_initial_schema.sql` - Creates all tables, enums, indexes
2. `002_audit_triggers.sql` - Sets up audit logging triggers
3. `003_rls_policies.sql` - Configures Row Level Security
4. `004_seed_data.sql` - Inserts default settings

## Storage Setup

1. Go to Storage in Supabase Dashboard
2. Click "New bucket"
3. Name: `attachments`
4. **Uncheck "Public bucket"** (must be private)
5. Create bucket

## Environment Variables

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Role Setup

After creating users, update their roles in `profiles` table:

```sql
UPDATE profiles SET role = 'MANAGER' WHERE user_id = '<user-uuid>';
UPDATE profiles SET role = 'MIDDLE_MANAGER' WHERE user_id = '<user-uuid>';
UPDATE profiles SET role = 'PERSONNEL' WHERE user_id = '<user-uuid>';
```

## Known Issues / TODOs

- TypeScript types: Current `database.types.ts` is a placeholder. Generate real types for full type safety.
- Record locking: Structure exists but full UI integration pending
- Export/Import: CSV/XLSX functionality can be added as enhancement
- SLA notifications: Manual trigger works, automated cron job needs setup
- Attachment cleanup: 30-day retention policy needs scheduled job

## Production Deployment

1. Set environment variables in your hosting platform
2. Run migrations on production Supabase project
3. Build: `npm run build`
4. Deploy to Vercel/Netlify/etc.

## Troubleshooting

### TypeScript Errors
- Generate types from Supabase: `npx supabase gen types typescript --project-id <id> > types/database.types.ts`

### RLS Policy Errors
- Ensure migrations ran in correct order
- Check that `auth.uid()` function is available (provided by Supabase)

### Storage Upload Errors
- Verify bucket exists and is named `attachments`
- Check bucket is private (not public)
- Verify RLS policies allow inserts

### Authentication Issues
- Ensure Supabase Auth is enabled
- Check email/password provider is enabled
- Verify user exists in `auth.users` table
- Check profile exists in `profiles` table with correct role
