# Lovable 前端改造提示词
# 目标：将所有 Supabase 调用替换为本地 REST API 调用
# 分 4 轮执行，每轮改 2-3 个文件

---

## 第一轮：API 客户端 + 认证系统

### 提示词：

我们正在将应用从 Supabase 云端迁移到本地 Express+SQLite 后端。本地后端已经在 server/ 目录里就绪，API 前缀是 `/api/trade/`，认证方式是 Bearer Token（JWT），所有响应格式都是 `{ code: 0, data: ..., message: "success" }`。

请按以下步骤改造：

**1. 替换 `src/integrations/supabase/client.ts`**

把整个文件内容替换为一个本地 API 客户端模块：

```typescript
// src/lib/api-client.ts
const TOKEN_KEY = 'banrenma_auth_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function apiFetch<T = any>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`/api/trade${path}`, { ...options, headers });
  const json = await res.json();

  if (!res.ok || json.code !== 0) {
    throw new Error(json.message || `API error ${res.status}`);
  }
  return json.data;
}
```

**2. 重写 `src/hooks/use-auth.ts`**

把所有 supabase.auth 调用替换为本地 API 调用：

- `signUp(email, password, fullName)` → `POST /api/trade/auth/register` body: `{ email, password, full_name: fullName }`
- `signIn(email, password)` → `POST /api/trade/auth/login` body: `{ email, password }`
- `signOut()` → 清除 localStorage token，不需要请求服务器
- `getSession()` / 初始化 → `GET /api/trade/auth/me`，如果 token 存在则获取用户信息
- 移除 `onAuthStateChange` 订阅，改为 app mount 时检查 token

Hook 应该导出：`{ user, session, loading, signIn, signUp, signOut }`
login/register 成功后用 `setToken(data.token)` 保存 token。
user 信息从 login/register 响应的 `data.user` 获取。

**3. 删除或清空 `src/integrations/supabase/` 目录下的 types.ts 等文件**

这些 Supabase 自动生成的类型不再需要。但不要删除 `src/integrations/supabase/client.ts` 这个文件路径——把它改为 re-export api-client 的内容，这样其他文件的 import 路径不需要全部改：

```typescript
// src/integrations/supabase/client.ts
// Legacy compatibility — re-exports the local API client
export { apiFetch, getToken, setToken, clearToken } from '@/lib/api-client';
```

注意保留所有现有的 UI 组件和页面不变，只改数据层。

---

## 第二轮：客户 + 产品 Hooks

### 提示词：

继续迁移数据层。现在改造客户和产品的 hooks。

API 客户端已经在 `src/lib/api-client.ts`，使用 `apiFetch<T>(path, options)` 调用。

**1. 重写 `src/hooks/use-customers.ts`**

把所有 supabase.from("customers") 调用替换为 apiFetch：

- `useCustomers()` → `apiFetch('/customers')` 返回客户列表
- `useCustomer(id)` → `apiFetch('/customers/' + id)` 返回单个客户
- `useCreateCustomer()` → `apiFetch('/customers', { method: 'POST', body: JSON.stringify(data) })`
  不需要手动传 user_id，服务器从 token 自动获取
- `useUpdateCustomer()` → `apiFetch('/customers/' + id, { method: 'PUT', body: JSON.stringify(updates) })`
- `useDeleteCustomer()` → `apiFetch('/customers/' + id, { method: 'DELETE' })`

继续使用 react-query（@tanstack/react-query），queryKey 保持 ['customers'] 和 ['customer', id]。

**2. 重写 `src/hooks/use-products.ts`**

- `useProducts()` → `apiFetch('/products')`
- `useProductWithDetails(id)` → `apiFetch('/products/' + id)`，服务器会返回 product + specs + images + docs
- `useCreateProduct()` → `apiFetch('/products', { method: 'POST', body })`
- `useUpdateProduct()` → `apiFetch('/products/' + id, { method: 'PUT', body })`
- `useDeleteProduct()` → `apiFetch('/products/' + id, { method: 'DELETE' })`
- `useReplaceProductSpecs(productId)` → `apiFetch('/products/' + productId + '/specs', { method: 'PUT', body: JSON.stringify({ specs }) })`
- `useReplaceProductImages(productId)` → `apiFetch('/products/' + productId + '/images', { method: 'PUT', body: JSON.stringify({ images }) })`
- `useReplaceProductDocs(productId)` → `apiFetch('/products/' + productId + '/docs', { method: 'PUT', body: JSON.stringify({ docs }) })`

