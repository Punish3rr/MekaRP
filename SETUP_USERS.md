# User Management Setup

## Environment Variables

For user management functionality, you need to add the Supabase Service Role Key to your `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**Important:** 
- The Service Role Key has admin privileges and bypasses RLS policies
- **Never commit this key to version control**
- **Never expose this key to the client-side**
- Get it from: Supabase Dashboard → Settings → API → `service_role` key (secret)

## Accessing User Management

1. Log in as an ADMIN user
2. Navigate to "Users" in the navigation menu (visible only to ADMIN)
3. You can now:
   - View all users
   - Create new users
   - Update user roles
   - Delete users

## Creating Users via UI

1. Click "Add User" button
2. Fill in:
   - Email (required)
   - Password (required, minimum 6 characters)
   - Full Name (optional)
   - Role (required - ADMIN, MANAGER, MIDDLE_MANAGER, or PERSONNEL)
3. Click "Create User"

The user will be:
- Created in Supabase Auth (auth.users table)
- Automatically gets a profile in the profiles table (via trigger)
- Can immediately log in with the provided credentials

## Updating User Roles

1. Find the user in the table
2. Select a new role from the dropdown in the "Role" column
3. The change is applied immediately

## Deleting Users

1. Click the "Delete" button next to the user
2. Confirm the deletion
3. The user will be removed from:
   - auth.users table
   - profiles table
   - All related data (cascade deletes apply)

**Warning:** Deleting a user is permanent and cannot be undone!
