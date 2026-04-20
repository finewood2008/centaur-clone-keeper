/**
 * 半人马 Trade — SQLite 数据库初始化
 * better-sqlite3, WAL 模式, 自动建表 + seed
 *
 * Exports: { db, initDatabase, seedDemoData }
 */
const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');

const DB_PATH = path.resolve(__dirname, 'data/trade.db');

// Ensure data directory exists
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

// WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

// ============================================================================
// SCHEMA — Create all 8 tables
// ============================================================================
function initDatabase() {
  db.exec(`
    -- 1. PROFILES (local auth, maps to Supabase profiles + auth.users)
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      full_name TEXT,
      company_name TEXT,
      avatar_url TEXT,
      google_api_key TEXT,
      google_model TEXT DEFAULT 'gemini-2.5-flash',
      password_hash TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 2. CUSTOMERS (CRM)
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      company TEXT,
      country TEXT,
      email TEXT,
      phone TEXT,
      tier TEXT CHECK (tier IN ('A', 'B', 'C')) DEFAULT 'C',
      ai_score INTEGER DEFAULT 0,
      total_orders INTEGER DEFAULT 0,
      total_value REAL DEFAULT 0,
      last_contact_at TEXT,
      channels TEXT DEFAULT '[]',
      status TEXT CHECK (status IN ('active', 'nurturing', 'cold')) DEFAULT 'nurturing',
      tags TEXT DEFAULT '[]',
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 3. PRODUCTS
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      category TEXT,
      sku TEXT,
      price REAL,
      currency TEXT DEFAULT 'USD',
      moq TEXT,
      stock TEXT,
      image_url TEXT,
      has_bot INTEGER DEFAULT 0,
      views INTEGER DEFAULT 0,
      inquiries_count INTEGER DEFAULT 0,
      factory_name TEXT,
      factory_rating INTEGER CHECK (factory_rating BETWEEN 1 AND 5),
      factory_certs TEXT DEFAULT '[]',
      description TEXT,
      status TEXT CHECK (status IN ('active', 'draft', 'archived')) DEFAULT 'active',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 3a. PRODUCT_SPECS (key-value pairs)
    CREATE TABLE IF NOT EXISTS product_specs (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      label TEXT NOT NULL,
      value TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    -- 3b. PRODUCT_IMAGES (gallery)
    CREATE TABLE IF NOT EXISTS product_images (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      url TEXT NOT NULL,
      sort_order INTEGER DEFAULT 0
    );

    -- 3c. PRODUCT_DOCS (attachments)
    CREATE TABLE IF NOT EXISTS product_docs (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      name TEXT NOT NULL,
      file_size TEXT,
      url TEXT,
      sort_order INTEGER DEFAULT 0
    );

    -- 4. INQUIRIES
    CREATE TABLE IF NOT EXISTS inquiries (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
      customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
      name TEXT NOT NULL,
      company TEXT,
      email TEXT,
      avatar TEXT,
      channel TEXT CHECK (channel IN ('Email', '独立站', 'Instagram', 'Facebook', 'Twitter')) DEFAULT 'Email',
      subject TEXT,
      last_message TEXT,
      priority TEXT CHECK (priority IN ('high', 'medium', 'low')) DEFAULT 'medium',
      ai_score INTEGER DEFAULT 0,
      unread INTEGER DEFAULT 1,
      status TEXT CHECK (status IN ('open', 'replied', 'closed')) DEFAULT 'open',
      created_at TEXT DEFAULT (datetime('now')),
      updated_at TEXT DEFAULT (datetime('now'))
    );

    -- 5. MESSAGES
    CREATE TABLE IF NOT EXISTS messages (
      id TEXT PRIMARY KEY,
      inquiry_id TEXT NOT NULL REFERENCES inquiries(id) ON DELETE CASCADE,
      sender TEXT CHECK (sender IN ('customer', 'ai', 'user')) NOT NULL,
      text TEXT NOT NULL,
      subject TEXT,
      ai_generated INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_customers_user ON customers(user_id);
    CREATE INDEX IF NOT EXISTS idx_customers_status ON customers(status);
    CREATE INDEX IF NOT EXISTS idx_customers_tier ON customers(tier);
    CREATE INDEX IF NOT EXISTS idx_products_user ON products(user_id);
    CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
    CREATE INDEX IF NOT EXISTS idx_inquiries_user ON inquiries(user_id);
    CREATE INDEX IF NOT EXISTS idx_inquiries_status ON inquiries(status);
    CREATE INDEX IF NOT EXISTS idx_inquiries_unread ON inquiries(unread);
    CREATE INDEX IF NOT EXISTS idx_messages_inquiry ON messages(inquiry_id);
    CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at);
    CREATE INDEX IF NOT EXISTS idx_product_specs_product ON product_specs(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_images_product ON product_images(product_id);
    CREATE INDEX IF NOT EXISTS idx_product_docs_product ON product_docs(product_id);
  `);

  // Auto-seed if profiles table is empty
  const row = db.prepare('SELECT COUNT(*) as cnt FROM profiles').get();
  if (row.cnt === 0) {
    seedDemoData();
  }
}

