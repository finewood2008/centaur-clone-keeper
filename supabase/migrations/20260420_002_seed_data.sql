-- ============================================================================
-- Centaur Trade - Seed Data (Demo / Development)
-- 半人马 Trade 示例数据
-- ============================================================================
-- NOTE: This seed data uses a placeholder user_id.
-- In production, replace with actual auth.users UUID after signup.
-- For development, you can temporarily disable RLS or create a test user first.
-- ============================================================================

-- We use a fixed demo user UUID for seeding
-- After running, create a user in Supabase Auth with this ID,
-- or update these records to match your real user ID.
do $$
declare
  demo_user_id uuid := '00000000-0000-0000-0000-000000000001';
  -- Customer IDs
  c1 uuid; c2 uuid; c3 uuid; c4 uuid; c5 uuid; c6 uuid; c7 uuid; c8 uuid;
  -- Product IDs
  p1 uuid; p2 uuid; p3 uuid; p4 uuid; p5 uuid; p6 uuid;
  -- Inquiry IDs
  i1 uuid; i2 uuid; i3 uuid; i4 uuid; i5 uuid; i6 uuid; i7 uuid;
begin

-- ============================================================================
-- CUSTOMERS
-- ============================================================================
insert into public.customers (id, user_id, name, company, country, email, phone, tier, ai_score, total_orders, total_value, last_contact_at, channels, status, tags)
values
  (uuid_generate_v4(), demo_user_id, 'John Smith', 'TechCorp Ltd.', '美国', 'john@techcorp.com', '+1 555-0123', 'A', 92, 8, 125000.00, now(), '{"WhatsApp","Email"}', 'active', '{"LED大客户","长期合作"}')
  returning id into c1;

insert into public.customers (id, user_id, name, company, country, email, phone, tier, ai_score, total_orders, total_value, last_contact_at, channels, status, tags)
values
  (uuid_generate_v4(), demo_user_id, 'Maria Garcia', 'EuroTrade GmbH', '德国', 'maria@eurotrade.de', '+49 30-12345', 'A', 85, 5, 89000.00, now() - interval '1 day', '{"LinkedIn","Email"}', 'active', '{"欧洲分销","价格敏感"}')
  returning id into c2;

insert into public.customers (id, user_id, name, company, country, email, phone, tier, ai_score, total_orders, total_value, last_contact_at, channels, status, tags)
values
  (uuid_generate_v4(), demo_user_id, 'Ahmed Hassan', 'MidEast Import Co.', '阿联酋', 'ahmed@mideast.ae', '+971 50-1234', 'B', 68, 3, 45000.00, now() - interval '3 days', '{"WhatsApp"}', 'nurturing', '{"中东工程"}')
  returning id into c3;

insert into public.customers (id, user_id, name, company, country, email, phone, tier, ai_score, total_orders, total_value, last_contact_at, channels, status, tags)
values
  (uuid_generate_v4(), demo_user_id, 'Yuki Tanaka', 'Japan Direct Co.', '日本', 'yuki@japandirect.jp', '+81 3-1234', 'B', 55, 2, 28000.00, now() - interval '7 days', '{"Email","阿里巴巴"}', 'nurturing', '{"日本市场"}')
  returning id into c4;

insert into public.customers (id, user_id, name, company, country, email, phone, tier, ai_score, total_orders, total_value, last_contact_at, channels, status, tags)
values
  (uuid_generate_v4(), demo_user_id, 'Roberto Silva', 'Brazil Imports', '巴西', 'roberto@brazilimports.com', '+55 11-9876', 'C', 42, 1, 12000.00, now() - interval '14 days', '{"WhatsApp"}', 'cold', '{"南美新客"}')
  returning id into c5;

insert into public.customers (id, user_id, name, company, country, email, phone, tier, ai_score, total_orders, total_value, last_contact_at, channels, status, tags)
values
  (uuid_generate_v4(), demo_user_id, 'Sarah Johnson', 'Pacific Trading Inc.', '澳大利亚', 'sarah@pacifictrading.com.au', '+61 2-5555', 'A', 88, 6, 96000.00, now() - interval '2 days', '{"Email","LinkedIn"}', 'active', '{"澳洲代理","照明品类"}')
  returning id into c6;

insert into public.customers (id, user_id, name, company, country, email, phone, tier, ai_score, total_orders, total_value, last_contact_at, channels, status, tags)
values
  (uuid_generate_v4(), demo_user_id, 'Lucas Müller', 'Berlin Home Decor', '德国', 'lucas@berlindecor.de', '+49 30-67890', 'B', 48, 1, 15000.00, now() - interval '5 days', '{"Instagram","Email"}', 'nurturing', '{"家居装饰","设计师"}')
  returning id into c7;

