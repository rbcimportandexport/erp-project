# Supabase setup

This app uses Supabase directly from the frontend for tables such as `importers`.

If you see this error while creating a row:

`new row violates row-level security policy for table "importers"`

run [`rls_policies.sql`](./rls_policies.sql) in the Supabase SQL editor.

If you want a stricter setup later, replace the permissive `authenticated` policies
with role-based policies tied to your app's user model.

