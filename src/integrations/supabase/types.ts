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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      prayer_tracking: {
        Row: {
          created_at: string
          date: string
          id: string
          prayers_completed: string[] | null
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          prayers_completed?: string[] | null
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          prayers_completed?: string[] | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          calculation_method: number | null
          created_at: string
          dark_mode: boolean | null
          display_name: string | null
          id: string
          language: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          calculation_method?: number | null
          created_at?: string
          dark_mode?: boolean | null
          display_name?: string | null
          id?: string
          language?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          calculation_method?: number | null
          created_at?: string
          dark_mode?: boolean | null
          display_name?: string | null
          id?: string
          language?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      quran_bookmarks: {
        Row: {
          ayah_number: number | null
          created_at: string
          id: string
          surah_number: number
          user_id: string
        }
        Insert: {
          ayah_number?: number | null
          created_at?: string
          id?: string
          surah_number: number
          user_id: string
        }
        Update: {
          ayah_number?: number | null
          created_at?: string
          id?: string
          surah_number?: number
          user_id?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          author_name: string
          category: string
          comments_count: number
          content: string
          created_at: string
          id: string
          likes_count: number
          title: string
          user_id: string
        }
        Insert: {
          author_name?: string
          category: string
          comments_count?: number
          content: string
          created_at?: string
          id?: string
          likes_count?: number
          title: string
          user_id: string
        }
        Update: {
          author_name?: string
          category?: string
          comments_count?: number
          content?: string
          created_at?: string
          id?: string
          likes_count?: number
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      story_comments: {
        Row: {
          author_name: string
          content: string
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          author_name?: string
          content: string
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          author_name?: string
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      story_likes: {
        Row: {
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_likes_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      tasbeeh_counts: {
        Row: {
          count: number
          created_at: string
          date: string
          dhikr_key: string
          id: string
          total: number
          user_id: string
        }
        Insert: {
          count?: number
          created_at?: string
          date?: string
          dhikr_key: string
          id?: string
          total?: number
          user_id: string
        }
        Update: {
          count?: number
          created_at?: string
          date?: string
          dhikr_key?: string
          id?: string
          total?: number
          user_id?: string
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
