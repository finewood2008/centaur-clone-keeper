<p align="center">
  <img src="src/assets/logo.png" alt="半人马 Trade" width="80" />
</p>

<h1 align="center">半人马 Trade</h1>
<h3 align="center">跨境电商 AI 运营平台 · Cross-Border E-Commerce AI Operations Platform</h3>

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-06B6D4?logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-Backend-3FCF8E?logo=supabase&logoColor=white" alt="Supabase" />
  <img src="https://img.shields.io/badge/Google_Gemini-AI_Engine-4285F4?logo=google&logoColor=white" alt="Gemini" />
  <img src="https://img.shields.io/badge/License-Proprietary-red" alt="License" />
</p>

<p align="center">
  <b>由半人马AI出品 · Built by Centaur AI</b>
</p>

---

## 🇨🇳 中文介绍

### 项目简介

半人马 Trade 是一款面向中小外贸企业的**一站式跨境电商智能运营后台**。平台深度集成 Google Gemini 大模型，覆盖从询盘管理、产品运营、社交媒体、广告投放到客户 CRM 的全业务链路，帮助外贸团队用 AI 大幅提升运营效率。

用户只需在设置中填入自己的 Google AI API Key，平台的全部 AI 功能即刻激活——无需额外部署，无需后端配置。

### 核心功能

| 模块 | 功能 | AI 加持 |
|------|------|---------|
| 📊 **控制台** | 业务数据总览，实时监控询盘、客户、订单指标 | 数据摘要、趋势分析 |
| 📥 **询盘中心** | 全渠道消息聚合（Email / 独立站 / Instagram / Facebook） | AI 自动生成专业回复，流式输出 |
| 📦 **产品库** | 产品目录管理，工厂直连，规格参数维护 | AI 产品机器人实时答疑，同品类智能推荐 |
| 📱 **社媒内容** | 多平台内容创作与排期（Facebook / Instagram / TikTok） | AI 文案生成 |
| 📣 **广告投放** | 跨平台广告账户管理、投放看板、审批流 | — |
| ✉️ **邮件营销** | 开发信创建、自动序列、AB 测试、垃圾邮件检测 | AI 开发信生成 |
| 👥 **客户管理** | 360° 客户画像、AI 评分、商机看板、批量导入 | 客户价值评估 |
| 💾 **数据中心** | 数据备份、多格式导出、隐私合规 | — |
| 💰 **消费中心** | API 调用计费、点数充值、套餐管理 | — |
| 🤖 **AI 助手** | 全局浮动对话助手，随时提问 | Gemini 流式对话 |

### 技术亮点

- **即插即用**：填入 Google API Key 即可使用，零后端部署
- **流式 AI**：询盘回复、AI 助手均支持流式输出，逐字显示，体验流畅
- **双路 AI 架构**：AI 助手前端直调 Gemini（低延迟），询盘 / 产品机器人走 Supabase Edge Function（安全隔离）
- **暗色 Glassmorphism UI**：高品质毛玻璃视觉风格，桌面 + 移动端全响应式
- **模型可选**：支持 Gemini 2.5 Flash / 2.5 Pro / 2.0 Flash，用户按需切换

---

## 🇺🇸 English

### Overview

**Centaur Trade** is an all-in-one AI-powered operations platform designed for small and medium cross-border e-commerce businesses. Deeply integrated with Google Gemini, it covers the entire workflow — from inquiry management, product operations, social media, ad campaigns, to customer CRM — helping foreign trade teams dramatically boost efficiency with AI.

Users simply enter their Google AI API Key in the settings page, and all AI features are instantly activated — no backend deployment or extra configuration needed.

### Key Features

| Module | Description | AI-Powered |
|--------|-------------|------------|
| 📊 **Dashboard** | Business overview with real-time KPIs for inquiries, customers, orders | Data summaries, trend analysis |
| 📥 **Inquiry Center** | Omnichannel inbox (Email / Website / Instagram / Facebook) | AI auto-generates professional replies with streaming output |
| 📦 **Product Library** | Product catalog, factory integration, specs management | AI product bot for Q&A, smart cross-category recommendations |
| 📱 **Social Media** | Multi-platform content creation & scheduling (FB / IG / TikTok) | AI copywriting |
| 📣 **Ad Campaigns** | Cross-platform ad account management, dashboard, approvals | — |
| ✉️ **Email Marketing** | Cold email creation, auto sequences, A/B testing, spam scoring | AI email generation |
| 👥 **CRM** | 360° customer profiles, AI scoring, deal kanban, bulk import | Customer value assessment |
| 💾 **Data Center** | Backup, multi-format export, privacy compliance | — |
| 💰 **Billing** | API usage metering, credits recharge, plan management | — |
| 🤖 **AI Assistant** | Global floating chat assistant, ask anything anytime | Gemini streaming conversations |

### Technical Highlights

