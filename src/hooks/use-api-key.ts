/**
 * useApiKey - Google AI API Key 管理 Hook
 * 数据源：Supabase profiles 表（google_api_key, google_model 字段）
 * 跨组件响应：通过 React Query 缓存 + 订阅器双轨同步
 */
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DEFAULT_MODEL = "gemini-2.5-flash";
const PROFILE_QUERY_KEY = ["profile-ai-config"] as const;

/* 本地缓存：用于非 React 环境（如 Edge Function 调用前的同步读取） */
const CACHE_KEY = "banrenma_google_api_key_cache";
const CACHE_MODEL = "banrenma_google_model_cache";

export const GOOGLE_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "快速响应，性价比高" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "最强推理，复杂任务" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "基础模型，速度最快" },
] as const;

/* ---------------- 订阅器（用于 useHasApiKey 等轻量 Hook） ---------------- */
type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((l) => l());

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === CACHE_KEY || e.key === CACHE_MODEL) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

const getCachedKey = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(CACHE_KEY) || "";
};
const getCachedModel = () => {
  if (typeof window === "undefined") return DEFAULT_MODEL;
  return localStorage.getItem(CACHE_MODEL) || DEFAULT_MODEL;
};
const writeCache = (key: string, model: string) => {
  if (key) localStorage.setItem(CACHE_KEY, key);
  else localStorage.removeItem(CACHE_KEY);
  localStorage.setItem(CACHE_MODEL, model);
  notify();
};

/* ---------------- 数据库读写 ---------------- */
async function fetchProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { apiKey: "", model: DEFAULT_MODEL };

  const { data, error } = await supabase
    .from("profiles")
    .select("google_api_key, google_model")
    .eq("id", user.id)
    .maybeSingle();

  if (error) throw error;
  const apiKey = data?.google_api_key || "";
  const model = data?.google_model || DEFAULT_MODEL;
  writeCache(apiKey, model);
  return { apiKey, model };
}

async function updateProfile(patch: { google_api_key?: string; google_model?: string }) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("未登录");
  const { error } = await supabase
    .from("profiles")
    .update(patch)
    .eq("id", user.id);
  if (error) throw error;
}

/* ---------------- 主 Hook ---------------- */
export function useApiKey() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchProfile,
    staleTime: 60_000,
  });

  const apiKey = data?.apiKey || "";
  const model = data?.model || DEFAULT_MODEL;

  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const saveKeyMutation = useMutation({
    mutationFn: async (newKey: string) => {
      await updateProfile({ google_api_key: newKey.trim() || null as any });
      writeCache(newKey.trim(), model);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
  });

  const saveModelMutation = useMutation({
    mutationFn: async (newModel: string) => {
      await updateProfile({ google_model: newModel });
      writeCache(apiKey, newModel);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY }),
  });

  const saveKey = useCallback((newKey: string) => {
    setIsValid(null);
    saveKeyMutation.mutate(newKey);
  }, [saveKeyMutation]);

  const clearKey = useCallback(() => {
    setIsValid(null);
    setIsValidating(false);
    saveKeyMutation.mutate("");
  }, [saveKeyMutation]);

  const saveModel = useCallback((m: string) => {
    saveModelMutation.mutate(m);
  }, [saveModelMutation]);

  const validateKey = useCallback(async (keyToValidate?: string) => {
    const k = keyToValidate || apiKey;
    if (!k) return false;
    setIsValidating(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${k}`
      );
      const valid = res.ok;
      setIsValid(valid);
      return valid;
    } catch {
      setIsValid(false);
      return false;
    } finally {
      setIsValidating(false);
    }
  }, [apiKey]);

  const getKey = useCallback(() => apiKey, [apiKey]);
  const getModel = useCallback(() => model, [model]);

  return {
    apiKey,
    model,
    isValid,
    isValidating,
    isLoading,
    saveKey,
    clearKey,
    saveModel,
    validateKey,
    getKey,
    getModel,
    hasKey: !!apiKey,
  };
}

/* ---------------- 轻量布尔 Hook（Banner/Guard 用） ---------------- */
export function useHasApiKey(): boolean {
  // 订阅缓存层；同时触发一次后台拉取确保新会话能填充缓存
  const cached = useSyncExternalStore(subscribe, getCachedKey, () => "");
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!cached) {
      queryClient.fetchQuery({
        queryKey: PROFILE_QUERY_KEY,
        queryFn: fetchProfile,
        staleTime: 60_000,
      }).catch(() => {});
    }
  }, [cached, queryClient]);

  return !!cached;
}

/* ---------------- 静态工具函数（非 React 环境，仅读缓存） ---------------- */
export function getStoredApiKey(): string {
  return getCachedKey();
}

export function getStoredModel(): string {
  return getCachedModel();
}

export function hasStoredApiKey(): boolean {
  return !!getCachedKey();
}
