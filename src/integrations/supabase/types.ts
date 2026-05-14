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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      alerts: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          message: string | null
          read: boolean
          severity: Database["public"]["Enums"]["alert_severity"]
          title: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          message?: string | null
          read?: boolean
          severity?: Database["public"]["Enums"]["alert_severity"]
          title: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          message?: string | null
          read?: boolean
          severity?: Database["public"]["Enums"]["alert_severity"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "alerts_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      animals: {
        Row: {
          birth_date: string | null
          breed: string | null
          created_at: string
          current_weight_kg: number | null
          entry_date: string
          farm_id: string
          id: string
          lot: string | null
          name: string | null
          notes: string | null
          origin: string | null
          photo_url: string | null
          sex: Database["public"]["Enums"]["animal_sex"]
          status: Database["public"]["Enums"]["animal_status"]
          tag: string
          updated_at: string
        }
        Insert: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          current_weight_kg?: number | null
          entry_date?: string
          farm_id: string
          id?: string
          lot?: string | null
          name?: string | null
          notes?: string | null
          origin?: string | null
          photo_url?: string | null
          sex?: Database["public"]["Enums"]["animal_sex"]
          status?: Database["public"]["Enums"]["animal_status"]
          tag: string
          updated_at?: string
        }
        Update: {
          birth_date?: string | null
          breed?: string | null
          created_at?: string
          current_weight_kg?: number | null
          entry_date?: string
          farm_id?: string
          id?: string
          lot?: string | null
          name?: string | null
          notes?: string | null
          origin?: string | null
          photo_url?: string | null
          sex?: Database["public"]["Enums"]["animal_sex"]
          status?: Database["public"]["Enums"]["animal_status"]
          tag?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "animals_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string
          cost: number | null
          created_at: string
          dose: string | null
          farm_id: string
          id: string
          kind: Database["public"]["Enums"]["application_kind"]
          notes: string | null
          plot_id: string | null
          product: string
          quantity: number | null
          season_id: string | null
          unit: string | null
        }
        Insert: {
          applied_at?: string
          cost?: number | null
          created_at?: string
          dose?: string | null
          farm_id: string
          id?: string
          kind: Database["public"]["Enums"]["application_kind"]
          notes?: string | null
          plot_id?: string | null
          product: string
          quantity?: number | null
          season_id?: string | null
          unit?: string | null
        }
        Update: {
          applied_at?: string
          cost?: number | null
          created_at?: string
          dose?: string | null
          farm_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["application_kind"]
          notes?: string | null
          plot_id?: string | null
          product?: string
          quantity?: number | null
          season_id?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "crop_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      crop_seasons: {
        Row: {
          area_ha: number | null
          created_at: string
          crop: Database["public"]["Enums"]["crop_kind"]
          expected_harvest_at: string | null
          farm_id: string
          harvested_at: string | null
          id: string
          name: string
          notes: string | null
          planted_at: string | null
          plot_id: string | null
          status: Database["public"]["Enums"]["season_status"]
          updated_at: string
          variety: string | null
        }
        Insert: {
          area_ha?: number | null
          created_at?: string
          crop: Database["public"]["Enums"]["crop_kind"]
          expected_harvest_at?: string | null
          farm_id: string
          harvested_at?: string | null
          id?: string
          name: string
          notes?: string | null
          planted_at?: string | null
          plot_id?: string | null
          status?: Database["public"]["Enums"]["season_status"]
          updated_at?: string
          variety?: string | null
        }
        Update: {
          area_ha?: number | null
          created_at?: string
          crop?: Database["public"]["Enums"]["crop_kind"]
          expected_harvest_at?: string | null
          farm_id?: string
          harvested_at?: string | null
          id?: string
          name?: string
          notes?: string | null
          planted_at?: string | null
          plot_id?: string | null
          status?: Database["public"]["Enums"]["season_status"]
          updated_at?: string
          variety?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crop_seasons_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crop_seasons_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_members: {
        Row: {
          created_at: string
          farm_id: string
          id: string
          role: Database["public"]["Enums"]["farm_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          farm_id: string
          id?: string
          role?: Database["public"]["Enums"]["farm_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          farm_id?: string
          id?: string
          role?: Database["public"]["Enums"]["farm_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_members_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          area_ha: number | null
          city: string | null
          created_at: string
          created_by: string
          id: string
          name: string
          segments: Database["public"]["Enums"]["farm_segment"][]
          state: string | null
          updated_at: string
        }
        Insert: {
          area_ha?: number | null
          city?: string | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          segments?: Database["public"]["Enums"]["farm_segment"][]
          state?: string | null
          updated_at?: string
        }
        Update: {
          area_ha?: number | null
          city?: string | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          segments?: Database["public"]["Enums"]["farm_segment"][]
          state?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      harvests: {
        Row: {
          area_ha: number | null
          bag_weight_kg: number
          bags: number
          created_at: string
          farm_id: string
          harvested_at: string
          id: string
          moisture_pct: number | null
          notes: string | null
          plot_id: string | null
          season_id: string | null
        }
        Insert: {
          area_ha?: number | null
          bag_weight_kg?: number
          bags: number
          created_at?: string
          farm_id: string
          harvested_at?: string
          id?: string
          moisture_pct?: number | null
          notes?: string | null
          plot_id?: string | null
          season_id?: string | null
        }
        Update: {
          area_ha?: number | null
          bag_weight_kg?: number
          bags?: number
          created_at?: string
          farm_id?: string
          harvested_at?: string
          id?: string
          moisture_pct?: number | null
          notes?: string | null
          plot_id?: string | null
          season_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "harvests_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvests_plot_id_fkey"
            columns: ["plot_id"]
            isOneToOne: false
            referencedRelation: "plots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "harvests_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "crop_seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      plots: {
        Row: {
          area_ha: number
          created_at: string
          current_crop: Database["public"]["Enums"]["crop_kind"] | null
          farm_id: string
          id: string
          name: string
          notes: string | null
          soil_type: string | null
          updated_at: string
        }
        Insert: {
          area_ha: number
          created_at?: string
          current_crop?: Database["public"]["Enums"]["crop_kind"] | null
          farm_id: string
          id?: string
          name: string
          notes?: string | null
          soil_type?: string | null
          updated_at?: string
        }
        Update: {
          area_ha?: number
          created_at?: string
          current_crop?: Database["public"]["Enums"]["crop_kind"] | null
          farm_id?: string
          id?: string
          name?: string
          notes?: string | null
          soil_type?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "plots_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          farm_id: string
          id: string
          notes: string | null
          photo_url: string | null
          status: Database["public"]["Enums"]["task_status"]
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          farm_id: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          farm_id?: string
          id?: string
          notes?: string | null
          photo_url?: string | null
          status?: Database["public"]["Enums"]["task_status"]
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          animal_id: string | null
          category: string
          created_at: string
          description: string | null
          farm_id: string
          id: string
          kind: Database["public"]["Enums"]["tx_kind"]
          lot: string | null
          occurred_at: string
        }
        Insert: {
          amount: number
          animal_id?: string | null
          category: string
          created_at?: string
          description?: string | null
          farm_id: string
          id?: string
          kind: Database["public"]["Enums"]["tx_kind"]
          lot?: string | null
          occurred_at?: string
        }
        Update: {
          amount?: number
          animal_id?: string | null
          category?: string
          created_at?: string
          description?: string | null
          farm_id?: string
          id?: string
          kind?: Database["public"]["Enums"]["tx_kind"]
          lot?: string | null
          occurred_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vaccinations: {
        Row: {
          animal_id: string | null
          applied: boolean
          applied_at: string | null
          created_at: string
          dose: string | null
          farm_id: string
          id: string
          lot: string | null
          notes: string | null
          product: string
          scheduled_at: string | null
        }
        Insert: {
          animal_id?: string | null
          applied?: boolean
          applied_at?: string | null
          created_at?: string
          dose?: string | null
          farm_id: string
          id?: string
          lot?: string | null
          notes?: string | null
          product: string
          scheduled_at?: string | null
        }
        Update: {
          animal_id?: string | null
          applied?: boolean
          applied_at?: string | null
          created_at?: string
          dose?: string | null
          farm_id?: string
          id?: string
          lot?: string | null
          notes?: string | null
          product?: string
          scheduled_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vaccinations_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vaccinations_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      weighings: {
        Row: {
          animal_id: string
          created_at: string
          created_by: string | null
          farm_id: string
          id: string
          notes: string | null
          weighed_at: string
          weight_kg: number
        }
        Insert: {
          animal_id: string
          created_at?: string
          created_by?: string | null
          farm_id: string
          id?: string
          notes?: string | null
          weighed_at?: string
          weight_kg: number
        }
        Update: {
          animal_id?: string
          created_at?: string
          created_by?: string | null
          farm_id?: string
          id?: string
          notes?: string | null
          weighed_at?: string
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "weighings_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weighings_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_manage_farm: {
        Args: { _farm: string; _user: string }
        Returns: boolean
      }
      farm_role_of: {
        Args: { _farm: string; _user: string }
        Returns: Database["public"]["Enums"]["farm_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_farm_member: {
        Args: { _farm: string; _user: string }
        Returns: boolean
      }
    }
    Enums: {
      alert_severity: "info" | "aviso" | "critico"
      animal_sex: "macho" | "femea"
      animal_status: "ativo" | "vendido" | "morto" | "transferido"
      app_role: "admin" | "user"
      application_kind:
        | "fertilizante"
        | "defensivo"
        | "semente"
        | "calcario"
        | "foliar"
        | "outro"
      crop_kind:
        | "soja"
        | "milho"
        | "trigo"
        | "algodao"
        | "feijao"
        | "arroz"
        | "sorgo"
        | "girassol"
        | "outro"
      farm_role: "owner" | "manager" | "worker"
      farm_segment: "pecuaria" | "graos"
      season_status:
        | "planejado"
        | "plantado"
        | "em_desenvolvimento"
        | "colhido"
        | "encerrado"
      task_status: "pendente" | "concluida" | "cancelada"
      tx_kind: "receita" | "despesa"
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
      alert_severity: ["info", "aviso", "critico"],
      animal_sex: ["macho", "femea"],
      animal_status: ["ativo", "vendido", "morto", "transferido"],
      app_role: ["admin", "user"],
      application_kind: [
        "fertilizante",
        "defensivo",
        "semente",
        "calcario",
        "foliar",
        "outro",
      ],
      crop_kind: [
        "soja",
        "milho",
        "trigo",
        "algodao",
        "feijao",
        "arroz",
        "sorgo",
        "girassol",
        "outro",
      ],
      farm_role: ["owner", "manager", "worker"],
      farm_segment: ["pecuaria", "graos"],
      season_status: [
        "planejado",
        "plantado",
        "em_desenvolvimento",
        "colhido",
        "encerrado",
      ],
      task_status: ["pendente", "concluida", "cancelada"],
      tx_kind: ["receita", "despesa"],
    },
  },
} as const