关于文件上传（supabase.storage）：暂时注释掉或改为提示"本地版本暂不支持文件上传"，后续再加。保留 uploadProductImage 和 uploadProductDoc 函数签名但内部 throw new Error('File upload not yet supported in local mode')。

---

## 第三轮：询盘 + Dashboard + API Key

### 提示词：

继续迁移。改造询盘、Dashboard 统计和 API Key hooks。

**1. 重写 `src/hooks/use-inquiries.ts`**

- `useInquiries()` → `apiFetch('/inquiries')`
- `useInquiry(id)` → `apiFetch('/inquiries/' + id)`，响应包含 messages 数组
- `useUpdateInquiry()` → `apiFetch('/inquiries/' + id, { method: 'PUT', body })`
- `useMessages(inquiryId)` → 不需要单独查，从 useInquiry 的 data.messages 获取
  或者在 queryFn 里 `apiFetch('/inquiries/' + inquiryId).then(d => d.messages)`
- `useSendMessage()` → `apiFetch('/inquiries/' + inquiryId + '/messages', { method: 'POST', body: JSON.stringify({ text, sender }) })`
  发送后 invalidate ['inquiry', inquiryId] 和 ['inquiries']

**2. 重写 `src/hooks/use-dashboard-stats.ts`**

把 6 个独立的 supabase count 查询替换为一次调用：
- `apiFetch('/dashboard')` 返回所有统计数据
- 返回格式：`{ customers: { total, active, tierA }, products: { total, active, totalViews }, inquiries: { total, open, unread, highPriority }, revenue: { total, orders }, recentInquiries, topCustomers, channelDistribution }`
- 保持 refetchInterval: 30000

**3. 重写 `src/hooks/use-api-key.ts`**

- 获取 API Key → `apiFetch('/profile')` 然后取 `google_api_key` 和 `google_model`
  注意：服务器不返回明文 api_key，只返回 `has_api_key: boolean`
  所以读取 api_key 仍然走 localStorage (banrenma_google_api_key)
- 保存 API Key → `apiFetch('/profile', { method: 'PUT', body: JSON.stringify({ google_api_key, google_model }) })`
  同时保存到 localStorage

---

## 第四轮：页面组件 + 清理 Realtime

### 提示词：

最后一轮清理。

**1. 清理 `src/pages/Inbox.tsx`**

- 移除动态 import supabase/client
- 获取消息改用 `apiFetch('/inquiries/' + inquiryId)`（messages 已包含在响应里）
- AI 回复功能（Edge Function generate-reply）暂时改为直接调用 Gemini API（前端已有 src/lib/gemini.ts），或者弹 toast 提示"AI 回复功能开发中"

**2. 清理 `src/pages/Dashboard.tsx`**

- 移除所有 supabase.channel() 实时订阅代码
- 数据已经通过 use-dashboard-stats.ts 的 refetchInterval 轮询更新，不需要 realtime

**3. 删除 `src/hooks/use-inbox-realtime.ts`**

- 整个文件删除（或清空为 export 一个空 hook）
- 在引用它的文件里移除 import

**4. 清理 `src/components/products/ProductDetail.tsx`**

- supabase.functions.invoke("product-bot") AI 聊天功能暂时改为调用前端 Gemini（src/lib/gemini.ts），或提示"AI 产品助手开发中"

**5. 全局检查**

- 搜索项目中所有 import from '@supabase' 或 import from '../integrations/supabase'，确保全部清理
- 确保 `@supabase/supabase-js` 只在 package.json 里存在（不要删除，避免 Lovable 报错），但代码中不再引用

---

# 注意事项

1. 保持所有 UI/页面/样式不变，只改数据获取层
2. 保持 react-query 的 queryKey 命名一致
3. 所有 API 调用通过 apiFetch() 统一走，不要直接 fetch
4. 错误处理：apiFetch 已经会 throw Error，useMutation 的 onError 直接 toast.error(err.message)
5. 用户未登录时（无 token），apiFetch 会收到 401，前端应 redirect 到 /auth
