# 更新日志

所有重要的项目变更都记录在此文件中。

格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

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
