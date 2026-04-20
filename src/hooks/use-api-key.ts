/**
 * useApiKey - Google AI API Key 管理 Hook（响应式 store）
 * 使用 useSyncExternalStore 实现跨组件、跨标签页的响应式更新
 */
import { useCallback, useState, useSyncExternalStore } from "react";

const STORAGE_KEY = "banrenma_google_api_key";
const MODEL_KEY = "banrenma_google_model";
const DEFAULT_MODEL = "gemini-2.5-flash";

export const GOOGLE_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash", desc: "快速响应，性价比高" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "最强推理，复杂任务" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "基础模型，速度最快" },
] as const;

/* ---------------- 响应式订阅器 ---------------- */
type Listener = () => void;
const listeners = new Set<Listener>();

const notify = () => listeners.forEach((l) => l());

const subscribe = (listener: Listener) => {
  listeners.add(listener);
  // 跨标签页同步
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEY || e.key === MODEL_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
};

const getKeySnapshot = () => {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEY) || "";
};

const getModelSnapshot = () => {
  if (typeof window === "undefined") return DEFAULT_MODEL;
  return localStorage.getItem(MODEL_KEY) || DEFAULT_MODEL;
};

const getServerSnapshot = () => "";
const getServerModelSnapshot = () => DEFAULT_MODEL;

/* ---------------- 写入操作（触发订阅） ---------------- */
const writeKey = (key: string) => {
  const trimmed = key.trim();
  if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
  else localStorage.removeItem(STORAGE_KEY);
  notify();
};

const writeModel = (model: string) => {
  localStorage.setItem(MODEL_KEY, model);
  notify();
};

/* ---------------- Hook ---------------- */
export function useApiKey() {
  const apiKey = useSyncExternalStore(subscribe, getKeySnapshot, getServerSnapshot);
  const model = useSyncExternalStore(subscribe, getModelSnapshot, getServerModelSnapshot);

  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const saveKey = useCallback((newKey: string) => {
    writeKey(newKey);
    setIsValid(null);
  }, []);

  const clearKey = useCallback(() => {
    writeKey("");
    setIsValid(null);
    setIsValidating(false);
  }, []);

  const saveModel = useCallback((m: string) => {
    writeModel(m);
  }, []);

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
      setIsValidating(false);
      return valid;
    } catch {
      setIsValid(false);
      setIsValidating(false);
      return false;
    }
  }, [apiKey]);

  const getKey = useCallback(() => apiKey, [apiKey]);
  const getModel = useCallback(() => model, [model]);

  return {
    apiKey,
    model,
    isValid,
    isValidating,
    saveKey,
    clearKey,
    saveModel,
    validateKey,
    getKey,
    getModel,
    hasKey: !!apiKey,
  };
}

/* ---------------- 响应式布尔 Hook（专给 Banner/Guard 用） ---------------- */
export function useHasApiKey(): boolean {
  const apiKey = useSyncExternalStore(subscribe, getKeySnapshot, getServerSnapshot);
  return !!apiKey;
}

/* ---------------- 静态工具函数（边缘场景，如非 React 环境） ---------------- */
export function getStoredApiKey(): string {
  return getKeySnapshot();
}

export function getStoredModel(): string {
  return getModelSnapshot();
}

export function hasStoredApiKey(): boolean {
  return !!getKeySnapshot();
}
