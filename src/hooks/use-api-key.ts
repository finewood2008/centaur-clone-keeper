/**
 * useApiKey — Google Gemini API Key 管理
 *
 * API Key 明文只存 localStorage（服务器不返回明文，只返回 has_api_key）
 * Model 同时存 localStorage 和服务器
 */
import { useState, useEffect, useCallback } from "react";
import { apiFetch } from "@/lib/api-client";

const API_KEY_STORAGE = "banrenma_google_api_key";
const MODEL_STORAGE = "banrenma_google_model";
const DEFAULT_MODEL = "gemini-2.5-flash";

export function useApiKey() {
  const [apiKey, setApiKey] = useState<string>("");
  const [model, setModel] = useState<string>(DEFAULT_MODEL);
  const [loading, setLoading] = useState(true);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  useEffect(() => {
    // Read from localStorage
    const storedKey = localStorage.getItem(API_KEY_STORAGE) || "";
    const storedModel = localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL;
    setApiKey(storedKey);
    setModel(storedModel);
    setLoading(false);
  }, []);

  // Persist key + model to localStorage and server
  const persistToServer = useCallback(async (key: string, m: string) => {
    try {
      await apiFetch("/profile", {
        method: "PUT",
        body: JSON.stringify({
          google_api_key: key,
          google_model: m,
        }),
      });
    } catch {
      console.warn("Failed to save API key to server profile");
    }
  }, []);

  // Save API key (called by Settings page "保存并验证" button)
  const saveKey = useCallback(
    (newKey: string) => {
      localStorage.setItem(API_KEY_STORAGE, newKey);
      setApiKey(newKey);
      persistToServer(newKey, model);
    },
    [model, persistToServer]
  );

  // Save model selection (called by Settings page model dropdown)
  const saveModel = useCallback(
    (newModel: string) => {
      localStorage.setItem(MODEL_STORAGE, newModel);
      setModel(newModel);
      persistToServer(apiKey, newModel);
    },
    [apiKey, persistToServer]
  );

  // Combined save (for backward compat)
  const saveApiKey = useCallback(
    async (newKey: string, newModel?: string) => {
      const m = newModel || model;
      localStorage.setItem(API_KEY_STORAGE, newKey);
      localStorage.setItem(MODEL_STORAGE, m);
      setApiKey(newKey);
      setModel(m);
      await persistToServer(newKey, m);
    },
    [model, persistToServer]
  );

  // Validate key by making a lightweight Gemini API call
  const validateKey = useCallback(async (key: string): Promise<boolean> => {
    if (!key || !key.trim()) {
      setIsValid(false);
      return false;
    }
    setIsValidating(true);
    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${key}`,
        { method: "GET" }
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
  }, []);

  return {
    apiKey,
    model,
    loading,
    saveKey,
    saveModel,
    saveApiKey,
    validateKey,
    isValid,
    isValidating,
    hasApiKey: !!apiKey,
  };
}

// Standalone getters for use outside React components (e.g. AIAssistant)
export function getStoredApiKey(): string {
  return localStorage.getItem("banrenma_google_api_key") || "";
}

export function getStoredModel(): string {
  return localStorage.getItem("banrenma_google_model") || "gemini-2.5-flash";
}

// Hook to check if API key is configured
export function useHasApiKey(): boolean {
  return !!localStorage.getItem("banrenma_google_api_key");
}

// Available Gemini models
export const GOOGLE_MODELS = [
  { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash (推荐)", desc: "最快速度，适合日常对话" },
  { value: "gemini-2.5-pro", label: "Gemini 2.5 Pro", desc: "更强推理，适合复杂任务" },
  { value: "gemini-2.0-flash", label: "Gemini 2.0 Flash", desc: "上代快速模型" },
] as const;
