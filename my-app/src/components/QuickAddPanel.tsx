"use client"

import type React from "react"
import { useState } from "react"
import { supabase } from "../lib/supabase"
import { Plus, X, ImageIcon, Check } from "lucide-react"

interface QuickAddPanelProps {
  onDataUpdate: () => void
}

const QuickAddPanel: React.FC<QuickAddPanelProps> = ({ onDataUpdate }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"project" | "announcement" | "executive">("announcement")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  // Announcement form
  const [announcementTitle, setAnnouncementTitle] = useState("")
  const [announcementContent, setAnnouncementContent] = useState("")
  const [announcementType, setAnnouncementType] = useState<"meeting" | "project" | "competition" | "general">("general")
  const [expirationDays, setExpirationDays] = useState(30)

  // Project form
  const [projectTitle, setProjectTitle] = useState("")
  const [projectDescription, setProjectDescription] = useState("")
  const [projectImage, setProjectImage] = useState<File | null>(null)
  const [projectTech, setProjectTech] = useState("")
  const [projectTechnologies, setProjectTechnologies] = useState<string[]>([])

  // Executive form
  const [execName, setExecName] = useState("")
  const [execRole, setExecRole] = useState("")
  const [execGrade, setExecGrade] = useState(9)
  const [execImage, setExecImage] = useState<File | null>(null)

  // Convert image file to base64 data URL for simple storage
  const convertImageToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(file)
    })
  }

  const handleAddAnnouncement = async () => {
    if (!announcementTitle || !announcementContent) return

    setLoading(true)
    setError("")
    try {
      const expirationDate = new Date()
      expirationDate.setDate(expirationDate.getDate() + expirationDays)

      const { error } = await supabase.from("announcements").insert([
        {
          title: announcementTitle,
          content: announcementContent,
          type: announcementType,
          expires_at: expirationDate.toISOString(),
        },
      ])

      if (error) throw error

      setAnnouncementTitle("")
      setAnnouncementContent("")
      setAnnouncementType("general")
      setExpirationDays(30)
      showSuccess()
      onDataUpdate()
    } catch (error) {
      console.error("Error adding announcement:", error)
      setError("Error adding announcement. Please check your Supabase configuration.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddProject = async () => {
    if (!projectTitle || !projectDescription) return

    setLoading(true)
    setError("")
    try {
      let imageUrl = ""
      if (projectImage) {
        imageUrl = await convertImageToDataUrl(projectImage)
      }

      const { error } = await supabase.from("projects").insert([
        {
          title: projectTitle,
          description: projectDescription,
          image_url: imageUrl,
          technologies: projectTechnologies,
        },
      ])

      if (error) throw error

      setProjectTitle("")
      setProjectDescription("")
      setProjectImage(null)
      setProjectTech("")
      setProjectTechnologies([])
      showSuccess()
      onDataUpdate()
    } catch (error) {
      console.error("Error adding project:", error)
      setError("Error adding project. Please check your Supabase configuration.")
    } finally {
      setLoading(false)
    }
  }

  const handleAddExecutive = async () => {
    if (!execName || !execRole) return

    setLoading(true)
    setError("")
    try {
      let imageUrl = ""
      if (execImage) {
        imageUrl = await convertImageToDataUrl(execImage)
      }

      const currentYear = new Date().getFullYear()
      const graduationYear = currentYear + (12 - execGrade)
      const isAlumni = graduationYear <= currentYear

      const { error } = await supabase.from("executives").insert([
        {
          name: execName,
          role: execRole,
          grade: execGrade,
          image_url: imageUrl,
          graduation_year: graduationYear,
          is_alumni: isAlumni,
        },
      ])

      if (error) throw error

      setExecName("")
      setExecRole("")
      setExecGrade(9)
      setExecImage(null)
      showSuccess()
      onDataUpdate()
    } catch (error) {
      console.error("Error adding executive:", error)
      setError("Error adding executive. Please check your Supabase configuration.")
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = () => {
    setSuccess(true)
    setError("")
    setTimeout(() => setSuccess(false), 3000)
  }

  const addTechnology = () => {
    if (projectTech && !projectTechnologies.includes(projectTech)) {
      setProjectTechnologies([...projectTechnologies, projectTech])
      setProjectTech("")
    }
  }

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-all z-40"
      >
        <Plus className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-6 right-6 bg-white rounded-lg shadow-xl border border-gray-200 w-full max-w-md z-40">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">Quick Add</h3>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-gray-700">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex space-x-2 mb-4">
          <button
            onClick={() => setActiveTab("announcement")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === "announcement" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Announcement
          </button>
          <button
            onClick={() => setActiveTab("project")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === "project" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Project
          </button>
          <button
            onClick={() => setActiveTab("executive")}
            className={`px-3 py-2 rounded-lg text-sm font-medium ${
              activeTab === "executive" ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            Executive
          </button>
        </div>

        {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

        {activeTab === "announcement" && (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
                placeholder="Announcement Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <textarea
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
                placeholder="Announcement Content"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <select
                value={announcementType}
                onChange={(e) => setAnnouncementType(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="general">General</option>
                <option value="meeting">Meeting</option>
                <option value="project">Project</option>
                <option value="competition">Competition</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Auto-delete after (days)</label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  min="1"
                  max="90"
                  value={expirationDays}
                  onChange={(e) => setExpirationDays(Number.parseInt(e.target.value))}
                  className="w-full"
                />
                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm min-w-[2rem] text-center">
                  {expirationDays}
                </span>
              </div>
            </div>
            <button
              onClick={handleAddAnnouncement}
              disabled={loading || !announcementTitle || !announcementContent}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Announcement"}
            </button>
          </div>
        )}

        {activeTab === "project" && (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={projectTitle}
                onChange={(e) => setProjectTitle(e.target.value)}
                placeholder="Project Title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <textarea
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Project Description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Project Image</label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 flex items-center justify-center border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setProjectImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <ImageIcon className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">{projectImage ? projectImage.name : "Select Image"}</span>
                </label>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Technologies</label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={projectTech}
                  onChange={(e) => setProjectTech(e.target.value)}
                  placeholder="Add technology"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTechnology()
                    }
                  }}
                />
                <button
                  onClick={addTechnology}
                  className="px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Add
                </button>
              </div>
              {projectTechnologies.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {projectTechnologies.map((tech, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs flex items-center">
                      {tech}
                      <button
                        onClick={() => {
                          setProjectTechnologies(projectTechnologies.filter((_, i) => i !== index))
                        }}
                        className="ml-1 text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={handleAddProject}
              disabled={loading || !projectTitle || !projectDescription}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Project"}
            </button>
          </div>
        )}

        {activeTab === "executive" && (
          <div className="space-y-3">
            <div>
              <input
                type="text"
                value={execName}
                onChange={(e) => setExecName(e.target.value)}
                placeholder="Executive Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <input
                type="text"
                value={execRole}
                onChange={(e) => setExecRole(e.target.value)}
                placeholder="Role (e.g., President, Vice President)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Grade</label>
              <select
                value={execGrade}
                onChange={(e) => setExecGrade(Number.parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value={9}>Grade 9</option>
                <option value={10}>Grade 10</option>
                <option value={11}>Grade 11</option>
                <option value={12}>Grade 12</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-700 mb-1">Profile Image</label>
              <div className="flex items-center space-x-2">
                <label className="flex-1 flex items-center justify-center border border-gray-300 rounded-lg px-3 py-2 cursor-pointer hover:bg-gray-50">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setExecImage(e.target.files?.[0] || null)}
                    className="hidden"
                  />
                  <ImageIcon className="w-5 h-5 mr-2 text-gray-500" />
                  <span className="text-gray-700">{execImage ? execImage.name : "Select Image"}</span>
                </label>
              </div>
            </div>
            <button
              onClick={handleAddExecutive}
              disabled={loading || !execName || !execRole}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add Executive"}
            </button>
          </div>
        )}

        {success && (
          <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded-lg flex items-center">
            <Check className="w-5 h-5 mr-2" />
            <span>Added successfully!</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default QuickAddPanel
