# 半人马 Trade - 跨境电商 AI 运营平台

> 由 **半人马AI** 出品 | Powered by Google Gemini

跨境电商一站式智能运营后台。接入 Google Gemini 大模型，覆盖询盘管理、产品运营、社媒内容、广告投放、邮件营销、客户 CRM 全链路，让中小外贸企业用 AI 提效。

## 功能模块

| 模块 | 说明 |
|------|------|
| 📊 控制台 | 业务数据总览，实时监控询盘、客户、订单 |
| 📥 询盘中心 | 全渠道消息聚合（Email/独立站/社媒），AI 自动生成专业回复 |
| 📦 产品库 | 产品目录管理，AI 产品机器人实时答疑，支持同品类推荐 |
| 📱 社媒内容 | 多平台内容生成与排期（Facebook/Instagram/TikTok） |
| 📣 广告投放 | 跨平台广告账户管理与审批 |
| ✉️ 邮件营销 | AI 开发信生成，自动序列，效果分析 |
| 👥 客户管理 | 360° 客户画像，AI 评分，成交漏斗看板 |
| 💾 数据中心 | 数据备份、导出、隐私管理 |
| 💰 消费中心 | API 调用统计与计费 |
| 🤖 AI 助手 | 全局浮动助手，随时提问，流式回复 |

## 技术栈

- **前端**: React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui
- **后端**: Supabase (Auth + Database + Edge Functions)
- **AI 引擎**: Google Gemini API (2.5 Flash / 2.5 Pro)
- **动画**: Framer Motion
- **状态管理**: TanStack React Query
- **富文本**: TipTap Editor

## 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/finewood2008/banrenma-trade.git
cd banrenma-trade
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

项目根目录已有 `.env` 文件，包含 Supabase 连接信息。如需修改请编辑 `.env`：

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
```

### 4. 启动开发服务器

```bash
npm run dev
```

### 5. 配置 AI 功能

启动后进入「设置 → AI Agent 配置」，填入你的 Google AI API Key 即可激活所有 AI 功能。

获取 Key：https://aistudio.google.com/apikey

## 项目结构

```
src/
├── assets/              # 静态资源（Logo 等）
├── components/
│   ├── ui/              # shadcn 基础组件
│   ├── dashboard/       # 控制台图表组件
│   ├── customers/       # 客户管理组件
│   ├── products/        # 产品组件
│   ├── social/          # 社媒模块
│   ├── ads/             # 广告模块
│   ├── email/           # 邮件模块
│   ├── AIAssistant.tsx  # 全局 AI 助手
│   ├── ApiKeyGuard.tsx  # API Key 未配置引导
│   └── DashboardLayout.tsx  # 主布局
├── hooks/
│   ├── use-api-key.ts   # API Key 管理 Hook
│   └── use-mobile.tsx   # 响应式检测
├── lib/
│   ├── gemini.ts        # Gemini API 封装（流式/非流式）
│   └── utils.ts         # 工具函数
├── pages/               # 各页面
│   ├── Dashboard.tsx
│   ├── Inbox.tsx
│   ├── Products.tsx
│   ├── Customers.tsx
│   ├── Settings.tsx
│   ├── social/
│   ├── ads/
│   ├── email/
│   ├── billing/
│   └── data/
└── integrations/
    └── supabase/        # Supabase 客户端与类型

supabase/
├── config.toml
└── functions/
    ├── generate-reply/  # 询盘 AI 回复（Edge Function）
    └── product-bot/     # 产品 AI 机器人（Edge Function）
```

## AI 架构

```
用户浏览器
  │
  ├─ AI 助手 ──────────── 直接调用 Google Gemini API（低延迟流式）
  │
  ├─ 询盘回复 ─┐
  │            ├──────── Supabase Edge Function ── Google Gemini API
  └─ 产品机器人 ┘
```

- 用户在设置中填入自己的 Google AI API Key
- AI 助手：前端直接调用 Gemini API，流式输出
- 询盘回复 & 产品机器人：通过 Supabase Edge Function 代理调用，Key 通过请求头传递

## 开发命令

```bash
npm run dev        # 启动开发服务器
npm run build      # 生产构建
npm run preview    # 预览生产构建
npm run lint       # ESLint 检查
npm run test       # 运行测试
```

## 更新日志

详见 [CHANGELOG.md](./CHANGELOG.md)

## 许可证

Copyright © 2026 半人马AI. All rights reserved.
