export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      activity_feed: {
        Row: {
          created_at: string
          description: string
          event_type: Database["public"]["Enums"]["activity_event_type"]
          id: string
          league_id: string
          player_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          description: string
          event_type: Database["public"]["Enums"]["activity_event_type"]
          id?: string
          league_id: string
          player_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          event_type?: Database["public"]["Enums"]["activity_event_type"]
          id?: string
          league_id?: string
          player_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_feed_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_feed_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          id: string
          league_id: string
          message: string
          sent_at: string
          user_id: string
        }
        Insert: {
          id?: string
          league_id: string
          message: string
          sent_at?: string
          user_id: string
        }
        Update: {
          id?: string
          league_id?: string
          message?: string
          sent_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_picks: {
        Row: {
          draft_window: Database["public"]["Enums"]["draft_window_type"]
          id: string
          is_auto_pick: boolean
          is_starting_xi: boolean
          league_id: string
          pick_number: number
          picked_at: string
          player_id: string
          round: number
          user_id: string
        }
        Insert: {
          draft_window?: Database["public"]["Enums"]["draft_window_type"]
          id?: string
          is_auto_pick?: boolean
          is_starting_xi?: boolean
          league_id: string
          pick_number: number
          picked_at?: string
          player_id: string
          round: number
          user_id: string
        }
        Update: {
          draft_window?: Database["public"]["Enums"]["draft_window_type"]
          id?: string
          is_auto_pick?: boolean
          is_starting_xi?: boolean
          league_id?: string
          pick_number?: number
          picked_at?: string
          player_id?: string
          round?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "draft_picks_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "draft_picks_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      draft_windows: {
        Row: {
          closes_at: string | null
          current_pick_deadline: string | null
          id: string
          league_id: string
          opens_at: string | null
          status: Database["public"]["Enums"]["draft_window_status"]
          window_type: Database["public"]["Enums"]["draft_window_type"]
        }
        Insert: {
          closes_at?: string | null
          current_pick_deadline?: string | null
          id?: string
          league_id: string
          opens_at?: string | null
          status?: Database["public"]["Enums"]["draft_window_status"]
          window_type: Database["public"]["Enums"]["draft_window_type"]
        }
        Update: {
          closes_at?: string | null
          current_pick_deadline?: string | null
          id?: string
          league_id?: string
          opens_at?: string | null
          status?: Database["public"]["Enums"]["draft_window_status"]
          window_type?: Database["public"]["Enums"]["draft_window_type"]
        }
        Relationships: [
          {
            foreignKeyName: "draft_windows_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      league_members: {
        Row: {
          display_name: string
          formation: Database["public"]["Enums"]["formation_type"]
          id: string
          joined_at: string
          league_id: string
          user_id: string
        }
        Insert: {
          display_name: string
          formation?: Database["public"]["Enums"]["formation_type"]
          id?: string
          joined_at?: string
          league_id: string
          user_id: string
        }
        Update: {
          display_name?: string
          formation?: Database["public"]["Enums"]["formation_type"]
          id?: string
          joined_at?: string
          league_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "league_members_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      leagues: {
        Row: {
          created_at: string
          created_by: string
          current_stage: string
          draft_active_end: number
          draft_active_start: number
          draft_order: Json | null
          draft_pick_window_minutes: number
          draft_reminder_sent: boolean
          draft_start_time: string | null
          draft_status: Database["public"]["Enums"]["draft_status_type"]
          id: string
          invite_code: string
          name: string
        }
        Insert: {
          created_at?: string
          created_by: string
          current_stage?: string
          draft_active_end?: number
          draft_active_start?: number
          draft_order?: Json | null
          draft_pick_window_minutes?: number
          draft_reminder_sent?: boolean
          draft_start_time?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status_type"]
          id?: string
          invite_code: string
          name: string
        }
        Update: {
          created_at?: string
          created_by?: string
          current_stage?: string
          draft_active_end?: number
          draft_active_start?: number
          draft_order?: Json | null
          draft_pick_window_minutes?: number
          draft_reminder_sent?: boolean
          draft_start_time?: string | null
          draft_status?: Database["public"]["Enums"]["draft_status_type"]
          id?: string
          invite_code?: string
          name?: string
        }
        Relationships: []
      }
      match_events: {
        Row: {
          event_type: Database["public"]["Enums"]["match_event_type"]
          id: string
          match_date: string
          match_id: string
          minute: number | null
          player_id: string
          points_awarded: number
        }
        Insert: {
          event_type: Database["public"]["Enums"]["match_event_type"]
          id?: string
          match_date: string
          match_id: string
          minute?: number | null
          player_id: string
          points_awarded?: number
        }
        Update: {
          event_type?: Database["public"]["Enums"]["match_event_type"]
          id?: string
          match_date?: string
          match_id?: string
          minute?: number | null
          player_id?: string
          points_awarded?: number
        }
        Relationships: [
          {
            foreignKeyName: "match_events_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      players: {
        Row: {
          api_football_id: number | null
          eliminated_at: string | null
          id: string
          is_eliminated: boolean
          name: string
          nation: string
          nation_flag_url: string | null
          position: Database["public"]["Enums"]["player_position"]
        }
        Insert: {
          api_football_id?: number | null
          eliminated_at?: string | null
          id?: string
          is_eliminated?: boolean
          name: string
          nation: string
          nation_flag_url?: string | null
          position: Database["public"]["Enums"]["player_position"]
        }
        Update: {
          api_football_id?: number | null
          eliminated_at?: string | null
          id?: string
          is_eliminated?: boolean
          name?: string
          nation?: string
          nation_flag_url?: string | null
          position?: Database["public"]["Enums"]["player_position"]
        }
        Relationships: []
      }
      scores: {
        Row: {
          id: string
          league_id: string
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          league_id: string
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          league_id?: string
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "scores_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      squad_slots: {
        Row: {
          id: string
          is_starting: boolean
          league_id: string
          player_id: string
          position: Database["public"]["Enums"]["player_position"]
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          is_starting?: boolean
          league_id: string
          player_id: string
          position: Database["public"]["Enums"]["player_position"]
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          is_starting?: boolean
          league_id?: string
          player_id?: string
          position?: Database["public"]["Enums"]["player_position"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "squad_slots_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "squad_slots_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
      transfers: {
        Row: {
          draft_window: Database["public"]["Enums"]["draft_window_type"]
          dropped_player_id: string
          id: string
          is_auto_pick: boolean
          league_id: string
          picked_player_id: string
          transferred_at: string
          user_id: string
        }
        Insert: {
          draft_window: Database["public"]["Enums"]["draft_window_type"]
          dropped_player_id: string
          id?: string
          is_auto_pick?: boolean
          league_id: string
          picked_player_id: string
          transferred_at?: string
          user_id: string
        }
        Update: {
          draft_window?: Database["public"]["Enums"]["draft_window_type"]
          dropped_player_id?: string
          id?: string
          is_auto_pick?: boolean
          league_id?: string
          picked_player_id?: string
          transferred_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transfers_dropped_player_id_fkey"
            columns: ["dropped_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "leagues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transfers_picked_player_id_fkey"
            columns: ["picked_player_id"]
            isOneToOne: false
            referencedRelation: "players"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      activity_event_type:
        | "draft_pick"
        | "transfer"
        | "formation_change"
        | "scoring_event"
        | "auto_pick"
        | "league_joined"
      draft_status_type: "pre_draft" | "in_progress" | "completed"
      draft_window_status: "pending" | "active" | "complete"
      draft_window_type:
        | "initial"
        | "post_groups"
        | "post_r32"
        | "post_r16"
        | "post_qf"
        | "post_sf"
      formation_type: "4-4-2" | "4-3-3" | "4-5-1"
      match_event_type:
        | "goal"
        | "assist"
        | "clean_sheet"
        | "own_goal"
        | "yellow"
        | "red"
        | "appearance_full"
        | "appearance_sub"
      player_position: "GK" | "DEF" | "MID" | "ATT"
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
      activity_event_type: [
        "draft_pick",
        "transfer",
        "formation_change",
        "scoring_event",
        "auto_pick",
        "league_joined",
      ],
      draft_status_type: ["pre_draft", "in_progress", "completed"],
      draft_window_status: ["pending", "active", "complete"],
      draft_window_type: [
        "initial",
        "post_groups",
        "post_r32",
        "post_r16",
        "post_qf",
        "post_sf",
      ],
      formation_type: ["4-4-2", "4-3-3", "4-5-1"],
      match_event_type: [
        "goal",
        "assist",
        "clean_sheet",
        "own_goal",
        "yellow",
        "red",
        "appearance_full",
        "appearance_sub",
      ],
      player_position: ["GK", "DEF", "MID", "ATT"],
    },
  },
} as const
