/**
 * Supabase Database Types (auto-generated pattern, manually maintained)
 * 半人马 Trade - 数据库类型定义
 */

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          company_name: string | null;
          avatar_url: string | null;
          google_api_key: string | null;
          google_model: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          company_name?: string | null;
          avatar_url?: string | null;
          google_api_key?: string | null;
          google_model?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          company_name?: string | null;
          avatar_url?: string | null;
          google_api_key?: string | null;
          google_model?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          company: string | null;
          country: string | null;
          email: string | null;
          phone: string | null;
          tier: "A" | "B" | "C";
          ai_score: number;
          total_orders: number;
          total_value: number;
          last_contact_at: string | null;
          channels: string[];
          status: "active" | "nurturing" | "cold";
          tags: string[];
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          company?: string | null;
          country?: string | null;
          email?: string | null;
          phone?: string | null;
          tier?: "A" | "B" | "C";
          ai_score?: number;
          total_orders?: number;
          total_value?: number;
          last_contact_at?: string | null;
          channels?: string[];
          status?: "active" | "nurturing" | "cold";
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          company?: string | null;
          country?: string | null;
          email?: string | null;
          phone?: string | null;
          tier?: "A" | "B" | "C";
          ai_score?: number;
          total_orders?: number;
          total_value?: number;
          last_contact_at?: string | null;
          channels?: string[];
          status?: "active" | "nurturing" | "cold";
          tags?: string[];
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      products: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string | null;
          sku: string | null;
          price: number | null;
          currency: string;
          moq: string | null;
          stock: string | null;
          image_url: string | null;
          has_bot: boolean;
          views: number;
          inquiries_count: number;
          factory_name: string | null;
          factory_rating: number | null;
          factory_certs: string[];
          description: string | null;
          status: "active" | "draft" | "archived";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category?: string | null;
          sku?: string | null;
          price?: number | null;
          currency?: string;
          moq?: string | null;
          stock?: string | null;
          image_url?: string | null;
          has_bot?: boolean;
          views?: number;
          inquiries_count?: number;
          factory_name?: string | null;
          factory_rating?: number | null;
          factory_certs?: string[];
          description?: string | null;
          status?: "active" | "draft" | "archived";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string | null;
          sku?: string | null;
          price?: number | null;
          currency?: string;
          moq?: string | null;
          stock?: string | null;
          image_url?: string | null;
          has_bot?: boolean;
          views?: number;
          inquiries_count?: number;
          factory_name?: string | null;
          factory_rating?: number | null;
          factory_certs?: string[];
          description?: string | null;
          status?: "active" | "draft" | "archived";
          created_at?: string;
          updated_at?: string;
        };
      };
      product_specs: {
        Row: {
          id: string;
          product_id: string;
          label: string;
          value: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          label: string;
          value: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          label?: string;
          value?: string;
          sort_order?: number;
        };
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          url: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          url: string;
          sort_order?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          url?: string;
          sort_order?: number;
        };
      };
      product_docs: {
        Row: {
          id: string;
          product_id: string;
          name: string;
          file_size: string | null;
          url: string | null;
          sort_order: number;
        };
        Insert: {
          id?: string;
          product_id: string;
          name: string;
          file_size?: string | null;
          url?: string | null;
          sort_order?: number;
        };
        Update: {
          id?: string;
          product_id?: string;
          name?: string;
          file_size?: string | null;
          url?: string | null;
          sort_order?: number;
        };
      };
      inquiries: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string | null;
          name: string;
          company: string | null;
          email: string | null;
          avatar: string | null;
          channel: "Email" | "独立站" | "Instagram" | "Facebook" | "Twitter";
          subject: string | null;
          last_message: string | null;
          priority: "high" | "medium" | "low";
          ai_score: number;
          unread: boolean;
          status: "open" | "replied" | "closed";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id?: string | null;
          name: string;
          company?: string | null;
          email?: string | null;
          avatar?: string | null;
          channel?: "Email" | "独立站" | "Instagram" | "Facebook" | "Twitter";
          subject?: string | null;
          last_message?: string | null;
          priority?: "high" | "medium" | "low";
          ai_score?: number;
          unread?: boolean;
          status?: "open" | "replied" | "closed";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          customer_id?: string | null;
          name?: string;
          company?: string | null;
          email?: string | null;
          avatar?: string | null;
          channel?: "Email" | "独立站" | "Instagram" | "Facebook" | "Twitter";
          subject?: string | null;
          last_message?: string | null;
          priority?: "high" | "medium" | "low";
          ai_score?: number;
          unread?: boolean;
          status?: "open" | "replied" | "closed";
          created_at?: string;
          updated_at?: string;
        };
      };
      messages: {
        Row: {
          id: string;
          inquiry_id: string;
          sender: "customer" | "ai" | "user";
          text: string;
          subject: string | null;
          ai_generated: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          inquiry_id: string;
          sender: "customer" | "ai" | "user";
          text: string;
          subject?: string | null;
          ai_generated?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          inquiry_id?: string;
          sender?: "customer" | "ai" | "user";
          text?: string;
          subject?: string | null;
          ai_generated?: boolean;
          created_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// Convenience type aliases
export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type InsertTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type UpdateTables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
