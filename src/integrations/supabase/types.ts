/**
 * Legacy Supabase type definitions — DEPRECATED
 * 
 * This file is retained for backward compatibility only.
 * All data access now goes through local REST API (src/lib/api-client.ts).
 * Type definitions for each entity live in their respective hooks:
 *   - Customer → src/hooks/use-customers.ts
 *   - Product  → src/hooks/use-products.ts
 *   - Inquiry  → src/hooks/use-inquiries.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];
