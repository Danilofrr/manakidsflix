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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      banners: {
        Row: {
          active: boolean
          badge: string | null
          created_at: string
          cta_primary: string
          cta_secondary: string
          description: string | null
          id: string
          image: string | null
          sort_order: number
          title: string
          title_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          badge?: string | null
          created_at?: string
          cta_primary?: string
          cta_secondary?: string
          description?: string | null
          id?: string
          image?: string | null
          sort_order?: number
          title: string
          title_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          badge?: string | null
          created_at?: string
          cta_primary?: string
          cta_secondary?: string
          description?: string | null
          id?: string
          image?: string | null
          sort_order?: number
          title?: string
          title_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "banners_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          label: string
          sort_order: number
          tone: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          tone?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          tone?: string
          updated_at?: string
        }
        Relationships: []
      }
      episodes: {
        Row: {
          cover: string | null
          created_at: string
          duration: string | null
          external_video_id: string | null
          hls_url: string | null
          id: string
          name: string
          number: number
          published: boolean
          release_date: string | null
          season_id: string
          sort_order: number
          status: string
          summary: string | null
          updated_at: string
          video_asset_id: string | null
          video_source: string
          video_url: string | null
          views: number
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          cover?: string | null
          created_at?: string
          duration?: string | null
          external_video_id?: string | null
          hls_url?: string | null
          id?: string
          name: string
          number?: number
          published?: boolean
          release_date?: string | null
          season_id: string
          sort_order?: number
          status?: string
          summary?: string | null
          updated_at?: string
          video_asset_id?: string | null
          video_source?: string
          video_url?: string | null
          views?: number
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          cover?: string | null
          created_at?: string
          duration?: string | null
          external_video_id?: string | null
          hls_url?: string | null
          id?: string
          name?: string
          number?: number
          published?: boolean
          release_date?: string | null
          season_id?: string
          sort_order?: number
          status?: string
          summary?: string | null
          updated_at?: string
          video_asset_id?: string | null
          video_source?: string
          video_url?: string | null
          views?: number
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "episodes_video_asset_id_fkey"
            columns: ["video_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          badge: string | null
          classification: string | null
          created_at: string
          cta_primary: string
          cta_secondary: string
          description: string | null
          duration: string | null
          id: string
          image_desktop: string | null
          image_mobile: string | null
          logo: string | null
          media_type: string
          published: boolean
          slide_seconds: number
          sort_order: number
          title: string
          title_id: string | null
          updated_at: string
          video_asset_id: string | null
          video_url: string | null
          year: number | null
        }
        Insert: {
          badge?: string | null
          classification?: string | null
          created_at?: string
          cta_primary?: string
          cta_secondary?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_desktop?: string | null
          image_mobile?: string | null
          logo?: string | null
          media_type?: string
          published?: boolean
          slide_seconds?: number
          sort_order?: number
          title: string
          title_id?: string | null
          updated_at?: string
          video_asset_id?: string | null
          video_url?: string | null
          year?: number | null
        }
        Update: {
          badge?: string | null
          classification?: string | null
          created_at?: string
          cta_primary?: string
          cta_secondary?: string
          description?: string | null
          duration?: string | null
          id?: string
          image_desktop?: string | null
          image_mobile?: string | null
          logo?: string | null
          media_type?: string
          published?: boolean
          slide_seconds?: number
          sort_order?: number
          title?: string
          title_id?: string | null
          updated_at?: string
          video_asset_id?: string | null
          video_url?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "hero_slides_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hero_slides_video_asset_id_fkey"
            columns: ["video_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      home_section_items: {
        Row: {
          id: string
          section_id: string
          sort_order: number
          title_id: string
        }
        Insert: {
          id?: string
          section_id: string
          sort_order?: number
          title_id: string
        }
        Update: {
          id?: string
          section_id?: string
          sort_order?: number
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "home_section_items_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "home_sections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "home_section_items_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      home_sections: {
        Row: {
          category_id: string | null
          created_at: string
          id: string
          kind: string
          limit_count: number
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
          visible: boolean
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          limit_count?: number
          sort_order?: number
          subtitle?: string | null
          title: string
          updated_at?: string
          visible?: boolean
        }
        Update: {
          category_id?: string | null
          created_at?: string
          id?: string
          kind?: string
          limit_count?: number
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
          visible?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "home_sections_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      media_assets: {
        Row: {
          created_at: string
          created_by: string | null
          duration_seconds: number | null
          folder: string
          height: number | null
          id: string
          kind: string
          mime_type: string | null
          name: string
          provider: string | null
          provider_id: string | null
          size_bytes: number | null
          status: string
          storage_path: string | null
          thumbnail_url: string | null
          updated_at: string
          url: string
          width: number | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          folder?: string
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string | null
          name: string
          provider?: string | null
          provider_id?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          url: string
          width?: number | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duration_seconds?: number | null
          folder?: string
          height?: number | null
          id?: string
          kind?: string
          mime_type?: string | null
          name?: string
          provider?: string | null
          provider_id?: string | null
          size_bytes?: number | null
          status?: string
          storage_path?: string | null
          thumbnail_url?: string | null
          updated_at?: string
          url?: string
          width?: number | null
        }
        Relationships: []
      }
      plans: {
        Row: {
          active: boolean
          benefits: string[]
          created_at: string
          id: string
          name: string
          period: string
          price_cents: number
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          benefits?: string[]
          created_at?: string
          id?: string
          name: string
          period?: string
          price_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          benefits?: string[]
          created_at?: string
          id?: string
          name?: string
          period?: string
          price_cents?: number
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          email: string | null
          id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          email?: string | null
          id?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          created_at: string
          id: string
          name: string | null
          number: number
          title_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name?: string | null
          number?: number
          title_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string | null
          number?: number
          title_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasons_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          brand: Json
          id: string
          texts: Json
          updated_at: string
        }
        Insert: {
          brand?: Json
          id?: string
          texts?: Json
          updated_at?: string
        }
        Update: {
          brand?: Json
          id?: string
          texts?: Json
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount_cents: number
          created_at: string
          current_period_end: string | null
          id: string
          last_seen_at: string | null
          plan: string
          plan_id: string | null
          started_at: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_cents?: number
          created_at?: string
          current_period_end?: string | null
          id?: string
          last_seen_at?: string | null
          plan?: string
          plan_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_cents?: number
          created_at?: string
          current_period_end?: string | null
          id?: string
          last_seen_at?: string | null
          plan?: string
          plan_id?: string | null
          started_at?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      title_categories: {
        Row: {
          category_id: string
          title_id: string
        }
        Insert: {
          category_id: string
          title_id: string
        }
        Update: {
          category_id?: string
          title_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "title_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "title_categories_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      titles: {
        Row: {
          age_range: string | null
          banner: string | null
          captions_enabled: boolean
          classification: string | null
          cover: string | null
          created_at: string
          description: string | null
          duration: string | null
          external_video_id: string | null
          featured: boolean
          hls_url: string | null
          id: string
          is_new: boolean
          kind: string
          logo: string | null
          published: boolean
          published_at: string | null
          show_on_home: boolean
          slug: string
          sort_order: number
          status: string
          summary: string | null
          tags: string[]
          thumbnail: string | null
          title: string
          trailer_external_id: string | null
          trailer_hls_url: string | null
          trailer_source: string
          trailer_url: string | null
          trailer_youtube_id: string | null
          trailer_youtube_url: string | null
          updated_at: string
          verse: string | null
          video_asset_id: string | null
          video_source: string
          video_url: string | null
          views: number
          year: number | null
          youtube_url: string | null
          youtube_video_id: string | null
        }
        Insert: {
          age_range?: string | null
          banner?: string | null
          captions_enabled?: boolean
          classification?: string | null
          cover?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          external_video_id?: string | null
          featured?: boolean
          hls_url?: string | null
          id?: string
          is_new?: boolean
          kind?: string
          logo?: string | null
          published?: boolean
          published_at?: string | null
          show_on_home?: boolean
          slug: string
          sort_order?: number
          status?: string
          summary?: string | null
          tags?: string[]
          thumbnail?: string | null
          title: string
          trailer_external_id?: string | null
          trailer_hls_url?: string | null
          trailer_source?: string
          trailer_url?: string | null
          trailer_youtube_id?: string | null
          trailer_youtube_url?: string | null
          updated_at?: string
          verse?: string | null
          video_asset_id?: string | null
          video_source?: string
          video_url?: string | null
          views?: number
          year?: number | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Update: {
          age_range?: string | null
          banner?: string | null
          captions_enabled?: boolean
          classification?: string | null
          cover?: string | null
          created_at?: string
          description?: string | null
          duration?: string | null
          external_video_id?: string | null
          featured?: boolean
          hls_url?: string | null
          id?: string
          is_new?: boolean
          kind?: string
          logo?: string | null
          published?: boolean
          published_at?: string | null
          show_on_home?: boolean
          slug?: string
          sort_order?: number
          status?: string
          summary?: string | null
          tags?: string[]
          thumbnail?: string | null
          title?: string
          trailer_external_id?: string | null
          trailer_hls_url?: string | null
          trailer_source?: string
          trailer_url?: string | null
          trailer_youtube_id?: string | null
          trailer_youtube_url?: string | null
          updated_at?: string
          verse?: string | null
          video_asset_id?: string | null
          video_source?: string
          video_url?: string | null
          views?: number
          year?: number | null
          youtube_url?: string | null
          youtube_video_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "titles_video_asset_id_fkey"
            columns: ["video_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      video_subtitles: {
        Row: {
          created_at: string
          episode_id: string | null
          format: string
          id: string
          is_default: boolean
          kind: string
          language_code: string
          language_name: string
          sort_order: number
          subtitle_url: string
          title_id: string | null
        }
        Insert: {
          created_at?: string
          episode_id?: string | null
          format?: string
          id?: string
          is_default?: boolean
          kind?: string
          language_code: string
          language_name: string
          sort_order?: number
          subtitle_url: string
          title_id?: string | null
        }
        Update: {
          created_at?: string
          episode_id?: string | null
          format?: string
          id?: string
          is_default?: boolean
          kind?: string
          language_code?: string
          language_name?: string
          sort_order?: number
          subtitle_url?: string
          title_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_subtitles_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_subtitles_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
            referencedColumns: ["id"]
          },
        ]
      }
      watch_progress: {
        Row: {
          completed: boolean
          created_at: string
          duration_seconds: number
          episode_id: string | null
          id: string
          position_seconds: number
          profile_key: string
          title_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          completed?: boolean
          created_at?: string
          duration_seconds?: number
          episode_id?: string | null
          id?: string
          position_seconds?: number
          profile_key?: string
          title_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          completed?: boolean
          created_at?: string
          duration_seconds?: number
          episode_id?: string | null
          id?: string
          position_seconds?: number
          profile_key?: string
          title_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "watch_progress_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "watch_progress_title_id_fkey"
            columns: ["title_id"]
            isOneToOne: false
            referencedRelation: "titles"
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
    }
    Enums: {
      app_role: "admin" | "cliente"
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
      app_role: ["admin", "cliente"],
    },
  },
} as const
