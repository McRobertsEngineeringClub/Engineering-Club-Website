"use client"

import { useEffect } from "react"
import { supabase } from "../lib/supabase"

const AutoDeployment = () => {
  useEffect(() => {
    // Function to trigger Netlify build hook
    const triggerNetlifyBuild = async () => {
      const buildHookUrl = import.meta.env.VITE_NETLIFY_BUILD_HOOK

      if (buildHookUrl) {
        try {
          await fetch(buildHookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          })
          console.log("✅ Netlify build triggered successfully")
        } catch (error) {
          console.error("❌ Failed to trigger Netlify build:", error)
        }
      }
    }

    // Listen for database changes
    const channel = supabase
      .channel("data-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, (payload) => {
        console.log("Projects table changed:", payload)
        triggerNetlifyBuild()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "executives" }, (payload) => {
        console.log("Executives table changed:", payload)
        triggerNetlifyBuild()
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "announcements" }, (payload) => {
        console.log("Announcements table changed:", payload)
        triggerNetlifyBuild()
      })
      .subscribe()

    // Cleanup function
    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // This component doesn't render anything
  return null
}

export default AutoDeployment