insert into public.customers (id, user_id, name, company, country, email, phone, tier, ai_score, total_orders, total_value, last_contact_at, channels, status, tags)
values
  (uuid_generate_v4(), demo_user_id, 'Emma Wilson', 'UK Green Energy', '英国', 'emma@ukgreen.co.uk', '+44 20-7890', 'B', 72, 4, 58000.00, now() - interval '1 day', '{"Email"}', 'active', '{"太阳能","政府项目"}')
  returning id into c8;

-- ============================================================================
-- PRODUCTS
-- ============================================================================
insert into public.products (id, user_id, name, category, sku, price, currency, moq, stock, image_url, has_bot, views, inquiries_count, factory_name, factory_rating, factory_certs, description, status)
values
  (uuid_generate_v4(), demo_user_id, 'LED Bulb A60 9W', 'LED照明', 'LED-A60-9W', 1.85, 'USD', '1,000 pcs', '50,000',
   'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=300&fit=crop',
   true, 2340, 45, '明辉照明科技', 5, '{"ISO9001","CE","RoHS","UL"}',
   '高品质LED灯泡，采用进口芯片，高光效低能耗。铝基板散热设计，寿命长达25000小时。支持2700K暖白至6500K冷白全色温范围。通过CE、RoHS、UL等国际认证。',
   'active')
  returning id into p1;

insert into public.products (id, user_id, name, category, sku, price, currency, moq, stock, image_url, has_bot, views, inquiries_count, factory_name, factory_rating, factory_certs, description, status)
values
  (uuid_generate_v4(), demo_user_id, 'Solar Panel 400W Mono', '太阳能', 'SP-400W-M', 85.00, 'USD', '50 units', '2,000',
   'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
   true, 1890, 32, '旭日新能源', 5, '{"TÜV","IEC","CE"}',
   '高效单晶硅太阳能电池板，PERC技术，转换效率21.3%。半片电池设计减少热斑效应。适用于分布式电站、屋顶光伏系统。',
   'active')
  returning id into p2;

insert into public.products (id, user_id, name, category, sku, price, currency, moq, stock, image_url, has_bot, views, inquiries_count, factory_name, factory_rating, factory_certs, description, status)
values
  (uuid_generate_v4(), demo_user_id, 'Steel Pipe DN100', '钢管', 'SP-DN100-G', 12.50, 'USD', '5 tons', '500 tons',
   'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
   false, 980, 18, '华鑫钢铁', 4, '{"ISO9001","API 5L","ASTM"}',
   'DN100热镀锌钢管，壁厚SCH40，材质Q235B/SS304可选。适用于建筑、市政管道、工业输送。',
   'active')
  returning id into p3;

insert into public.products (id, user_id, name, category, sku, price, currency, moq, stock, image_url, has_bot, views, inquiries_count, factory_name, factory_rating, factory_certs, description, status)
values
  (uuid_generate_v4(), demo_user_id, 'Ceramic Vase Set', '家居装饰', 'CV-SET-01', 8.50, 'USD', '200 sets', '5,000',
   'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop',
   true, 1560, 28, '景德陶艺', 4, '{"SGS","BSCI"}',
   '手工陶瓷花瓶3件套，北欧简约风格。哑光釉面，莫兰迪色系。适用于家居装饰、酒店软装。支持OEM定制。',
   'active')
  returning id into p4;

insert into public.products (id, user_id, name, category, sku, price, currency, moq, stock, image_url, has_bot, views, inquiries_count, factory_name, factory_rating, factory_certs, description, status)
values
  (uuid_generate_v4(), demo_user_id, 'Phone Case TPU Clear', '手机配件', 'PC-TPU-CLR', 0.65, 'USD', '5,000 pcs', '200,000',
   'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop',
   false, 3200, 56, '凯达电子', 3, '{"CE","FCC"}',
   '透明TPU手机壳，支持iPhone/Samsung/Huawei全系列型号。防摔防刮，精准开孔。支持定制logo印刷和包装。',
   'active')
  returning id into p5;

insert into public.products (id, user_id, name, category, sku, price, currency, moq, stock, image_url, has_bot, views, inquiries_count, factory_name, factory_rating, factory_certs, description, status)
values
  (uuid_generate_v4(), demo_user_id, 'LED Strip Light 5M RGB', 'LED照明', 'LS-5M-RGB', 3.20, 'USD', '500 rolls', '30,000',
   'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
   true, 1780, 38, '明辉照明科技', 5, '{"CE","RoHS","FCC"}',
   'RGB LED灯带，5050芯片，60灯/米。IP65防水，含遥控器和电源适配器。适用于室内装饰、商业展示、KTV氛围灯。',
   'active')
  returning id into p6;

