export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      customers: {
        Row: {
          ai_score: number | null
          channels: string[] | null
          company: string | null
          country: string | null
          created_at: string
          email: string | null
          id: string
          last_contact_at: string | null
          name: string
          notes: string | null
          phone: string | null
          status: string | null
          tags: string[] | null
          tier: string | null
          total_orders: number | null
          total_value: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_score?: number | null
          channels?: string[] | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          tags?: string[] | null
          tier?: string | null
          total_orders?: number | null
          total_value?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_score?: number | null
          channels?: string[] | null
          company?: string | null
          country?: string | null
          created_at?: string
          email?: string | null
          id?: string
          last_contact_at?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          status?: string | null
          tags?: string[] | null
          tier?: string | null
          total_orders?: number | null
          total_value?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          ai_score: number | null
          avatar: string | null
          channel: string | null
          company: string | null
          created_at: string
          customer_id: string | null
          email: string | null
          id: string
          last_message: string | null
          name: string
          priority: string | null
          status: string | null
          subject: string | null
          unread: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_score?: number | null
          avatar?: string | null
          channel?: string | null
          company?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          last_message?: string | null
          name: string
          priority?: string | null
          status?: string | null
          subject?: string | null
          unread?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_score?: number | null
          avatar?: string | null
          channel?: string | null
          company?: string | null
          created_at?: string
          customer_id?: string | null
          email?: string | null
          id?: string
          last_message?: string | null
          name?: string
          priority?: string | null
          status?: string | null
          subject?: string | null
          unread?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inquiries_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          ai_generated: boolean | null
          created_at: string
          id: string
          inquiry_id: string
          sender: string
          subject: string | null
          text: string
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string
          id?: string
          inquiry_id: string
          sender: string
          subject?: string | null
          text: string
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string
          id?: string
          inquiry_id?: string
          sender?: string
          subject?: string | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      product_docs: {
        Row: {
          file_size: string | null
          id: string
          name: string
          product_id: string
          sort_order: number | null
          url: string | null
        }
        Insert: {
          file_size?: string | null
          id?: string
          name: string
          product_id: string
          sort_order?: number | null
          url?: string | null
        }
        Update: {
          file_size?: string | null
          id?: string
          name?: string
          product_id?: string
          sort_order?: number | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_docs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          id: string
          product_id: string
          sort_order: number | null
          url: string
        }
        Insert: {
          id?: string
          product_id: string
          sort_order?: number | null
          url: string
        }
        Update: {
          id?: string
          product_id?: string
          sort_order?: number | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_specs: {
        Row: {
          id: string
          label: string
          product_id: string
          sort_order: number | null
          value: string
        }
        Insert: {
          id?: string
          label: string
          product_id: string
          sort_order?: number | null
          value: string
        }
        Update: {
          id?: string
          label?: string
          product_id?: string
          sort_order?: number | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_specs_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          currency: string | null
          description: string | null
          factory_certs: string[] | null
          factory_name: string | null
          factory_rating: number | null
          has_bot: boolean | null
          id: string
          image_url: string | null
          inquiries_count: number | null
          moq: string | null
          name: string
          price: number | null
          sku: string | null
          status: string | null
          stock: string | null
          updated_at: string
          user_id: string
          views: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          factory_certs?: string[] | null
          factory_name?: string | null
          factory_rating?: number | null
          has_bot?: boolean | null
          id?: string
          image_url?: string | null
          inquiries_count?: number | null
          moq?: string | null
          name: string
          price?: number | null
          sku?: string | null
          status?: string | null
          stock?: string | null
          updated_at?: string
          user_id: string
          views?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          factory_certs?: string[] | null
          factory_name?: string | null
          factory_rating?: number | null
          has_bot?: boolean | null
          id?: string
          image_url?: string | null
          inquiries_count?: number | null
          moq?: string | null
          name?: string
          price?: number | null
          sku?: string | null
          status?: string | null
          stock?: string | null
          updated_at?: string
          user_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company_name: string | null
          created_at: string
          full_name: string | null
          google_api_key: string | null
          google_model: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          google_api_key?: string | null
          google_model?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company_name?: string | null
          created_at?: string
          full_name?: string | null
          google_api_key?: string | null
          google_model?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
