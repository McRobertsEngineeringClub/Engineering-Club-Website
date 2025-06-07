"use client"

import type React from "react"
import { useState } from "react"
import { X, Mail, Lock, Eye, EyeOff } from "lucide-react"

interface AuthModalProps {
  onClose: () => void
}

const AuthModal: React.FC<AuthModalProps> = ({ onClose }) => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // AUTHORIZED EMAILS - automatically grant access to these emails
      const authorizedEmails = ["club1engineering@gmail.com", "hms.engineering@mcroberts.ca", "admin@mcroberts.ca"]

      console.log("Checking credentials...")
      console.log("Input email:", email.trim())
      console.log("Authorized emails:", authorizedEmails)

      // Check if email is in authorized list
      if (authorizedEmails.includes(email.trim().toLowerCase())) {
        console.log("✅ Authorized email detected - granting admin access!")

        // Store login state in localStorage
        localStorage.setItem("isAdminLoggedIn", "true")
        localStorage.setItem("adminEmail", email.trim())
        onClose()
        return
      }

      // Fallback: Check against environment variables or hardcoded credentials
      const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || "club1engineering@gmail.com"
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || "$1LpX#ZyW4o9k@T!3"

      console.log("Checking fallback credentials...")
      console.log("Admin email:", adminEmail)
      console.log("Input password:", password)

      if (email.trim().toLowerCase() === adminEmail.toLowerCase() && password === adminPassword) {
        console.log("✅ Fallback credentials matched!")
        localStorage.setItem("isAdminLoggedIn", "true")
        localStorage.setItem("adminEmail", email.trim())
        onClose()
        return
      }

      // If neither authorized email nor correct credentials
      setError("Access denied. Please use an authorized email address or correct credentials.")
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Executive Sign In</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSignIn} className="p-6 space-y-6">
          {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your.email@mcroberts.ca"
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-teal-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-teal-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <div className="px-6 pb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Quick Access</h3>
            <div className="text-blue-800 text-sm space-y-1">
              <p>• Authorized emails get automatic access</p>
              <p>• Use your club email address</p>
              <p>• Contact admin if you need access</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-600 mt-4">
            Only authorized executives can access the admin panel.
          </p>
        </div>
      </div>
    </div>
  )
}

export default AuthModal