-- Product Specs
insert into public.product_specs (product_id, label, value, sort_order) values
  (p1, '功率', '9W', 1), (p1, '色温', '2700K-6500K', 2), (p1, '光通量', '810lm', 3),
  (p1, '显色指数', 'Ra>80', 4), (p1, '寿命', '25,000小时', 5), (p1, '调光', '支持PWM', 6),
  (p1, '输入电压', 'AC100-240V', 7), (p1, '灯头', 'E27/E26/B22', 8);

insert into public.product_specs (product_id, label, value, sort_order) values
  (p2, '功率', '400W', 1), (p2, '电池类型', '单晶硅', 2), (p2, '效率', '21.3%', 3),
  (p2, '尺寸', '1755×1038×35mm', 4), (p2, '重量', '20.5kg', 5), (p2, '质保', '25年', 6);

insert into public.product_specs (product_id, label, value, sort_order) values
  (p3, '管径', 'DN100', 1), (p3, '壁厚', 'SCH40', 2), (p3, '材质', 'Q235B', 3),
  (p3, '表面处理', '热镀锌', 4), (p3, '长度', '6m/根', 5);

insert into public.product_specs (product_id, label, value, sort_order) values
  (p4, '材质', '高温烧制陶瓷', 1), (p4, '套件', '3件（大中小）', 2), (p4, '颜色', '莫兰迪色系', 3),
  (p4, '高度', '15/22/30cm', 4), (p4, '工艺', '手工拉坯+哑光釉', 5);

insert into public.product_specs (product_id, label, value, sort_order) values
  (p5, '材质', 'TPU', 1), (p5, '适配机型', 'iPhone 15/16系列', 2), (p5, '厚度', '1.2mm', 3),
  (p5, '特性', '防摔/防刮/防指纹', 4);

insert into public.product_specs (product_id, label, value, sort_order) values
  (p6, '芯片', 'SMD5050', 1), (p6, '灯珠密度', '60灯/米', 2), (p6, '防水等级', 'IP65', 3),
  (p6, '输入电压', 'DC12V', 4), (p6, '功率', '14.4W/m', 5), (p6, '颜色', 'RGB可调', 6);

