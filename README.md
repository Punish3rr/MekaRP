# Office → Workshop Work Tracking

Production-ready web application for tracking work orders from office to multiple workshops.

## Tech Stack

- **Next.js 14+** (App Router) with TypeScript
- **Supabase** (PostgreSQL, Auth, Storage)
- **Tailwind CSS** + **shadcn/ui** components
- **TanStack Table** for data tables
- **React Hook Form** + **Zod** for form validation
- Server Actions / Route Handlers

## Prerequisites

- Node.js 18+ and npm
- Supabase account and project
- Git

## Setup Instructions

### 1. Clone and Install

```bash
npm install
```

### 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com
2. Go to SQL Editor and run all migrations in order:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_audit_triggers.sql`
   - `supabase/migrations/003_rls_policies.sql`
   - `supabase/migrations/004_seed_data.sql`

3. Create a Storage bucket named `attachments` (private bucket)
   - Go to Storage → Create bucket
   - Name: `attachments`
   - Make it private (uncheck "Public bucket")

4. Set up Authentication providers (Email/Password at minimum)

5. Generate TypeScript types (optional but recommended):
   ```bash
   npx supabase gen types typescript --project-id <your-project-id> > types/database.types.ts
   ```
   Note: The current `types/database.types.ts` file is a placeholder. Generating types from your Supabase project will provide full type safety.

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from your Supabase project settings → API.

### 4. Create Initial Admin User

1. Sign up a user through Supabase Auth UI or API
2. Get the user's UUID from Supabase Dashboard → Authentication → Users
3. Run this SQL in Supabase SQL Editor:

```sql
INSERT INTO profiles (user_id, role, full_name)
VALUES ('09bc80fc-b8bd-46f9-b12d-4b4b614fa8bb', 'ADMIN', 'Admin User')
ON CONFLICT (user_id) DO UPDATE SET role = 'ADMIN';
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Migrations

Migrations are located in `supabase/migrations/`. Run them in order:

1. `001_initial_schema.sql` - Core tables, enums, indexes
2. `002_audit_triggers.sql` - Audit logging triggers
3. `003_rls_policies.sql` - Row Level Security policies
4. `004_seed_data.sql` - Initial settings and defaults

## Roles and Permissions

The system supports 4 roles:

- **ADMIN**: Full access including system configuration
- **MANAGER**: Manage orders, work items, entities; view audit logs
- **MIDDLE_MANAGER**: Assign work items, upload visuals, approve updates
- **PERSONNEL**: View work items, add comments, upload attachments, submit updates for approval

## Key Features

- Multi-workshop work order tracking
- Status workflow with approval mechanism
- Process chain tracking per work item
- Image and PDF attachments with retention policy
- Comprehensive audit logs
- In-app notifications
- Record locking for concurrent edits
- Export/Import functionality
- Mobile-first responsive design

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Other Platforms

Ensure:
- Node.js 18+ runtime
- Environment variables are set
- Build command: `npm run build`
- Start command: `npm start`

## Project Structure

```
/app                 # Next.js App Router pages
/components          # React components
  /ui               # shadcn/ui components
  /layout           # Layout components
/lib                # Utility functions
  /supabase         # Supabase client setup
/types              # TypeScript type definitions
/supabase
  /migrations       # Database migrations
```

## Notes

- All database operations are protected by Row Level Security (RLS)
- Attachments are stored in Supabase Storage with signed URLs
- Audit logs are append-only (only ADMIN can delete)
- Work items are automatically archived 30 days after completion/cancellation
- Record locks expire after 5 minutes

## Support

For issues or questions, please contact the development team.
