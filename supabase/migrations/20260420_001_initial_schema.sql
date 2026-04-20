-- ============================================================================
-- Centaur Trade - Initial Database Schema
-- 半人马 Trade 数据库初始化
-- ============================================================================
-- Tables: profiles, customers, products, product_specs, product_images,
--         inquiries, conversations, messages
-- ============================================================================

-- 0. Extensions
create extension if not exists "uuid-ossp";

-- ============================================================================
-- 1. PROFILES (linked to Supabase Auth)
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company_name text,
  avatar_url text,
  google_api_key text,            -- encrypted at rest by Supabase
  google_model text default 'gemini-2.5-flash',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================================
-- 2. CUSTOMERS (CRM)
-- ============================================================================
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  company text,
  country text,
  email text,
  phone text,
  tier text check (tier in ('A', 'B', 'C')) default 'C',
  ai_score integer default 0,
  total_orders integer default 0,
  total_value numeric(12,2) default 0,
  last_contact_at timestamptz,
  channels text[] default '{}',
  status text check (status in ('active', 'nurturing', 'cold')) default 'nurturing',
  tags text[] default '{}',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_customers_user on public.customers(user_id);
create index idx_customers_status on public.customers(status);
create index idx_customers_tier on public.customers(tier);

-- ============================================================================
-- 3. PRODUCTS
-- ============================================================================
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text,
  sku text,
  price numeric(10,2),
  currency text default 'USD',
  moq text,
  stock text,
  image_url text,
  has_bot boolean default false,
  views integer default 0,
  inquiries_count integer default 0,
  factory_name text,
  factory_rating integer check (factory_rating between 1 and 5),
  factory_certs text[] default '{}',
  description text,
  status text check (status in ('active', 'draft', 'archived')) default 'active',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_products_user on public.products(user_id);
create index idx_products_category on public.products(category);

-- ============================================================================
-- 3a. PRODUCT_SPECS (key-value pairs)
-- ============================================================================
create table public.product_specs (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  value text not null,
  sort_order integer default 0
);

create index idx_product_specs_product on public.product_specs(product_id);

-- ============================================================================
-- 3b. PRODUCT_IMAGES (gallery)
-- ============================================================================
create table public.product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  url text not null,
  sort_order integer default 0
);

create index idx_product_images_product on public.product_images(product_id);

-- ============================================================================
-- 3c. PRODUCT_DOCS (attachments)
-- ============================================================================
create table public.product_docs (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  file_size text,
  url text,
  sort_order integer default 0
);

create index idx_product_docs_product on public.product_docs(product_id);

-- ============================================================================
-- 4. INQUIRIES (inquiry list items)
-- ============================================================================
create table public.inquiries (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  customer_id uuid references public.customers(id) on delete set null,
  name text not null,
  company text,
  email text,
  avatar text,                     -- initials like "JS"
  channel text check (channel in ('Email', '独立站', 'Instagram', 'Facebook', 'Twitter')) default 'Email',
  subject text,
  last_message text,
  priority text check (priority in ('high', 'medium', 'low')) default 'medium',
  ai_score integer default 0,
  unread boolean default true,
  status text check (status in ('open', 'replied', 'closed')) default 'open',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_inquiries_user on public.inquiries(user_id);
create index idx_inquiries_status on public.inquiries(status);
create index idx_inquiries_unread on public.inquiries(unread);

-- ============================================================================
-- 5. MESSAGES (conversation messages for an inquiry)
-- ============================================================================
create table public.messages (
  id uuid primary key default uuid_generate_v4(),
  inquiry_id uuid not null references public.inquiries(id) on delete cascade,
  sender text check (sender in ('customer', 'ai', 'user')) not null,
  text text not null,
  subject text,
  ai_generated boolean default false,
  created_at timestamptz default now()
);

create index idx_messages_inquiry on public.messages(inquiry_id);
create index idx_messages_created on public.messages(created_at);

-- ============================================================================
-- 6. AUTO-UPDATE updated_at TRIGGER
-- ============================================================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.customers
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.products
  for each row execute function public.handle_updated_at();

create trigger set_updated_at before update on public.inquiries
  for each row execute function public.handle_updated_at();

-- ============================================================================
-- 7. RLS POLICIES
-- ============================================================================

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.products enable row level security;
alter table public.product_specs enable row level security;
alter table public.product_images enable row level security;
alter table public.product_docs enable row level security;
alter table public.inquiries enable row level security;
alter table public.messages enable row level security;

-- Profiles: users can only see/edit their own
create policy "Users can view own profile"
  on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Customers: users can only see/manage their own
create policy "Users can view own customers"
  on public.customers for select using (auth.uid() = user_id);
create policy "Users can insert own customers"
  on public.customers for insert with check (auth.uid() = user_id);
create policy "Users can update own customers"
  on public.customers for update using (auth.uid() = user_id);
create policy "Users can delete own customers"
  on public.customers for delete using (auth.uid() = user_id);

-- Products: users can only see/manage their own
create policy "Users can view own products"
  on public.products for select using (auth.uid() = user_id);
create policy "Users can insert own products"
  on public.products for insert with check (auth.uid() = user_id);
create policy "Users can update own products"
  on public.products for update using (auth.uid() = user_id);
create policy "Users can delete own products"
  on public.products for delete using (auth.uid() = user_id);

-- Product specs/images/docs: via product ownership
create policy "Users can view own product specs"
  on public.product_specs for select
  using (exists (select 1 from public.products where products.id = product_specs.product_id and products.user_id = auth.uid()));
create policy "Users can manage own product specs"
  on public.product_specs for all
  using (exists (select 1 from public.products where products.id = product_specs.product_id and products.user_id = auth.uid()));

create policy "Users can view own product images"
  on public.product_images for select
  using (exists (select 1 from public.products where products.id = product_images.product_id and products.user_id = auth.uid()));
create policy "Users can manage own product images"
  on public.product_images for all
  using (exists (select 1 from public.products where products.id = product_images.product_id and products.user_id = auth.uid()));

create policy "Users can view own product docs"
  on public.product_docs for select
  using (exists (select 1 from public.products where products.id = product_docs.product_id and products.user_id = auth.uid()));
create policy "Users can manage own product docs"
  on public.product_docs for all
  using (exists (select 1 from public.products where products.id = product_docs.product_id and products.user_id = auth.uid()));

-- Inquiries: users can only see/manage their own
create policy "Users can view own inquiries"
  on public.inquiries for select using (auth.uid() = user_id);
create policy "Users can insert own inquiries"
  on public.inquiries for insert with check (auth.uid() = user_id);
create policy "Users can update own inquiries"
  on public.inquiries for update using (auth.uid() = user_id);
create policy "Users can delete own inquiries"
  on public.inquiries for delete using (auth.uid() = user_id);

-- Messages: via inquiry ownership
create policy "Users can view own messages"
  on public.messages for select
  using (exists (select 1 from public.inquiries where inquiries.id = messages.inquiry_id and inquiries.user_id = auth.uid()));
create policy "Users can insert own messages"
  on public.messages for insert
  with check (exists (select 1 from public.inquiries where inquiries.id = messages.inquiry_id and inquiries.user_id = auth.uid()));

-- ============================================================================
-- 8. AUTO-CREATE PROFILE ON SIGNUP
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