-- Product Images
insert into public.product_images (product_id, url, sort_order) values
  (p1, 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&h=400&fit=crop', 1),
  (p1, 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop', 2),
  (p1, 'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?w=600&h=400&fit=crop', 3),
  (p2, 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop', 1),
  (p2, 'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=400&fit=crop', 2),
  (p4, 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&h=400&fit=crop', 1),
  (p6, 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop', 1);

-- Product Docs
insert into public.product_docs (product_id, name, file_size, sort_order) values
  (p1, '产品规格书.pdf', '2.3MB', 1), (p1, 'CE认证.pdf', '890KB', 2), (p1, '测试报告.pdf', '1.5MB', 3),
  (p2, '产品规格书.pdf', '3.1MB', 1), (p2, 'TÜV认证.pdf', '1.2MB', 2),
  (p3, '产品规格书.pdf', '1.8MB', 1), (p3, 'API认证.pdf', '950KB', 2);

-- ============================================================================
-- INQUIRIES + MESSAGES
-- ============================================================================
insert into public.inquiries (id, user_id, customer_id, name, company, email, avatar, channel, subject, last_message, priority, ai_score, unread, status, created_at)
values
  (uuid_generate_v4(), demo_user_id, c1, 'John Smith', 'TechCorp Ltd.', 'john.smith@techcorp.com', 'JS', 'Email',
   'Request for Quotation - LED Bulbs 5000 Units',
   'Hi, I need a quote for 5000 units of LED bulbs. Can you send me the FOB price?',
   'high', 85, true, 'open', now() - interval '2 hours')
  returning id into i1;

insert into public.inquiries (id, user_id, customer_id, name, company, email, avatar, channel, subject, last_message, priority, ai_score, unread, status, created_at)
values
  (uuid_generate_v4(), demo_user_id, c2, 'Maria Garcia', 'EuroTrade GmbH', 'maria@eurotrade.de', 'MG', '独立站',
   null,
   'We are interested in your solar panel products. Could you provide the specifications and MOQ?',
   'high', 78, true, 'open', now() - interval '3 hours')
  returning id into i2;

insert into public.inquiries (id, user_id, customer_id, name, company, email, avatar, channel, subject, last_message, priority, ai_score, unread, status, created_at)
values
  (uuid_generate_v4(), demo_user_id, c3, 'Ahmed Hassan', 'MidEast Import Co.', 'ahmed@mideastimport.com', 'AH', 'Email',
   'RE: Steel Pipe Samples Follow-up',
   'Following up on our previous conversation about steel pipes. When can we expect the samples?',
   'medium', 62, false, 'replied', now() - interval '5 hours')
  returning id into i3;

insert into public.inquiries (id, user_id, customer_id, name, company, email, avatar, channel, subject, last_message, priority, ai_score, unread, status, created_at)
values
  (uuid_generate_v4(), demo_user_id, c6, 'Sarah Johnson', 'Pacific Trading Inc.', 'sarah.j@pacifictrading.com', 'SJ', '独立站',
   null,
   'I submitted an inquiry on your website for phone cases. Looking forward to your reply.',
   'medium', 55, true, 'open', now() - interval '6 hours')
  returning id into i4;

insert into public.inquiries (id, user_id, customer_id, name, company, email, avatar, channel, subject, last_message, priority, ai_score, unread, status, created_at)
values
  (uuid_generate_v4(), demo_user_id, c7, 'Lucas Müller', 'Berlin Home Decor', '', 'LM', 'Instagram',
   null,
   'Hey! Love your ceramic vases. Do you ship to Germany? What''s the minimum order?',
   'medium', 48, false, 'open', now() - interval '1 day')
  returning id into i5;

insert into public.inquiries (id, user_id, customer_id, name, company, email, avatar, channel, subject, last_message, priority, ai_score, unread, status, created_at)
values
  (uuid_generate_v4(), demo_user_id, c5, 'Roberto Silva', 'Brazil Imports', '', 'RS', 'Facebook',
   null,
   'Olá! Estou interessado em seus produtos de iluminação LED. Vocês exportam para o Brasil?',
   'medium', 58, false, 'open', now() - interval '1 day')
  returning id into i6;

insert into public.inquiries (id, user_id, customer_id, name, company, email, avatar, channel, subject, last_message, priority, ai_score, unread, status, created_at)
values
  (uuid_generate_v4(), demo_user_id, c8, 'Emma Wilson', 'UK Green Energy', 'emma@ukgreen.co.uk', 'EW', 'Email',
   'Solar Panel Bulk Order Inquiry - Government Project',
   'We have a government-backed project requiring 500+ solar panels. Can you provide project pricing?',
   'high', 91, true, 'open', now() - interval '30 minutes')
  returning id into i7;

-- Messages for Inquiry 1 (John Smith - LED Bulbs)
insert into public.messages (inquiry_id, sender, text, subject, ai_generated, created_at) values
  (i1, 'customer', 'Hi, I need a quote for 5000 units of LED bulbs A60 9W. Can you send me the FOB price? We need E27 base, 4000K color temperature.', 'Request for Quotation - LED Bulbs 5000 Units', false, now() - interval '2 hours'),
  (i1, 'customer', 'Also, do you have UL certification? We need it for the US market.', null, false, now() - interval '1 hour 50 minutes');

-- Messages for Inquiry 2 (Maria Garcia - Solar Panels)
insert into public.messages (inquiry_id, sender, text, ai_generated, created_at) values
  (i2, 'customer', 'We are interested in your solar panel products. Could you provide the specifications and MOQ? We are looking for panels in the 350-400W range for a residential project in Germany.', false, now() - interval '3 hours'),
  (i2, 'customer', 'Also interested in your warranty terms and TÜV certification status.', false, now() - interval '2 hours 45 minutes');

-- Messages for Inquiry 3 (Ahmed Hassan - Steel Pipes - has replies)
insert into public.messages (inquiry_id, sender, text, subject, ai_generated, created_at) values
  (i3, 'customer', 'Following up on our previous conversation about steel pipes. When can we expect the samples?', 'RE: Steel Pipe Samples Follow-up', false, now() - interval '5 hours'),
  (i3, 'user', 'Dear Ahmed, thank you for your patience. The samples have been shipped via DHL. Tracking number: DHL-2026042001. Expected delivery: 5-7 business days to Dubai.', null, false, now() - interval '4 hours'),
  (i3, 'customer', 'Thank you! Once we receive and approve the samples, we''ll proceed with the initial order of 20 tons.', null, false, now() - interval '3 hours 30 minutes');

-- Messages for Inquiry 7 (Emma Wilson - Solar Panels Government)
insert into public.messages (inquiry_id, sender, text, subject, ai_generated, created_at) values
  (i7, 'customer', 'We have a government-backed project requiring 500+ solar panels. Can you provide project pricing? This is a UK Green Homes Grant project.', 'Solar Panel Bulk Order Inquiry - Government Project', false, now() - interval '30 minutes'),
  (i7, 'customer', 'Requirements: 400W mono panels, IEC 61215 certified, 25-year warranty minimum. Delivery to London port, CIF terms preferred.', null, false, now() - interval '25 minutes');

end $$;
