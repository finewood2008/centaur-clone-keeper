-- Enable required extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============ profiles ============
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  company_name text,
  avatar_url text,
  google_api_key text,
  google_model text DEFAULT 'gemini-2.5-flash',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- ============ customers ============
CREATE TABLE IF NOT EXISTS public.customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  company text,
  country text,
  email text,
  phone text,
  tier text CHECK (tier IN ('A','B','C')) DEFAULT 'C',
  ai_score integer DEFAULT 0,
  total_orders integer DEFAULT 0,
  total_value numeric(12,2) DEFAULT 0,
  last_contact_at timestamptz,
  channels text[] DEFAULT '{}',
  status text CHECK (status IN ('active','nurturing','cold')) DEFAULT 'nurturing',
  tags text[] DEFAULT '{}',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own customers" ON public.customers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own customers" ON public.customers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own customers" ON public.customers FOR DELETE USING (auth.uid() = user_id);

-- ============ products ============
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  category text,
  sku text,
  price numeric(10,2),
  currency text DEFAULT 'USD',
  moq text,
  stock text,
  image_url text,
  has_bot boolean DEFAULT false,
  views integer DEFAULT 0,
  inquiries_count integer DEFAULT 0,
  factory_name text,
  factory_rating integer CHECK (factory_rating BETWEEN 1 AND 5),
  factory_certs text[] DEFAULT '{}',
  description text,
  status text CHECK (status IN ('active','draft','archived')) DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own products" ON public.products FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own products" ON public.products FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own products" ON public.products FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own products" ON public.products FOR DELETE USING (auth.uid() = user_id);

-- ============ product_specs ============
CREATE TABLE IF NOT EXISTS public.product_specs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  label text NOT NULL,
  value text NOT NULL,
  sort_order integer DEFAULT 0
);

ALTER TABLE public.product_specs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own product_specs" ON public.product_specs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));
CREATE POLICY "Users insert own product_specs" ON public.product_specs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));
CREATE POLICY "Users update own product_specs" ON public.product_specs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));
CREATE POLICY "Users delete own product_specs" ON public.product_specs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));

-- ============ product_images ============
CREATE TABLE IF NOT EXISTS public.product_images (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  url text NOT NULL,
  sort_order integer DEFAULT 0
);

ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own product_images" ON public.product_images FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));
CREATE POLICY "Users insert own product_images" ON public.product_images FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));
CREATE POLICY "Users update own product_images" ON public.product_images FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));
CREATE POLICY "Users delete own product_images" ON public.product_images FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));

-- ============ product_docs ============
CREATE TABLE IF NOT EXISTS public.product_docs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  name text NOT NULL,
  file_size text,
  url text,
  sort_order integer DEFAULT 0
);

ALTER TABLE public.product_docs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own product_docs" ON public.product_docs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));
CREATE POLICY "Users insert own product_docs" ON public.product_docs FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));
CREATE POLICY "Users update own product_docs" ON public.product_docs FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));
CREATE POLICY "Users delete own product_docs" ON public.product_docs FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));

-- ============ inquiries ============
CREATE TABLE IF NOT EXISTS public.inquiries (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES public.customers(id) ON DELETE SET NULL,
  name text NOT NULL,
  company text,
  email text,
  avatar text,
  channel text CHECK (channel IN ('Email','独立站','Instagram','Facebook','Twitter')) DEFAULT 'Email',
  subject text,
  last_message text,
  priority text CHECK (priority IN ('high','medium','low')) DEFAULT 'medium',
  ai_score integer DEFAULT 0,
  unread boolean DEFAULT true,
  status text CHECK (status IN ('open','replied','closed')) DEFAULT 'open',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own inquiries" ON public.inquiries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own inquiries" ON public.inquiries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own inquiries" ON public.inquiries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own inquiries" ON public.inquiries FOR DELETE USING (auth.uid() = user_id);

-- ============ messages ============
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  inquiry_id uuid NOT NULL REFERENCES public.inquiries(id) ON DELETE CASCADE,
  sender text CHECK (sender IN ('customer','ai','user')) NOT NULL,
  text text NOT NULL,
  subject text,
  ai_generated boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own messages" ON public.messages FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.inquiries i WHERE i.id = inquiry_id AND i.user_id = auth.uid()));
CREATE POLICY "Users insert own messages" ON public.messages FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.inquiries i WHERE i.id = inquiry_id AND i.user_id = auth.uid()));
CREATE POLICY "Users update own messages" ON public.messages FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.inquiries i WHERE i.id = inquiry_id AND i.user_id = auth.uid()));
CREATE POLICY "Users delete own messages" ON public.messages FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.inquiries i WHERE i.id = inquiry_id AND i.user_id = auth.uid()));

-- ============ updated_at trigger function ============
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_customers_updated_at ON public.customers;
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_inquiries_updated_at ON public.inquiries;
CREATE TRIGGER update_inquiries_updated_at BEFORE UPDATE ON public.inquiries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============ auto-create profile on signup ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();