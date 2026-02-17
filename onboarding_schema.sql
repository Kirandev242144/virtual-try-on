-- Add onboarding fields to profiles
alter table public.profiles 
add column if not exists onboarding_completed boolean default false,
add column if not exists username text unique,
add column if not exists bio text,
add column if not exists style_preferences text[],
add column if not exists size_preferences jsonb,
add column if not exists goals text[];

-- Create follows table
create table if not exists public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

-- RLS for Follows
alter table public.follows enable row level security;

drop policy if exists "Anyone can read follows" on public.follows;
create policy "Anyone can read follows"
  on public.follows for select
  using ( true );

drop policy if exists "Authenticated users can follow" on public.follows;
create policy "Authenticated users can follow"
  on public.follows for insert
  with check ( auth.uid() = follower_id );

drop policy if exists "Authenticated users can unfollow" on public.follows;
create policy "Authenticated users can unfollow"
  on public.follows for delete
  using ( auth.uid() = follower_id );
