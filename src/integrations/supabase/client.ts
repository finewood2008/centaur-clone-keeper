/**
 * Legacy compatibility layer
 * All Supabase references now resolve to the local API client.
 * Direct supabase usage has been removed from all hooks and pages.
 */
export { apiFetch, getToken, setToken, clearToken, hasToken } from '@/lib/api-client';

// Stub for any remaining imports that reference 'supabase'
export const supabase = null;
