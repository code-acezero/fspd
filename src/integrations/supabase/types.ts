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
      course_registrations: {
        Row: {
          course_id: string
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string
          phone: string
          status: string
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string
          phone?: string
          status?: string
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string
          phone?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          cover_image: string
          created_at: string
          created_by: string | null
          date: string
          description: string
          id: string
          location: string
          tag: string
          tag_color: string
          time: string
          title: string
          title_en: string
        }
        Insert: {
          cover_image?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          location?: string
          tag?: string
          tag_color?: string
          time?: string
          title: string
          title_en?: string
        }
        Update: {
          cover_image?: string
          created_at?: string
          created_by?: string | null
          date?: string
          description?: string
          id?: string
          location?: string
          tag?: string
          tag_color?: string
          time?: string
          title?: string
          title_en?: string
        }
        Relationships: []
      }
      members: {
        Row: {
          avatar_url: string
          bio: string
          bio_en: string
          created_at: string
          created_by: string | null
          gradient_class: string
          id: string
          is_active: boolean
          is_approved: boolean
          is_senior: boolean
          name: string
          name_en: string
          role: string
          sort_order: number
          title: string
          title_en: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          avatar_url?: string
          bio?: string
          bio_en?: string
          created_at?: string
          created_by?: string | null
          gradient_class?: string
          id?: string
          is_active?: boolean
          is_approved?: boolean
          is_senior?: boolean
          name?: string
          name_en?: string
          role?: string
          sort_order?: number
          title?: string
          title_en?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          avatar_url?: string
          bio?: string
          bio_en?: string
          created_at?: string
          created_by?: string | null
          gradient_class?: string
          id?: string
          is_active?: boolean
          is_approved?: boolean
          is_senior?: boolean
          name?: string
          name_en?: string
          role?: string
          sort_order?: number
          title?: string
          title_en?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      posts: {
        Row: {
          approval_status: string
          author_id: string | null
          category: string
          content: string
          cover_image: string
          created_at: string
          excerpt: string
          excerpt_en: string
          featured: boolean
          id: string
          images: string[]
          published: boolean
          tags: string[]
          title: string
          title_en: string
          updated_at: string
          youtube_url: string
        }
        Insert: {
          approval_status?: string
          author_id?: string | null
          category?: string
          content?: string
          cover_image?: string
          created_at?: string
          excerpt?: string
          excerpt_en?: string
          featured?: boolean
          id?: string
          images?: string[]
          published?: boolean
          tags?: string[]
          title: string
          title_en?: string
          updated_at?: string
          youtube_url?: string
        }
        Update: {
          approval_status?: string
          author_id?: string | null
          category?: string
          content?: string
          cover_image?: string
          created_at?: string
          excerpt?: string
          excerpt_en?: string
          featured?: boolean
          id?: string
          images?: string[]
          published?: boolean
          tags?: string[]
          title?: string
          title_en?: string
          updated_at?: string
          youtube_url?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string
          bio: string
          created_at: string
          display_name: string
          full_name: string
          gradient_class: string
          id: string
          is_senior: boolean
          phone: string
          position: string
          position_en: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string
          bio?: string
          created_at?: string
          display_name?: string
          full_name?: string
          gradient_class?: string
          id: string
          is_senior?: boolean
          phone?: string
          position?: string
          position_en?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string
          bio?: string
          created_at?: string
          display_name?: string
          full_name?: string
          gradient_class?: string
          id?: string
          is_senior?: boolean
          phone?: string
          position?: string
          position_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_assets: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          image_url: string
          is_active: boolean
          name: string
          slot: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url: string
          is_active?: boolean
          name?: string
          slot?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string
          is_active?: boolean
          name?: string
          slot?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      site_settings_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          setting_key: string
          value: Json
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          setting_key: string
          value: Json
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          setting_key?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
