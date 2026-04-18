// Auto-generated from Supabase (project trinityx · imhbbiarjtvjftdotjgt).
// Regenerate via the Supabase MCP `generate_typescript_types` whenever
// schema changes, or run `supabase gen types typescript` if the CLI
// is set up. Do not edit by hand — wire table types through this file
// so the rest of the app gets compile-time safety on every query.
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
      time_categories: {
        Row: {
          color_hex: string
          created_at: string
          display_order: number
          id: string
          is_default: boolean
          label: string
          user_id: string
        }
        Insert: {
          color_hex: string
          created_at?: string
          display_order?: number
          id?: string
          is_default?: boolean
          label: string
          user_id: string
        }
        Update: {
          color_hex?: string
          created_at?: string
          display_order?: number
          id?: string
          is_default?: boolean
          label?: string
          user_id?: string
        }
        Relationships: []
      }
      time_entries: {
        Row: {
          category_id: string | null
          created_at: string
          duration_minutes: number
          id: string
          intensity: string
          note: string | null
          slot_start: string
          source: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          intensity?: string
          note?: string | null
          slot_start: string
          source?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category_id?: string | null
          created_at?: string
          duration_minutes?: number
          id?: string
          intensity?: string
          note?: string | null
          slot_start?: string
          source?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "time_entries_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "time_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      seed_default_time_categories: {
        Args: { p_user_id: string }
        Returns: undefined
      }
    }
  }
}

// ── Friendly aliases for import-from-app ─────────────────────────

export type TimeCategory = Database["public"]["Tables"]["time_categories"]["Row"]
export type TimeCategoryInsert = Database["public"]["Tables"]["time_categories"]["Insert"]
export type TimeCategoryUpdate = Database["public"]["Tables"]["time_categories"]["Update"]

export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"]
export type TimeEntryInsert = Database["public"]["Tables"]["time_entries"]["Insert"]
export type TimeEntryUpdate = Database["public"]["Tables"]["time_entries"]["Update"]

/** Intensity enum. `main` = solid colour block, `buffer` = soft/lighter. */
export type TimeIntensity = "main" | "buffer"

/** Per-cell grid unit — one timebox = 30 minutes. */
export const SLOT_MINUTES = 30
