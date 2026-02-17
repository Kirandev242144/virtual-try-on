-- Fix IDs to support Text (Google IDs)

-- 1. Drop Policies relying on columns
drop policy if exists "Authenticated users can follow" on public.follows;
drop policy if exists "Authenticated users can unfollow" on public.follows;
drop policy if exists "Anyone can read follows" on public.follows;

-- 2. Drop Foreign Keys
alter table public.follows drop constraint if exists follows_follower_id_fkey;
alter table public.follows drop constraint if exists follows_following_id_fkey;

-- 3. Alter Columns
alter table public.profiles alter column id type text;
alter table public.follows alter column follower_id type text;
alter table public.follows alter column following_id type text;

-- 4. Re-add Foreign Keys
alter table public.follows 
    add constraint follows_follower_id_fkey 
    foreign key (follower_id) 
    references public.profiles(id) 
    on delete cascade;

alter table public.follows 
    add constraint follows_following_id_fkey 
    foreign key (following_id) 
    references public.profiles(id) 
    on delete cascade;

-- 5. Re-create Policies
create policy "Anyone can read follows"
  on public.follows for select
  using ( true );

create policy "Authenticated users can follow"
  on public.follows for insert
  with check ( auth.uid()::text = follower_id );

create policy "Authenticated users can unfollow"
  on public.follows for delete
  using ( auth.uid()::text = follower_id );
