export interface Project {
  id: string
  title: string
  description: string
  image_url: string
  technologies: string[]
  github_url?: string
  demo_url?: string
  created_at: string
}

export interface Executive {
  id: string
  name: string
  grade: number
  role: string
  image_url: string
  graduation_year: number
  is_alumni: boolean
  created_at: string
}

export interface Announcement {
  id: string
  title: string
  content: string
  type: "meeting" | "project" | "competition" | "general"
  created_at: string
  expires_at?: string
}

export interface User {
  id: string
  email: string
  created_at: string
}
