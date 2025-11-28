"use client"

import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  )
}