// ============================================================================
// SEED DATA — mirrors Supabase 20260420_002_seed_data.sql
// ============================================================================
function seedDemoData() {
  console.log('📦 Seeding database with demo data...');

  const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001';
  const passwordHash = bcrypt.hashSync('demo123456', 10);

  const seed = db.transaction(() => {
    // ------------------------------------------------------------------
    // Demo profile
    // ------------------------------------------------------------------
    db.prepare(`
      INSERT OR IGNORE INTO profiles (id, email, full_name, company_name, password_hash)
      VALUES (?, ?, ?, ?, ?)
    `).run(DEMO_USER_ID, 'demo@centaur.ai', 'Demo User', '半人马贸易', passwordHash);

    // ------------------------------------------------------------------
    // 8 CUSTOMERS
    // ------------------------------------------------------------------
    const insertCustomer = db.prepare(`
      INSERT INTO customers
        (id, user_id, name, company, country, email, phone, tier, ai_score,
         total_orders, total_value, last_contact_at, channels, status, tags)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?), ?, ?, ?)
    `);

    const customers = [
      { name: 'John Smith',     company: 'TechCorp Ltd.',        country: '美国',    email: 'john@techcorp.com',            phone: '+1 555-0123',   tier: 'A', ai: 92, orders: 8,  value: 125000, offset: '-0 hours',  channels: '["WhatsApp","Email"]',      status: 'active',    tags: '["LED大客户","长期合作"]' },
      { name: 'Maria Garcia',   company: 'EuroTrade GmbH',       country: '德国',    email: 'maria@eurotrade.de',           phone: '+49 30-12345',  tier: 'A', ai: 85, orders: 5,  value: 89000,  offset: '-1 days',   channels: '["LinkedIn","Email"]',      status: 'active',    tags: '["欧洲分销","价格敏感"]' },
      { name: 'Ahmed Hassan',   company: 'MidEast Import Co.',   country: '阿联酋',  email: 'ahmed@mideast.ae',             phone: '+971 50-1234',  tier: 'B', ai: 68, orders: 3,  value: 45000,  offset: '-3 days',   channels: '["WhatsApp"]',              status: 'nurturing', tags: '["中东工程"]' },
      { name: 'Yuki Tanaka',    company: 'Japan Direct Co.',     country: '日本',    email: 'yuki@japandirect.jp',          phone: '+81 3-1234',    tier: 'B', ai: 55, orders: 2,  value: 28000,  offset: '-7 days',   channels: '["Email","阿里巴巴"]',      status: 'nurturing', tags: '["日本市场"]' },
      { name: 'Roberto Silva',  company: 'Brazil Imports',       country: '巴西',    email: 'roberto@brazilimports.com',    phone: '+55 11-9876',   tier: 'C', ai: 42, orders: 1,  value: 12000,  offset: '-14 days',  channels: '["WhatsApp"]',              status: 'cold',      tags: '["南美新客"]' },
      { name: 'Sarah Johnson',  company: 'Pacific Trading Inc.', country: '澳大利亚', email: 'sarah@pacifictrading.com.au', phone: '+61 2-5555',    tier: 'A', ai: 88, orders: 6,  value: 96000,  offset: '-2 days',   channels: '["Email","LinkedIn"]',      status: 'active',    tags: '["澳洲代理","照明品类"]' },
      { name: 'Lucas Müller',   company: 'Berlin Home Decor',    country: '德国',    email: 'lucas@berlindecor.de',         phone: '+49 30-67890',  tier: 'B', ai: 48, orders: 1,  value: 15000,  offset: '-5 days',   channels: '["Instagram","Email"]',     status: 'nurturing', tags: '["家居装饰","设计师"]' },
      { name: 'Emma Wilson',    company: 'UK Green Energy',      country: '英国',    email: 'emma@ukgreen.co.uk',           phone: '+44 20-7890',   tier: 'B', ai: 72, orders: 4,  value: 58000,  offset: '-1 days',   channels: '["Email"]',                 status: 'active',    tags: '["太阳能","政府项目"]' },
    ];

    const customerIds = {};
    for (const c of customers) {
      const id = crypto.randomUUID();
      customerIds[c.name] = id;
      insertCustomer.run(
        id, DEMO_USER_ID, c.name, c.company, c.country, c.email, c.phone,
        c.tier, c.ai, c.orders, c.value, c.offset, c.channels, c.status, c.tags
      );
    }

    // ------------------------------------------------------------------
    // 6 PRODUCTS  (with specs, images, docs)
    // ------------------------------------------------------------------
    const insertProduct = db.prepare(`
      INSERT INTO products
        (id, user_id, name, category, sku, price, currency, moq, stock,
         image_url, has_bot, views, inquiries_count, factory_name,
         factory_rating, factory_certs, description, status)
      VALUES (?, ?, ?, ?, ?, ?, 'USD', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);
    const insertSpec  = db.prepare('INSERT INTO product_specs  (id, product_id, label, value, sort_order) VALUES (?, ?, ?, ?, ?)');
    const insertImage = db.prepare('INSERT INTO product_images (id, product_id, url, sort_order) VALUES (?, ?, ?, ?)');
    const insertDoc   = db.prepare('INSERT INTO product_docs   (id, product_id, name, file_size, sort_order) VALUES (?, ?, ?, ?, ?)');

    const productsData = [
      {
        name: 'LED Bulb A60 9W', category: 'LED照明', sku: 'LED-A60-9W', price: 1.85,
        moq: '1,000 pcs', stock: '50,000',
        image: 'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=400&h=300&fit=crop',
        hasBot: 1, views: 2340, inquiries: 45, factory: '明辉照明科技', rating: 5,
        certs: '["ISO9001","CE","RoHS","UL"]',
        desc: '高品质LED灯泡，采用进口芯片，高光效低能耗。铝基板散热设计，寿命长达25000小时。支持2700K暖白至6500K冷白全色温范围。通过CE、RoHS、UL等国际认证。',
        specs: [['功率','9W'],['色温','2700K-6500K'],['光通量','810lm'],['显色指数','Ra>80'],['寿命','25,000小时'],['调光','支持PWM'],['输入电压','AC100-240V'],['灯头','E27/E26/B22']],
        images: [
          'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1493723843671-1d655e66ac1c?w=600&h=400&fit=crop',
        ],
        docs: [['产品规格书.pdf','2.3MB'],['CE认证.pdf','890KB'],['测试报告.pdf','1.5MB']],
      },
      {
        name: 'Solar Panel 400W Mono', category: '太阳能', sku: 'SP-400W-M', price: 85.00,
        moq: '50 units', stock: '2,000',
        image: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=400&h=300&fit=crop',
        hasBot: 1, views: 1890, inquiries: 32, factory: '旭日新能源', rating: 5,
        certs: '["TÜV","IEC","CE"]',
        desc: '高效单晶硅太阳能电池板，PERC技术，转换效率21.3%。半片电池设计减少热斑效应。适用于分布式电站、屋顶光伏系统。',
        specs: [['功率','400W'],['电池类型','单晶硅'],['效率','21.3%'],['尺寸','1755×1038×35mm'],['重量','20.5kg'],['质保','25年']],
        images: [
          'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=600&h=400&fit=crop',
          'https://images.unsplash.com/photo-1508514177221-188b1cf16e9d?w=600&h=400&fit=crop',
        ],
        docs: [['产品规格书.pdf','3.1MB'],['TÜV认证.pdf','1.2MB']],
      },
      {
        name: 'Steel Pipe DN100', category: '钢管', sku: 'SP-DN100-G', price: 12.50,
        moq: '5 tons', stock: '500 tons',
        image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop',
        hasBot: 0, views: 980, inquiries: 18, factory: '华鑫钢铁', rating: 4,
        certs: '["ISO9001","API 5L","ASTM"]',
        desc: 'DN100热镀锌钢管，壁厚SCH40，材质Q235B/SS304可选。适用于建筑、市政管道、工业输送。',
        specs: [['管径','DN100'],['壁厚','SCH40'],['材质','Q235B'],['表面处理','热镀锌'],['长度','6m/根']],
        images: [],
        docs: [['产品规格书.pdf','1.8MB'],['API认证.pdf','950KB']],
      },
      {
        name: 'Ceramic Vase Set', category: '家居装饰', sku: 'CV-SET-01', price: 8.50,
        moq: '200 sets', stock: '5,000',
        image: 'https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=400&h=300&fit=crop',
        hasBot: 1, views: 1560, inquiries: 28, factory: '景德陶艺', rating: 4,
        certs: '["SGS","BSCI"]',
        desc: '手工陶瓷花瓶3件套，北欧简约风格。哑光釉面，莫兰迪色系。适用于家居装饰、酒店软装。支持OEM定制。',
        specs: [['材质','高温烧制陶瓷'],['套件','3件（大中小）'],['颜色','莫兰迪色系'],['高度','15/22/30cm'],['工艺','手工拉坯+哑光釉']],
        images: ['https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=600&h=400&fit=crop'],
        docs: [],
      },
      {
        name: 'Phone Case TPU Clear', category: '手机配件', sku: 'PC-TPU-CLR', price: 0.65,
        moq: '5,000 pcs', stock: '200,000',
        image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=400&h=300&fit=crop',
        hasBot: 0, views: 3200, inquiries: 56, factory: '凯达电子', rating: 3,
        certs: '["CE","FCC"]',
        desc: '透明TPU手机壳，支持iPhone/Samsung/Huawei全系列型号。防摔防刮，精准开孔。支持定制logo印刷和包装。',
        specs: [['材质','TPU'],['适配机型','iPhone 15/16系列'],['厚度','1.2mm'],['特性','防摔/防刮/防指纹']],
        images: [],
        docs: [],
      },
      {
        name: 'LED Strip Light 5M RGB', category: 'LED照明', sku: 'LS-5M-RGB', price: 3.20,
        moq: '500 rolls', stock: '30,000',
        image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop',
        hasBot: 1, views: 1780, inquiries: 38, factory: '明辉照明科技', rating: 5,
        certs: '["CE","RoHS","FCC"]',
        desc: 'RGB LED灯带，5050芯片，60灯/米。IP65防水，含遥控器和电源适配器。适用于室内装饰、商业展示、KTV氛围灯。',
        specs: [['芯片','SMD5050'],['灯珠密度','60灯/米'],['防水等级','IP65'],['输入电压','DC12V'],['功率','14.4W/m'],['颜色','RGB可调']],
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&h=400&fit=crop'],
        docs: [],
      },
    ];

    for (const p of productsData) {
      const pid = crypto.randomUUID();
      insertProduct.run(
        pid, DEMO_USER_ID, p.name, p.category, p.sku, p.price,
        p.moq, p.stock, p.image, p.hasBot, p.views, p.inquiries,
        p.factory, p.rating, p.certs, p.desc
      );
      p.specs.forEach(([label, value], i) => insertSpec.run(crypto.randomUUID(), pid, label, value, i + 1));
      p.images.forEach((url, i)           => insertImage.run(crypto.randomUUID(), pid, url, i + 1));
      p.docs.forEach(([name, size], i)     => insertDoc.run(crypto.randomUUID(), pid, name, size, i + 1));
    }

    // ------------------------------------------------------------------
    // 7 INQUIRIES + MESSAGES
    // ------------------------------------------------------------------
    const insertInquiry = db.prepare(`
      INSERT INTO inquiries
        (id, user_id, customer_id, name, company, email, avatar, channel,
         subject, last_message, priority, ai_score, unread, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);
    const insertMessage = db.prepare(`
      INSERT INTO messages (id, inquiry_id, sender, text, subject, ai_generated, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now', ?))
    `);

    // --- Inquiry 1: John Smith — LED Bulbs ---
    const i1 = crypto.randomUUID();
    insertInquiry.run(i1, DEMO_USER_ID, customerIds['John Smith'],
      'John Smith', 'TechCorp Ltd.', 'john.smith@techcorp.com', 'JS', 'Email',
      'Request for Quotation - LED Bulbs 5000 Units',
      'Hi, I need a quote for 5000 units of LED bulbs. Can you send me the FOB price?',
      'high', 85, 1, 'open', '-2 hours');
    insertMessage.run(crypto.randomUUID(), i1, 'customer',
      'Hi, I need a quote for 5000 units of LED bulbs A60 9W. Can you send me the FOB price? We need E27 base, 4000K color temperature.',
      'Request for Quotation - LED Bulbs 5000 Units', 0, '-2 hours');
    insertMessage.run(crypto.randomUUID(), i1, 'customer',
      'Also, do you have UL certification? We need it for the US market.',
      null, 0, '-1 hours');

    // --- Inquiry 2: Maria Garcia — Solar Panels ---
    const i2 = crypto.randomUUID();
    insertInquiry.run(i2, DEMO_USER_ID, customerIds['Maria Garcia'],
      'Maria Garcia', 'EuroTrade GmbH', 'maria@eurotrade.de', 'MG', '独立站',
      null,
      'We are interested in your solar panel products. Could you provide the specifications and MOQ?',
      'high', 78, 1, 'open', '-3 hours');
    insertMessage.run(crypto.randomUUID(), i2, 'customer',
      'We are interested in your solar panel products. Could you provide the specifications and MOQ? We are looking for panels in the 350-400W range for a residential project in Germany.',
      null, 0, '-3 hours');
    insertMessage.run(crypto.randomUUID(), i2, 'customer',
      'Also interested in your warranty terms and TÜV certification status.',
      null, 0, '-2 hours');

    // --- Inquiry 3: Ahmed Hassan — Steel Pipes (replied) ---
    const i3 = crypto.randomUUID();
    insertInquiry.run(i3, DEMO_USER_ID, customerIds['Ahmed Hassan'],
      'Ahmed Hassan', 'MidEast Import Co.', 'ahmed@mideastimport.com', 'AH', 'Email',
      'RE: Steel Pipe Samples Follow-up',
      'Following up on our previous conversation about steel pipes. When can we expect the samples?',
      'medium', 62, 0, 'replied', '-5 hours');
    insertMessage.run(crypto.randomUUID(), i3, 'customer',
      'Following up on our previous conversation about steel pipes. When can we expect the samples?',
      'RE: Steel Pipe Samples Follow-up', 0, '-5 hours');
    insertMessage.run(crypto.randomUUID(), i3, 'user',
      'Dear Ahmed, thank you for your patience. The samples have been shipped via DHL. Tracking number: DHL-2026042001. Expected delivery: 5-7 business days to Dubai.',
      null, 0, '-4 hours');
    insertMessage.run(crypto.randomUUID(), i3, 'customer',
      'Thank you! Once we receive and approve the samples, we\'ll proceed with the initial order of 20 tons.',
      null, 0, '-3 hours');

    // --- Inquiry 4: Sarah Johnson — Phone Cases ---
    const i4 = crypto.randomUUID();
    insertInquiry.run(i4, DEMO_USER_ID, customerIds['Sarah Johnson'],
      'Sarah Johnson', 'Pacific Trading Inc.', 'sarah.j@pacifictrading.com', 'SJ', '独立站',
      null,
      'I submitted an inquiry on your website for phone cases. Looking forward to your reply.',
      'medium', 55, 1, 'open', '-6 hours');
    insertMessage.run(crypto.randomUUID(), i4, 'customer',
      'I submitted an inquiry on your website for phone cases. Looking forward to your reply.',
      null, 0, '-6 hours');

    // --- Inquiry 5: Lucas Müller — Ceramic Vases ---
    const i5 = crypto.randomUUID();
    insertInquiry.run(i5, DEMO_USER_ID, customerIds['Lucas Müller'],
      'Lucas Müller', 'Berlin Home Decor', '', 'LM', 'Instagram',
      null,
      'Hey! Love your ceramic vases. Do you ship to Germany? What\'s the minimum order?',
      'medium', 48, 0, 'open', '-1 days');
    insertMessage.run(crypto.randomUUID(), i5, 'customer',
      'Hey! Love your ceramic vases. Do you ship to Germany? What\'s the minimum order?',
      null, 0, '-1 days');

    // --- Inquiry 6: Roberto Silva — LED (Portuguese) ---
    const i6 = crypto.randomUUID();
    insertInquiry.run(i6, DEMO_USER_ID, customerIds['Roberto Silva'],
      'Roberto Silva', 'Brazil Imports', '', 'RS', 'Facebook',
      null,
      'Olá! Estou interessado em seus produtos de iluminação LED. Vocês exportam para o Brasil?',
      'medium', 58, 0, 'open', '-1 days');
    insertMessage.run(crypto.randomUUID(), i6, 'customer',
      'Olá! Estou interessado em seus produtos de iluminação LED. Vocês exportam para o Brasil?',
      null, 0, '-1 days');

    // --- Inquiry 7: Emma Wilson — Solar Government Project ---
    const i7 = crypto.randomUUID();
    insertInquiry.run(i7, DEMO_USER_ID, customerIds['Emma Wilson'],
      'Emma Wilson', 'UK Green Energy', 'emma@ukgreen.co.uk', 'EW', 'Email',
      'Solar Panel Bulk Order Inquiry - Government Project',
      'We have a government-backed project requiring 500+ solar panels. Can you provide project pricing?',
      'high', 91, 1, 'open', '-30 minutes');
    insertMessage.run(crypto.randomUUID(), i7, 'customer',
      'We have a government-backed project requiring 500+ solar panels. Can you provide project pricing? This is a UK Green Homes Grant project.',
      'Solar Panel Bulk Order Inquiry - Government Project', 0, '-30 minutes');
    insertMessage.run(crypto.randomUUID(), i7, 'customer',
      'Requirements: 400W mono panels, IEC 61215 certified, 25-year warranty minimum. Delivery to London port, CIF terms preferred.',
      null, 0, '-25 minutes');
  });

  seed();
  console.log('✅ Seed data inserted: 1 profile, 8 customers, 6 products, 7 inquiries');
}

// Run init on load
initDatabase();

module.exports = { db, initDatabase, seedDemoData };