- **Plug & Play** — Just enter your Google API Key, zero backend setup required
- **Streaming AI** — Both inquiry replies and AI assistant support real-time streaming output
- **Dual AI Architecture** — AI Assistant calls Gemini directly from frontend (low latency); Inquiry / Product bots route through Supabase Edge Functions (secure isolation)
- **Glassmorphism UI** — Premium dark glass-morphism design, fully responsive on desktop & mobile
- **Model Selection** — Supports Gemini 2.5 Flash / 2.5 Pro / 2.0 Flash, user-configurable

---

## 🛠 Tech Stack

```
Frontend:    React 18  ·  TypeScript 5.8  ·  Vite 5  ·  Tailwind CSS 3.4  ·  shadcn/ui
Backend:     Supabase (Auth · Database · Edge Functions)
AI Engine:   Google Gemini API (2.5 Flash / 2.5 Pro / 2.0 Flash)
Animation:   Framer Motion
State:       TanStack React Query
Rich Text:   TipTap Editor
Charts:      Recharts
Testing:     Vitest · Playwright
```

## 🚀 Quick Start

### 1. Clone

```bash
git clone https://github.com/finewood2008/centaur-clone-keeper.git
cd centaur-clone-keeper
```

### 2. Install

```bash
npm install
```

### 3. Environment

The project includes a `.env` with Supabase connection info. To customize:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 4. Run

```bash
npm run dev
```

### 5. Activate AI

Open the app → **Settings → AI Agent Config** → Enter your Google AI API Key → Click "Save & Verify"

Get your key at: https://aistudio.google.com/apikey

Once verified, all AI features (assistant, inquiry replies, product bot) are instantly active.

## 📁 Project Structure

```
src/
├── assets/                  # Static assets (logo, etc.)
├── components/
│   ├── ui/                  # shadcn/ui base components
│   ├── dashboard/           # Dashboard charts & widgets
│   ├── customers/           # CRM components (kanban, map)
│   ├── products/            # Product detail & AI bot
│   ├── social/              # Social media module
│   ├── ads/                 # Ad campaigns module
│   ├── email/               # Email marketing module
│   ├── AIAssistant.tsx      # Global floating AI assistant
│   ├── ApiKeyBanner.tsx     # API Key setup banner
│   ├── ApiKeyGuard.tsx      # Graceful degradation guard
│   └── DashboardLayout.tsx  # Main layout shell
├── hooks/
│   ├── use-api-key.ts       # API Key management hook
│   ├── use-mobile.tsx       # Responsive detection
│   └── use-theme.tsx        # Theme management
├── lib/
│   ├── gemini.ts            # Gemini API wrapper (stream + non-stream)
│   └── utils.ts             # Utilities
├── pages/
│   ├── Dashboard.tsx        # Home dashboard
│   ├── Inbox.tsx            # Inquiry center
│   ├── Products.tsx         # Product library
│   ├── Customers.tsx        # CRM
│   ├── Settings.tsx         # Settings (API Key config here)
│   ├── social/              # Social media pages
│   ├── ads/                 # Ad campaign pages
│   ├── email/               # Email marketing pages
│   ├── billing/             # Billing & plans
│   └── data/                # Data center pages
└── integrations/
    └── supabase/            # Supabase client & types

supabase/
├── config.toml
└── functions/
    ├── generate-reply/      # Inquiry AI reply (Edge Function → Gemini)
    └── product-bot/         # Product AI bot (Edge Function → Gemini)
```

## 🏗 AI Architecture

```
                          ┌─────────────────────────────┐
                          │       User's Browser        │
                          └──────────┬──────────────────┘
                                     │
                    ┌────────────────┼────────────────┐
                    │                │                │
              ┌─────▼─────┐   ┌─────▼─────┐   ┌─────▼─────┐
              │ AI Asst.  │   │  Inquiry  │   │  Product  │
              │ (Direct)  │   │  Reply    │   │    Bot    │
              └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
                    │               │                │
                    │         ┌─────▼─────────────────▼────┐
                    │         │  Supabase Edge Functions    │
                    │         │  (x-google-api-key header)  │
                    │         └─────────────┬──────────────┘
                    │                       │
              ┌─────▼───────────────────────▼────┐
              │      Google Gemini API           │
              │   (User's own API Key)           │
              └──────────────────────────────────┘
```

- **AI Assistant**: Frontend → Gemini API directly (minimal latency, streaming)
- **Inquiry Reply & Product Bot**: Frontend → Supabase Edge Function → Gemini API (server-side isolation)
- All calls use the **user's own Google API Key** — no shared credentials, no vendor lock-in

## 📝 Dev Commands

```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # ESLint check
npm run test         # Run unit tests
npm run test:watch   # Watch mode tests
```

## 📄 Changelog

See [CHANGELOG.md](./CHANGELOG.md) for version history.

## 📜 License

Copyright © 2026 半人马AI (Centaur AI). All rights reserved.

---

<p align="center">
  <sub>Built with ❤️ by <b>Centaur AI</b> · 半人马AI</sub>
</p>
