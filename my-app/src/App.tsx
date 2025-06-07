"use client"

import { useState, useEffect } from "react"
import {
  Users,
  Calendar,
  Mail,
  ChevronRight,
  Github,
  ExternalLink,
  GraduationCap,
  Trophy,
  Lightbulb,
  Target,
  Settings,
  LogIn,
  LogOut,
  MessageCircle,
  Instagram,
} from "lucide-react"
import { supabase } from "./lib/supabase"
import AuthModal from "./components/AuthModal"
import AdminPanel from "./components/AdminPanel"
import QuickAddPanel from "./components/QuickAddPanel"
import AutoDeployment from "./components/AutoDeployment"
import type { Project, Executive, Announcement } from "./lib/types"

function App() {
  const [currentYear] = useState(new Date().getFullYear())
  const [currentMonth] = useState(new Date().getMonth() + 1) // 1-12
  const [activeTab, setActiveTab] = useState<"current" | "alumni">("current")
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showAdminPanel, setShowAdminPanel] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [executives, setExecutives] = useState<Executive[]>([])
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing admin session
    const adminLoggedIn = localStorage.getItem("isAdminLoggedIn") === "true"
    setIsAdminLoggedIn(adminLoggedIn)

    // Load initial data
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load projects with better error handling
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })

      if (projectsError) {
        console.error("Error loading projects:", projectsError)
        setProjects([]) // Set empty array on error
      } else if (projectsData) {
        // Safely cast the data
        setProjects(
          projectsData.map((item) => ({
            id: item.id as string,
            title: item.title as string,
            description: item.description as string,
            image_url: item.image_url as string,
            technologies: (item.technologies as string[]) || [],
            github_url: item.github_url as string | undefined,
            demo_url: item.demo_url as string | undefined,
            created_at: item.created_at as string,
          })),
        )
      }

      // Load executives
      const { data: execsData, error: execsError } = await supabase
        .from("executives")
        .select("*")
        .order("created_at", { ascending: false })

      if (execsError) {
        console.error("Error loading executives:", execsError)
        setExecutives([])
      } else if (execsData) {
        setExecutives(
          execsData.map((item) => ({
            id: item.id as string,
            name: item.name as string,
            grade: item.grade as number,
            role: item.role as string,
            image_url: item.image_url as string,
            graduation_year: item.graduation_year as number,
            is_alumni: item.is_alumni as boolean,
            created_at: item.created_at as string,
          })),
        )
      }

      // Load announcements
      const { data: announcementsData, error: announcementsError } = await supabase
        .from("announcements")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6)

      if (announcementsError) {
        console.error("Error loading announcements:", announcementsError)
        setAnnouncements([])
      } else if (announcementsData) {
        setAnnouncements(
          announcementsData.map((item) => ({
            id: item.id as string,
            title: item.title as string,
            content: item.content as string,
            type: item.type as "meeting" | "project" | "competition" | "general",
            created_at: item.created_at as string,
            expires_at: item.expires_at as string | undefined,
          })),
        )
      }
    } catch (error) {
      console.error("Error loading data:", error)
      // Set empty arrays on error
      setProjects([])
      setExecutives([])
      setAnnouncements([])
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = () => {
    localStorage.removeItem("isAdminLoggedIn")
    localStorage.removeItem("adminEmail")
    setIsAdminLoggedIn(false)
    setShowAdminPanel(false)
  }

  const handleAuthSuccess = () => {
    setIsAdminLoggedIn(true)
    setShowAuthModal(false)
  }

  // Function to scroll to projects section
  const scrollToProjects = () => {
    const projectsSection = document.getElementById("projects")
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: "smooth" })
    }
  }

  // Improved alumni logic - considers school year ending in June
  const isAlumni = (executive: Executive) => {
    const graduationYear = executive.graduation_year

    // If graduation year is in the past, definitely alumni
    if (graduationYear < currentYear) return true

    // If graduation year is in the future, definitely current
    if (graduationYear > currentYear) return false

    // If graduation year is current year, check if we're past June 20th
    if (graduationYear === currentYear) {
      // School ends June 20th, so after June 20th they become alumni
      const currentDate = new Date()
      const graduationDate = new Date(currentYear, 5, 20) // June 20th (month is 0-indexed)
      return currentDate > graduationDate
    }

    return false
  }

  // Update the executive sorting logic to prioritize the president
  const sortByRole = (a: Executive, b: Executive) => {
    // President always comes first
    if (a.role.toLowerCase().includes("president") && !b.role.toLowerCase().includes("president")) return -1
    if (!a.role.toLowerCase().includes("president") && b.role.toLowerCase().includes("president")) return 1

    // Vice president comes second
    if (a.role.toLowerCase().includes("vice president") && !b.role.toLowerCase().includes("vice president")) return -1
    if (!a.role.toLowerCase().includes("vice president") && b.role.toLowerCase().includes("vice president")) return 1

    // Then sort by other roles alphabetically
    return a.role.localeCompare(b.role)
  }

  const currentExecutives = executives.filter((exec) => !isAlumni(exec)).sort(sortByRole)
  const alumniExecutives = executives
    .filter((exec) => isAlumni(exec))
    .sort((a, b) => b.graduation_year - a.graduation_year) // Most recent graduates first

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

  const getAnnouncementColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-blue-50 border-blue-200 text-blue-800"
      case "competition":
        return "bg-yellow-50 border-yellow-200 text-yellow-800"
      case "project":
        return "bg-green-50 border-green-200 text-green-800"
      default:
        return "bg-gray-50 border-gray-200 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <img src="/logo-icon.png" alt="HMS Engineering Club" className="w-16 h-16 mx-auto mb-4 animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Auto-deployment component */}
      <AutoDeployment />

      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <img src="/logo-icon.png" alt="HMS Engineering Club" className="w-10 h-10" />
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                  HMS Engineering Club
                </h1>
                <p className="text-sm text-gray-600">McRoberts Secondary</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex space-x-8">
                <a href="#home" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Home
                </a>
                <a href="#projects" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Projects
                </a>
                <a href="#executives" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Executives
                </a>
                <a href="#announcements" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  News
                </a>
                <a href="#contact" className="text-gray-700 hover:text-blue-600 transition-colors font-medium">
                  Contact
                </a>
              </div>
              {isAdminLoggedIn ? (
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setShowAdminPanel(true)}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Admin</span>
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Exec Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="relative py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                  Engineering
                  <span className="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
                    {" "}
                    Excellence
                  </span>
                </h2>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Welcome to the HMS Engineering Club at McRoberts Secondary School. We are a community of innovative
                  students passionate about engineering, technology, and problem-solving. Join us as we design, build,
                  and create solutions for tomorrow's challenges.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href="https://discord.gg/3mqBd9rtPJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-8 py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Join Our Discord</span>
                </a>
                <button
                  onClick={scrollToProjects}
                  className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold hover:border-blue-600 hover:text-blue-600 transition-all duration-300 flex items-center justify-center space-x-2"
                >
                  <span>View Projects</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">{currentExecutives.length}</div>
                  <div className="text-gray-600">Active Executives</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-teal-600">{projects.length}</div>
                  <div className="text-gray-600">Projects Built</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">{alumniExecutives.length}</div>
                  <div className="text-gray-600">Alumni</div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-teal-400 rounded-3xl opacity-20 blur-3xl"></div>
              <img
                src="/logo-horizontal.png"
                alt="HMS Engineering Club Logo"
                className="relative rounded-3xl shadow-2xl w-full h-96 object-contain bg-white p-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rest of your sections remain the same... */}
      {/* Recent Announcements */}
      <section id="announcements" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Latest Announcements</h3>
            <p className="text-xl text-gray-600">Stay updated with our recent news and upcoming events</p>
          </div>
          {announcements.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className={`p-6 border-l-4 ${getAnnouncementColor(announcement.type)}`}>
                    <div className="flex items-center space-x-3 mb-4">
                      {getAnnouncementIcon(announcement.type)}
                      <span className="text-sm font-semibold uppercase tracking-wide">{announcement.type}</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{announcement.title}</h4>
                    <p className="text-gray-600 mb-4 line-clamp-3">{announcement.content}</p>
                    <div className="text-sm text-gray-500">
                      {new Date(announcement.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600">No announcements yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Projects Showcase */}
      <section id="projects" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Featured Projects</h3>
            <p className="text-xl text-gray-600">Innovative solutions built by our talented members</p>
          </div>
          {projects.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  <div className="relative">
                    <img
                      src={project.image_url || "/placeholder.svg"}
                      alt={project.title}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-sm font-semibold text-gray-700">
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-gray-900 mb-3">{project.title}</h4>
                    <p className="text-gray-600 mb-4 line-clamp-3">{project.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.map((tech, index) => (
                        <span
                          key={index}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex space-x-3">
                      {project.github_url && (
                        <a
                          href={project.github_url}
                          className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                        >
                          <Github className="w-5 h-5" />
                          <span>Code</span>
                        </a>
                      )}
                      {project.demo_url && (
                        <a
                          href={project.demo_url}
                          className="flex items-center space-x-2 text-gray-600 hover:text-teal-600 transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                          <span>Demo</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-xl shadow-md">
              <p className="text-gray-600">No projects yet. Check back soon!</p>
            </div>
          )}
        </div>
      </section>

      {/* Executives & Alumni */}
      <section id="executives" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Our Leadership</h3>
            <p className="text-xl text-gray-600">Meet the dedicated executives leading our club</p>
          </div>

          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="bg-gray-100 rounded-xl p-1 flex">
              <button
                onClick={() => setActiveTab("current")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === "current" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Users className="w-5 h-5" />
                  <span>Current Executives ({currentExecutives.length})</span>
                </div>
              </button>
              <button
                onClick={() => setActiveTab("alumni")}
                className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  activeTab === "alumni" ? "bg-white text-blue-600 shadow-md" : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <div className="flex items-center space-x-2">
                  <GraduationCap className="w-5 h-5" />
                  <span>Alumni ({alumniExecutives.length})</span>
                </div>
              </button>
            </div>
          </div>

          {/* Executives Grid */}
          {(activeTab === "current" ? currentExecutives : alumniExecutives).length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {(activeTab === "current" ? currentExecutives : alumniExecutives).map((executive) => (
                <div
                  key={executive.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  <div className="p-6 text-center">
                    <img
                      src={executive.image_url || "/placeholder.svg"}
                      alt={executive.name}
                      className="w-20 h-20 rounded-full mx-auto mb-4 object-cover border-4 border-blue-100"
                    />
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{executive.name}</h4>
                    <p className="text-blue-600 font-semibold text-sm mb-2">{executive.role}</p>
                    <p className="text-gray-600 text-sm">
                      {activeTab === "current" ? `Grade ${executive.grade}` : `Class of ${executive.graduation_year}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <p className="text-gray-600">
                {activeTab === "current" ? "No current executives yet." : "No alumni executives yet."}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 bg-gradient-to-br from-blue-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h3 className="text-4xl font-bold mb-6">About HMS Engineering Club</h3>
              <p className="text-xl mb-6 leading-relaxed text-blue-100">
                The HMS Engineering Club at McRoberts Secondary School is dedicated to fostering innovation, creativity,
                and technical excellence among students. We provide hands-on experience with engineering principles,
                encourage collaborative problem-solving, and prepare students for future careers in STEM fields.
              </p>
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-teal-300" />
                  <span>Innovation Focus</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-teal-300" />
                  <span>Collaborative Learning</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Trophy className="w-6 h-6 text-teal-300" />
                  <span>Competition Ready</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Lightbulb className="w-6 h-6 text-teal-300" />
                  <span>Creative Solutions</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <img
                src="/logo-horizontal.png"
                alt="HMS Engineering Club"
                className="rounded-3xl shadow-2xl w-full h-96 object-contain bg-white p-8"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Meeting Info */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">Join Our Community</h3>
            <p className="text-xl text-gray-600">Ready to start building the future with us?</p>
          </div>
          <div className="grid lg:grid-cols-2 gap-12">
            <div className="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-8">
              <h4 className="text-2xl font-bold text-gray-900 mb-6">Meeting Information</h4>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Weekly Meetings</div>
                    <div className="text-gray-600">Wednesdays at 3:00 - 4:30 PM</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Target className="w-6 h-6 text-teal-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Location</div>
                    <div className="text-gray-600">Room 120, McRoberts Secondary</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Users className="w-6 h-6 text-purple-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Supervisor</div>
                    <div className="text-gray-600">Mr. Looney</div>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-6 h-6 text-green-600" />
                  <div>
                    <div className="font-semibold text-gray-900">Contact</div>
                    <div className="text-gray-600">club1engineering@gmail.com</div>
                  </div>
                </div>
              </div>
              <div className="flex space-x-4 mt-8">
                <a
                  href="https://discord.gg/3mqBd9rtPJ"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-gradient-to-r from-blue-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Join Discord</span>
                </a>
                <a
                  href="https://www.instagram.com/hms_engineering/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center bg-gradient-to-r from-pink-500 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold hover:from-pink-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
            <div className="space-y-8">
              <div>
                <h4 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h4>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-center space-x-3">
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                    <span>Hands-on engineering projects and challenges</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                    <span>Robotics competitions and technical challenges</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                    <span>Mentorship and leadership opportunities</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                    <span>Access to professional tools and equipment</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                    <span>University and career preparation</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <ChevronRight className="w-5 h-5 text-blue-600" />
                    <span>Design thinking and skill building for grades 8-12</span>
                  </li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6">
                <h5 className="text-lg font-bold text-gray-900 mb-3">Club Statistics</h5>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-blue-600">5+</div>
                    <div className="text-sm text-gray-600">Years Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-teal-600">50+</div>
                    <div className="text-sm text-gray-600">Members Served</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <img src="/logo-icon.png" alt="HMS Engineering Club" className="w-8 h-8" />
              <h5 className="text-xl font-bold">HMS Engineering Club</h5>
            </div>
            <p className="text-gray-400 mb-6">McRoberts Secondary School</p>
            <div className="flex justify-center space-x-6 text-gray-400 mb-6">
              <a
                href="https://discord.gg/3mqBd9rtPJ"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center space-x-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Discord</span>
              </a>
              <a
                href="https://www.instagram.com/hms_engineering/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors flex items-center space-x-2"
              >
                <Instagram className="w-4 h-4" />
                <span>Instagram</span>
              </a>
              <a href="mailto:club1engineering@gmail.com" className="hover:text-white transition-colors">
                Contact Us
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-gray-500">
              <p>&copy; {currentYear} HMS Engineering Club. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showAuthModal && <AuthModal onClose={handleAuthSuccess} />}

      {showAdminPanel && isAdminLoggedIn && (
        <AdminPanel onClose={() => setShowAdminPanel(false)} onDataUpdate={loadData} />
      )}

      {/* Quick Add Panel - only visible when logged in */}
      {isAdminLoggedIn && <QuickAddPanel onDataUpdate={loadData} />}
    </div>
  )
}

export default App
