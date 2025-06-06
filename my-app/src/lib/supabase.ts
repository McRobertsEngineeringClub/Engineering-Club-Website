import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://your-project.supabase.co"
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "your-anon-key"

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string
          technologies: string[]
          github_url?: string
          demo_url?: string
          created_at: string
        }
        Insert: {
          title: string
          description: string
          image_url: string
          technologies: string[]
          github_url?: string
          demo_url?: string
        }
        Update: {
          title?: string
          description?: string
          image_url?: string
          technologies?: string[]
          github_url?: string
          demo_url?: string
        }
      }
      executives: {
        Row: {
          id: string
          name: string
          grade: number
          role: string
          image_url: string
          graduation_year: number
          is_alumni: boolean
          created_at: string
        }
        Insert: {
          name: string
          grade: number
          role: string
          image_url: string
          graduation_year: number
          is_alumni?: boolean
        }
        Update: {
          name?: string
          grade?: number
          role?: string
          image_url?: string
          graduation_year?: number
          is_alumni?: boolean
        }
      }
      announcements: {
        Row: {
          id: string
          title: string
          content: string
          type: "meeting" | "project" | "competition" | "general"
          created_at: string
        }
        Insert: {
          title: string
          content: string
          type: "meeting" | "project" | "competition" | "general"
        }
        Update: {
          title?: string
          content?: string
          type?: "meeting" | "project" | "competition" | "general"
        }
      }
    }
  }
}
