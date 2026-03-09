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
      ad_slots: {
        Row: {
          ad_code: string | null
          clicks: number
          created_at: string
          id: string
          image_url: string | null
          impressions: number
          is_active: boolean
          link_url: string | null
          name: string
          platform: string | null
          position: string
          slot_type: string
          updated_at: string
        }
        Insert: {
          ad_code?: string | null
          clicks?: number
          created_at?: string
          id?: string
          image_url?: string | null
          impressions?: number
          is_active?: boolean
          link_url?: string | null
          name: string
          platform?: string | null
          position: string
          slot_type?: string
          updated_at?: string
        }
        Update: {
          ad_code?: string | null
          clicks?: number
          created_at?: string
          id?: string
          image_url?: string | null
          impressions?: number
          is_active?: boolean
          link_url?: string | null
          name?: string
          platform?: string | null
          position?: string
          slot_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      daily_goals: {
        Row: {
          completed: boolean | null
          created_at: string
          date: string
          goal_key: string
          id: string
          progress: number | null
          target: number | null
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          created_at?: string
          date: string
          goal_key: string
          id?: string
          progress?: number | null
          target?: number | null
          user_id: string
        }
        Update: {
          completed?: boolean | null
          created_at?: string
          date?: string
          goal_key?: string
          id?: string
          progress?: number | null
          target?: number | null
          user_id?: string
        }
        Relationships: []
      }
      favorite_duas: {
        Row: {
          arabic: string
          context: string
          count: number
          created_at: string
          id: string
          reference: string
          user_id: string
        }
        Insert: {
          arabic: string
          context?: string
          count?: number
          created_at?: string
          id?: string
          reference?: string
          user_id: string
        }
        Update: {
          arabic?: string
          context?: string
          count?: number
          created_at?: string
          id?: string
          reference?: string
          user_id?: string
        }
        Relationships: []
      }
      mosque_time_adjustments: {
        Row: {
          asr_diff: number | null
          base_asr: string | null
          base_dhuhr: string | null
          base_fajr: string | null
          base_isha: string | null
          base_maghrib: string | null
          base_sunrise: string | null
          created_at: string
          dhuhr_diff: number | null
          fajr_diff: number | null
          has_auto_sync: boolean | null
          id: string
          isha_diff: number | null
          jumuah: string | null
          maghrib_diff: number | null
          mosque_id: string
          sunrise_diff: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asr_diff?: number | null
          base_asr?: string | null
          base_dhuhr?: string | null
          base_fajr?: string | null
          base_isha?: string | null
          base_maghrib?: string | null
          base_sunrise?: string | null
          created_at?: string
          dhuhr_diff?: number | null
          fajr_diff?: number | null
          has_auto_sync?: boolean | null
          id?: string
          isha_diff?: number | null
          jumuah?: string | null
          maghrib_diff?: number | null
          mosque_id: string
          sunrise_diff?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asr_diff?: number | null
          base_asr?: string | null
          base_dhuhr?: string | null
          base_fajr?: string | null
          base_isha?: string | null
          base_maghrib?: string | null
          base_sunrise?: string | null
          created_at?: string
          dhuhr_diff?: number | null
          fajr_diff?: number | null
          has_auto_sync?: boolean | null
          id?: string
          isha_diff?: number | null
          jumuah?: string | null
          maghrib_diff?: number | null
          mosque_id?: string
          sunrise_diff?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mosque_time_adjustments_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
      mosques: {
        Row: {
          address: string | null
          city: string | null
          created_at: string
          id: string
          latitude: number
          longitude: number
          name: string
          osm_id: string | null
        }
        Insert: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          latitude: number
          longitude: number
          name: string
          osm_id?: string | null
        }
        Update: {
          address?: string | null
          city?: string | null
          created_at?: string
          id?: string
          latitude?: number
          longitude?: number
          name?: string
          osm_id?: string | null
        }
        Relationships: []
      }
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
      ramadan_challenge: {
        Row: {
          created_at: string
          day_number: number
          deed_completed: boolean | null
          fasting_completed: boolean | null
          id: string
          user_id: string
          year: number
        }
        Insert: {
          created_at?: string
          day_number: number
          deed_completed?: boolean | null
          fasting_completed?: boolean | null
          id?: string
          user_id: string
          year: number
        }
        Update: {
          created_at?: string
          day_number?: number
          deed_completed?: boolean | null
          fasting_completed?: boolean | null
          id?: string
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
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
      user_mosque_times: {
        Row: {
          asr: string | null
          date: string
          dhuhr: string | null
          fajr: string | null
          id: string
          isha: string | null
          jumuah: string | null
          maghrib: string | null
          mosque_id: string
          sunrise: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          asr?: string | null
          date?: string
          dhuhr?: string | null
          fajr?: string | null
          id?: string
          isha?: string | null
          jumuah?: string | null
          maghrib?: string | null
          mosque_id: string
          sunrise?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          asr?: string | null
          date?: string
          dhuhr?: string | null
          fajr?: string | null
          id?: string
          isha?: string | null
          jumuah?: string | null
          maghrib?: string | null
          mosque_id?: string
          sunrise?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_mosque_times_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_selected_mosque: {
        Row: {
          created_at: string
          id: string
          mosque_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mosque_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          mosque_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_selected_mosque_mosque_id_fkey"
            columns: ["mosque_id"]
            isOneToOne: false
            referencedRelation: "mosques"
            referencedColumns: ["id"]
          },
        ]
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      track_ad_click: { Args: { _ad_id: string }; Returns: undefined }
      track_ad_impression: { Args: { _ad_id: string }; Returns: undefined }
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
