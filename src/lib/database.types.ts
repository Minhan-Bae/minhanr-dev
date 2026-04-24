// Auto-generated from Supabase (project trinityx · imhbbiarjtvjftdotjgt).
// Regenerate via Supabase MCP `generate_typescript_types`.
// 2026-04-24: vault_schema v2.0 — vault_notes에 lifecycle/status/doc_state 컬럼 추가.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: { PostgrestVersion: "14.4" }
  public: {
    Tables: {
      vault_notes: {
        Row: {
          body_md: string
          category: string | null
          confidence: string | null
          created: string | null
          created_at: string
          deadline: string | null
          doc_state: string | null
          edit_source: string
          excerpt: string | null
          frontmatter_raw: Json
          id: number
          last_edited_at: string
          lifecycle: string | null
          lifecycle_state: string
          maturity: string | null
          path: string
          priority: string | null
          publish: string | null
          search: unknown
          slug: string | null
          source_type: string | null
          status: string | null
          summary: string | null
          title: string | null
          type: string | null
          updated_at: string
          vault_commit: string | null
          workflow: string | null
        }
        Insert: Partial<Database["public"]["Tables"]["vault_notes"]["Row"]> & { path: string }
        Update: Partial<Database["public"]["Tables"]["vault_notes"]["Row"]>
        Relationships: []
      }
      vault_tags: {
        Row: { note_id: number; tag: string }
        Insert: { note_id: number; tag: string }
        Update: { note_id?: number; tag?: string }
        Relationships: [
          {
            foreignKeyName: "vault_tags_note_id_fkey"
            columns: ["note_id"]
            isOneToOne: false
            referencedRelation: "vault_notes"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_note_backlinks: {
        Row: {
          anchor: string
          display: string | null
          dst_path: string
          src_path: string
        }
        Insert: {
          anchor?: string
          display?: string | null
          dst_path: string
          src_path: string
        }
        Update: {
          anchor?: string
          display?: string | null
          dst_path?: string
          src_path?: string
        }
        Relationships: []
      }
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
        Relationships: []
      }
      // 기타 테이블은 PostgREST API로 직접 접근 (타입 추가 필요시 generate_typescript_types 재실행)
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// 편의 type alias (호출처 단순화)
export type VaultNoteRow = Database["public"]["Tables"]["vault_notes"]["Row"];
export type VaultTagRow = Database["public"]["Tables"]["vault_tags"]["Row"];
export type TimeCategory = Database["public"]["Tables"]["time_categories"]["Row"];
export type TimeCategoryInsert = Database["public"]["Tables"]["time_categories"]["Insert"];
export type TimeCategoryUpdate = Database["public"]["Tables"]["time_categories"]["Update"];
export type TimeEntry = Database["public"]["Tables"]["time_entries"]["Row"];
export type TimeEntryInsert = Database["public"]["Tables"]["time_entries"]["Insert"];
export type TimeEntryUpdate = Database["public"]["Tables"]["time_entries"]["Update"];
