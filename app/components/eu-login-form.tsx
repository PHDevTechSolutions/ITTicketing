"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      toast.error("All fields are required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/eulogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Email: email, Password: password }),
      })

      const result = await res.json()
      console.log("EU Login API result:", result)

      if (res.ok && result.success) {
        if (result.ReferenceID) {
          localStorage.setItem("refID", result.ReferenceID)
          localStorage.setItem("currentUser", JSON.stringify(result))
        }

        toast.success(result.message)
        setTimeout(() => router.push("/dsi-main"), 1000)
      } else {
        toast.error(result.message || "Login failed")
      }
    } catch (err) {
      console.error(err)
      toast.error("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4 ${className}`}
      {...props}
    >
      <div className="w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl rounded-2xl p-8 animate-fadeIn">
        {/* Heading */}
        <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-8">
          Log in to access your account
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="mb-2 font-semibold text-gray-700 dark:text-gray-200">Password</label>
            <Input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-400 dark:focus:ring-blue-500"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all duration-300 focus:ring-4 focus:ring-blue-300"
          >
            {loading ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-gray-500 dark:text-gray-400 mt-6">
          Don't have an account?{" "}
          <a href="/dsi-signup" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">
            Sign up
          </a>
        </p>
      </div>
    </div>
  )
}
