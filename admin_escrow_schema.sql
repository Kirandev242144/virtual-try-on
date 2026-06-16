-- SQL schema extension for escrow payouts and super admin control

-- 1. Create orders table
create table if not exists public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_id text references public.profiles(id) on delete set null,
  vendor_id text references public.profiles(id) on delete cascade not null,
  stripe_payment_intent_id text,
  shipping_address jsonb not null,
  courier text,
  tracking_number text,
  status text default 'pending' check (status in ('pending', 'shipped', 'delivered', 'cancelled')),
  escrow_status text default 'held' check (escrow_status in ('held', 'released', 'refunded', 'disputed')),
  amount decimal(10, 2) not null,
  platform_commission decimal(10, 2) not null,
  vendor_earnings decimal(10, 2) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create order items table
create table if not exists public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id text references public.products(id) on delete set null,
  quantity integer not null,
  price decimal(10, 2) not null
);

-- 3. Create payouts table
create table if not exists public.payouts (
  id uuid default gen_random_uuid() primary key,
  vendor_id text references public.profiles(id) on delete cascade not null,
  order_id uuid references public.orders(id) on delete set null,
  stripe_transfer_id text,
  amount decimal(10, 2) not null,
  status text default 'paid' check (status in ('pending', 'paid', 'failed')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create disputes table
create table if not exists public.disputes (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  reason text not null,
  description text,
  evidence_url text,
  status text default 'open' check (status in ('open', 'under_review', 'resolved_refunded', 'resolved_released')),
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Add vendor status column to profiles if not exists
alter table public.profiles
add column if not exists vendor_status text default 'pending_approval' check (vendor_status in ('pending_approval', 'approved', 'suspended'));

-- Enable row-level security for new tables
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payouts enable row level security;
alter table public.disputes enable row level security;

-- Setup RLS Policies for Orders
drop policy if exists "Users can read own orders" on public.orders;
create policy "Users can read own orders" on public.orders
  for select using (auth.uid()::text = customer_id or auth.uid()::text = vendor_id);

drop policy if exists "Enable insert for authenticated customer" on public.orders;
create policy "Enable insert for authenticated customer" on public.orders
  for insert with check (auth.uid()::text = customer_id);

drop policy if exists "Admin has full access to orders" on public.orders;
create policy "Admin has full access to orders" on public.orders
  for all using (true);

-- Setup RLS Policies for Order Items
drop policy if exists "Users can read own order items" on public.order_items;
create policy "Users can read own order items" on public.order_items
  for select using (
    exists (
      select 1 from public.orders o 
      where o.id = order_id and (o.customer_id = auth.uid()::text or o.vendor_id = auth.uid()::text)
    )
  );

drop policy if exists "Admin has full access to order items" on public.order_items;
create policy "Admin has full access to order items" on public.order_items
  for all using (true);

-- Setup RLS Policies for Payouts
drop policy if exists "Vendors can read own payouts" on public.payouts;
create policy "Vendors can read own payouts" on public.payouts
  for select using (auth.uid()::text = vendor_id);

drop policy if exists "Admin has full access to payouts" on public.payouts;
create policy "Admin has full access to payouts" on public.payouts
  for all using (true);

-- Setup RLS Policies for Disputes
drop policy if exists "Users involved can read disputes" on public.disputes;
create policy "Users involved can read disputes" on public.disputes
  for select using (
    exists (
      select 1 from public.orders o 
      where o.id = order_id and (o.customer_id = auth.uid()::text or o.vendor_id = auth.uid()::text)
    )
  );

drop policy if exists "Buyers can create disputes" on public.disputes;
create policy "Buyers can create disputes" on public.disputes
  for insert with check (
    exists (
      select 1 from public.orders o 
      where o.id = order_id and o.customer_id = auth.uid()::text
    )
  );

drop policy if exists "Admin has full access to disputes" on public.disputes;
create policy "Admin has full access to disputes" on public.disputes
  for all using (true);
