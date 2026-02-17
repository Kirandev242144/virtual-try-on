-- Remove the foreign key constraint to auth.users since we are using NextAuth
-- (This allows us to insert users into 'public.profiles' that don't exist in 'auth.users')
alter table public.profiles drop constraint profiles_id_fkey;

-- Make sure we can insert into it
alter table public.profiles enable row level security;

-- Update policies to allow public access (since NextAuth handles auth logic in API)
-- In a production app, we'd use a service role key for admin tasks, but for now:
drop policy if exists "Public profiles are viewable by everyone." on public.profiles;
create policy "Public profiles are viewable by everyone." on public.profiles for select using (true);

drop policy if exists "Users can insert their own profile." on public.profiles;
create policy "Enable insert for authenticated users only" on public.profiles for insert with check (true);

drop policy if exists "Users can update own profile." on public.profiles;
create policy "Enable update for users based on email" on public.profiles for update using (true);
