-- Create products table
create table if not exists public.products (
  id text default gen_random_uuid()::text primary key,
  vendor_id text references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  price decimal(10, 2),
  category text,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add merchant fields to profiles if they don't exist
alter table public.profiles 
add column if not exists store_name text,
add column if not exists store_handle text unique,
add column if not exists store_description text,
add column if not exists store_category text,
add column if not exists target_audience text[],
add column if not exists website_url text,
add column if not exists instagram_handle text,
add column if not exists twitter_handle text,
add column if not exists location text;

-- Enable RLS
alter table public.products enable row level security;

-- Policies for Products
create policy "Products are viewable by everyone."
  on public.products for select
  using ( true );

create policy "Vendors can insert their own products."
  on public.products for insert
  with check ( auth.uid()::text = vendor_id );

create policy "Vendors can update their own products."
  on public.products for update
  using ( auth.uid()::text = vendor_id );

create policy "Vendors can delete their own products."
  on public.products for delete
  using ( auth.uid()::text = vendor_id );
