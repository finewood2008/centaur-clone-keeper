# 更新日志

所有重要的项目变更都记录在此文件中。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [0.3.0] - 2026-04-20

### 新增
- **数据库 Schema 设计与 Migration**
  - `supabase/migrations/20260420_001_initial_schema.sql`：完整数据库建表
  - 8 张核心表：profiles, customers, products, product_specs, product_images, product_docs, inquiries, messages
  - 完整的 RLS（行级安全）策略，每个用户只能访问自己的数据
  - auto-update `updated_at` 触发器
  - 注册时自动创建 profile 触发器
- **Seed 数据**
  - `supabase/migrations/20260420_002_seed_data.sql`：跨境电商真实场景示例数据
  - 8 个客户（美国/德国/阿联酋/日本/巴西/澳大利亚/英国）
  - 6 个产品（LED灯泡/太阳能板/钢管/陶瓷花瓶/手机壳/LED灯带）含规格/图片/文档
  - 7 条询盘 + 对话消息
- **TypeScript 类型定义更新**
  - `src/integrations/supabase/types.ts`：完整的 Database 类型定义，覆盖所有表
- **数据层 Hooks**
  - `src/hooks/use-customers.ts`：客户 CRUD（查询/创建/更新/删除）
  - `src/hooks/use-products.ts`：产品 CRUD + 关联规格/图片/文档查询
  - `src/hooks/use-inquiries.ts`：询盘 + 消息查询，发送消息自动更新询盘状态
  - `src/hooks/use-auth.ts`：Supabase Auth 认证 hook（登录/注册/登出/会话监听）

### 修复
- CSS `@import` 顺序修正（Google Fonts @import 移至 @tailwind 之前）

### 移除
- 删除废弃文件 `src/pages/Index.tsx`（Lovable 占位页）
- 删除废弃文件 `src/pages/EmailMarketing.tsx`（已被 /email/* 路由替代）

---

## [0.2.0] - 2026-04-20

### 新增
- **Google Gemini 集成层**
  - `src/lib/gemini.ts`：封装 Gemini API 调用，支持流式和非流式两种模式
  - `src/hooks/use-api-key.ts`：API Key 管理 Hook，支持存储、验证、模型选择
  - `src/components/ApiKeyGuard.tsx`：未配置 Key 时的优雅降级引导组件
- **实施计划文档** (`docs/plans/2026-04-20-google-ai-integration.md`)

### 变更
- **Edge Functions 重构**
  - `generate-reply`：从 Lovable Gateway 改为直接调用 Google Gemini API，通过 `x-google-api-key` 请求头接收用户的 Key
  - `product-bot`：同上，统一切换到 Google Gemini API
  - 两个 Edge Function 均支持通过 `x-google-model` 头指定模型

### 前端改造（Lovable 执行）
- **Settings 页**：新增 Google AI API Key 输入框、验证、模型选择（Flash/Pro）
- **AI 助手真实化**：删除 mock 硬编码，接入 Gemini 流式对话
- **询盘回复**：前端调用 Edge Function 时通过 header 传入用户 Key，SSE 解析适配 Gemini 格式
- **产品机器人**：同上，ProductDetail 组件已适配
- **ApiKeyBanner 组件**：Dashboard、Inbox、Products 三页顶部引导提示
- **路由修复**：删除重复的 /customers 路由
- **集成页更新**：API 密钥分组改为 Google AI，动态显示连接状态

---

## [0.1.0] - 2026-03-28

### 初始版本
- 完整的跨境电商运营后台 UI
- 10 个功能模块：控制台、询盘中心、产品库、社媒内容、广告投放、邮件营销、客户管理、数据中心、消费中心、设置
- 暗色 Glassmorphism 视觉风格
- 响应式布局（桌面 + 移动端）
- AI 助手浮动窗口（Mock 数据）
- 询盘 AI 回复 Edge Function（Lovable Gateway）
- 产品 AI 机器人 Edge Function（Lovable Gateway）
- Supabase 基础集成
