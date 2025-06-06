"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { X, Plus, Edit, Trash2, Calendar, Trophy, Lightbulb, Mail } from "lucide-react"
import { supabase } from "../lib/supabase"
import type { Project, Executive, Announcement } from "../lib/types"

interface AdminPanelProps {
  onClose: () => void
  onDataUpdate: () => void
}

const AdminPanel: React.FC<AdminPanelProps> = ({ onClose, onDataUpdate }) => {
  const [activeTab, setActiveTab] = useState<"projects" | "executives" | "announcements">("projects")
  const [projects, setProjects] = useState<Project[]>([])
  const [executives, setExecutives] = useState<Executive[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [editingItem, setEditingItem] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [projectsRes, execsRes, announcementsRes] = await Promise.all([
        supabase.from("projects").select("*").order("created_at", { ascending: false }),
        supabase.from("executives").select("*").order("created_at", { ascending: false }),
        supabase.from("announcements").select("*").order("created_at", { ascending: false }),
      ])

      if (projectsRes.data) setProjects(projectsRes.data)
      if (execsRes.data) setExecutives(execsRes.data)
      if (announcementsRes.data) setAnnouncements(announcementsRes.data)
    } catch (error) {
      console.error("Error loading data:", error)
    }
  }

  const uploadImage = async (file: File): Promise<string> => {
    const fileExt = file.name.split(".").pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError } = await supabase.storage.from("images").upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data } = supabase.storage.from("images").getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSaveProject = async (projectData: Omit<Project, "id" | "created_at"> & { id?: string }) => {
    setLoading(true)
    try {
      if (projectData.id) {
        // Update existing project
        const { error } = await supabase.from("projects").update(projectData).eq("id", projectData.id)
        if (error) throw error
      } else {
        // Create new project
        const { error } = await supabase.from("projects").insert([projectData])
        if (error) throw error
      }

      await loadData()
      onDataUpdate()
      setShowForm(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Error saving project:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveExecutive = async (execData: Omit<Executive, "id" | "created_at"> & { id?: string }) => {
    setLoading(true)
    try {
      // Calculate graduation year and alumni status
      const currentYear = new Date().getFullYear()
      const graduationYear = currentYear + (12 - execData.grade)
      const isAlumni = graduationYear <= currentYear

      const execWithCalculatedFields = {
        ...execData,
        graduation_year: graduationYear,
        is_alumni: isAlumni,
      }

      if (execData.id) {
        // Update existing executive
        const { error } = await supabase.from("executives").update(execWithCalculatedFields).eq("id", execData.id)
        if (error) throw error
      } else {
        // Create new executive
        const { error } = await supabase.from("executives").insert([execWithCalculatedFields])
        if (error) throw error
      }

      await loadData()
      onDataUpdate()
      setShowForm(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Error saving executive:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveAnnouncement = async (
    announcementData: Omit<Announcement, "id" | "created_at"> & { id?: string },
  ) => {
    setLoading(true)
    try {
      if (announcementData.id) {
        // Update existing announcement
        const { error } = await supabase.from("announcements").update(announcementData).eq("id", announcementData.id)
        if (error) throw error
      } else {
        // Create new announcement
        const { error } = await supabase.from("announcements").insert([announcementData])
        if (error) throw error
      }

      await loadData()
      onDataUpdate()
      setShowForm(false)
      setEditingItem(null)
    } catch (error) {
      console.error("Error saving announcement:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (table: string, id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    setLoading(true)
    try {
      const { error } = await supabase.from(table).delete().eq("id", id)

      if (error) throw error

      await loadData()
      onDataUpdate()
    } catch (error) {
      console.error("Error deleting item:", error)
    } finally {
      setLoading(false)
    }
  }

  const ProjectForm = () => {
    const [formData, setFormData] = useState<Omit<Project, "id" | "created_at"> & { id?: string }>(
      editingItem || {
        title: "",
        description: "",
        image_url: "",
        technologies: [],
        github_url: "",
        demo_url: "",
      },
    )
    const [techInput, setTechInput] = useState("")

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const imageUrl = await uploadImage(file)
        setFormData({ ...formData, image_url: imageUrl })
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }

    const addTechnology = () => {
      if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
        setFormData({
          ...formData,
          technologies: [...formData.technologies, techInput.trim()],
        })
        setTechInput("")
      }
    }

    const removeTechnology = (tech: string) => {
      setFormData({
        ...formData,
        technologies: formData.technologies.filter((t) => t !== tech),
      })
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSaveProject(formData)
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={3}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {formData.image_url && (
            <img
              src={formData.image_url || "/placeholder.svg"}
              alt="Preview"
              className="mt-2 w-32 h-32 object-cover rounded-lg"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Technologies</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Add technology"
            />
            <button
              type="button"
              onClick={addTechnology}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.technologies.map((tech, index) => (
              <span
                key={index}
                className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center space-x-1"
              >
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">GitHub URL (optional)</label>
          <input
            type="url"
            value={formData.github_url || ""}
            onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Demo URL (optional)</label>
          <input
            type="url"
            value={formData.demo_url || ""}
            onChange={(e) => setFormData({ ...formData, demo_url: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Project"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setEditingItem(null)
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  const ExecutiveForm = () => {
    const [formData, setFormData] = useState<Omit<Executive, "id" | "created_at"> & { id?: string }>(
      editingItem || {
        name: "",
        grade: 9,
        role: "",
        image_url: "",
        graduation_year: new Date().getFullYear() + 3,
        is_alumni: false,
      },
    )

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file) return

      try {
        const imageUrl = await uploadImage(file)
        setFormData({ ...formData, image_url: imageUrl })
      } catch (error) {
        console.error("Error uploading image:", error)
      }
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSaveExecutive(formData)
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Grade</label>
          <select
            value={formData.grade}
            onChange={(e) => setFormData({ ...formData, grade: Number.parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          >
            <option value={9}>Grade 9</option>
            <option value={10}>Grade 10</option>
            <option value={11}>Grade 11</option>
            <option value={12}>Grade 12</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
          <input
            type="text"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., President, Vice President, Secretary"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Profile Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {formData.image_url && (
            <img
              src={formData.image_url || "/placeholder.svg"}
              alt="Preview"
              className="mt-2 w-20 h-20 object-cover rounded-full"
            />
          )}
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Executive"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setEditingItem(null)
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  const AnnouncementForm = () => {
    const [formData, setFormData] = useState<Omit<Announcement, "id" | "created_at"> & { id?: string }>(
      editingItem || {
        title: "",
        content: "",
        type: "general",
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // Default 30 days
      },
    )

    const [expirationDays, setExpirationDays] = useState(
      formData.expires_at
        ? Math.round((new Date(formData.expires_at).getTime() - Date.now()) / (24 * 60 * 60 * 1000))
        : 30,
    )

    useEffect(() => {
      // Update expiration date when days change
      const newDate = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
      setFormData({ ...formData, expires_at: newDate.toISOString() })
    }, [expirationDays])

    const getTypeIcon = (type: string) => {
      switch (type) {
        case "meeting":
          return <Calendar className="w-5 h-5" />
        case "competition":
          return <Trophy className="w-5 h-5" />
        case "project":
          return <Lightbulb className="w-5 h-5" />
        default:
          return <Mail className="w-5 h-5" />
      }
    }

    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleSaveAnnouncement(formData)
        }}
        className="space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
          <div className="grid grid-cols-2 gap-2">
            {(["meeting", "project", "competition", "general"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type })}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-colors ${
                  formData.type === type
                    ? "bg-blue-100 border-blue-300 text-blue-800"
                    : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {getTypeIcon(type)}
                <span className="capitalize">{type}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
          <textarea
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Auto-delete after (days)</label>
          <div className="flex items-center space-x-2">
            <input
              type="range"
              min="1"
              max="90"
              value={expirationDays}
              onChange={(e) => setExpirationDays(Number.parseInt(e.target.value))}
              className="w-full"
            />
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium min-w-[3rem] text-center">
              {expirationDays}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            This announcement will automatically be removed on{" "}
            {new Date(formData.expires_at || "").toLocaleDateString()}
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Announcement"}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setEditingItem(null)
            }}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
        </div>
      </form>
    )
  }

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <Calendar className="w-5 h-5" />
      case "competition":
        return <Trophy className="w-5 h-5" />
      case "project":
        return <Lightbulb className="w-5 h-5" />
      default:
        return <Mail className="w-5 h-5" />
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Admin Panel</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex h-full">
          {/* Sidebar */}
          <div className="w-64 bg-gray-50 border-r border-gray-200 p-4">
            <nav className="space-y-2">
              {[
                { id: "projects", label: "Projects", count: projects.length },
                { id: "executives", label: "Executives", count: executives.length },
                { id: "announcements", label: "Announcements", count: announcements.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                    activeTab === tab.id ? "bg-blue-100 text-blue-800 font-semibold" : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <span>{tab.label}</span>
                  <span className="bg-gray-200 text-gray-600 px-2 py-1 rounded-full text-xs">{tab.count}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 capitalize">Manage {activeTab}</h3>
              <button
                onClick={() => {
                  setShowForm(true)
                  setEditingItem(null)
                }}
                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add New</span>
              </button>
            </div>

            {showForm ? (
              <div className="bg-gray-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  {editingItem ? "Edit" : "Add New"} {activeTab.slice(0, -1)}
                </h4>
                {activeTab === "projects" && <ProjectForm />}
                {activeTab === "executives" && <ExecutiveForm />}
                {activeTab === "announcements" && <AnnouncementForm />}
              </div>
            ) : (
              <div className="space-y-4">
                {activeTab === "projects" &&
                  projects.map((project) => (
                    <div
                      key={project.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center space-x-4"
                    >
                      <img
                        src={project.image_url || "/placeholder.svg"}
                        alt={project.title}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{project.title}</h4>
                        <p className="text-gray-600 text-sm line-clamp-2">{project.description}</p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {project.technologies.slice(0, 3).map((tech, index) => (
                            <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                              {tech}
                            </span>
                          ))}
                          {project.technologies.length > 3 && (
                            <span className="text-gray-500 text-xs">+{project.technologies.length - 3} more</span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(project)
                            setShowForm(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("projects", project.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {activeTab === "executives" &&
                  executives.map((executive) => (
                    <div
                      key={executive.id}
                      className="bg-white border border-gray-200 rounded-lg p-4 flex items-center space-x-4"
                    >
                      <img
                        src={executive.image_url || "/placeholder.svg"}
                        alt={executive.name}
                        className="w-16 h-16 object-cover rounded-full"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{executive.name}</h4>
                        <p className="text-blue-600 font-medium text-sm">{executive.role}</p>
                        <p className="text-gray-600 text-sm">
                          Grade {executive.grade} • Class of {executive.graduation_year}
                          {executive.is_alumni && <span className="text-purple-600 ml-2">(Alumni)</span>}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => {
                            setEditingItem(executive)
                            setShowForm(true)
                          }}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete("executives", executive.id!)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                {activeTab === "announcements" &&
                  announcements.map((announcement) => (
                    <div key={announcement.id} className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            {getAnnouncementIcon(announcement.type)}
                            <span className="text-sm font-semibold uppercase tracking-wide text-gray-600">
                              {announcement.type}
                            </span>
                            <span className="text-sm text-gray-500">
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-semibold text-gray-900 mb-2">{announcement.title}</h4>
                          <p className="text-gray-600 text-sm">{announcement.content}</p>
                          {announcement.expires_at && (
                            <p className="text-xs text-gray-500 mt-2">
                              Auto-deletes on: {new Date(announcement.expires_at).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                        <div className="flex space-x-2 ml-4">
                          <button
                            onClick={() => {
                              setEditingItem(announcement)
                              setShowForm(true)
                            }}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete("announcements", announcement.id!)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                {((activeTab === "projects" && projects.length === 0) ||
                  (activeTab === "executives" && executives.length === 0) ||
                  (activeTab === "announcements" && announcements.length === 0)) && (
                  <div className="text-center py-12">
                    <div className="text-gray-400 mb-4">
                      <Plus className="w-12 h-12 mx-auto" />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">No {activeTab} yet</h4>
                    <p className="text-gray-600 mb-4">Get started by adding your first {activeTab.slice(0, -1)}.</p>
                    <button
                      onClick={() => {
                        setShowForm(true)
                        setEditingItem(null)
                      }}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Add {activeTab.slice(0, -1)}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminPanel
