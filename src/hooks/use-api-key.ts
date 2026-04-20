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

  useEffect(() => {
    // Read from localStorage
    const storedKey = localStorage.getItem(API_KEY_STORAGE) || "";
    const storedModel = localStorage.getItem(MODEL_STORAGE) || DEFAULT_MODEL;
    setApiKey(storedKey);
    setModel(storedModel);
    setLoading(false);
  }, []);

  const saveApiKey = useCallback(
    async (newKey: string, newModel?: string) => {
      const m = newModel || model;

      // Save to localStorage
      localStorage.setItem(API_KEY_STORAGE, newKey);
      localStorage.setItem(MODEL_STORAGE, m);
      setApiKey(newKey);
      setModel(m);

      // Persist to server profile
      try {
        await apiFetch("/profile", {
          method: "PUT",
          body: JSON.stringify({
            google_api_key: newKey,
            google_model: m,
          }),
        });
      } catch {
        // Server save failed, but localStorage is updated — acceptable for local-first
        console.warn("Failed to save API key to server profile");
      }
    },
    [model]
  );

  return {
    apiKey,
    model,
    loading,
    saveApiKey,
    hasApiKey: !!apiKey,
  };
}
