"use client"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Field, FieldLabel, FieldGroup, FieldDescription } from "@/components/ui/field"

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
  const [identifier, setIdentifier] = useState("") // username or email
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!identifier || !password) {
      toast.error("All fields are required")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ Username: identifier, Password: password })
      })

      const result = await res.json()

      if (res.ok && result.success) {
        
        // 🔑 CRITICAL CHANGE: Store the Username in localStorage under the key 'userId'
        if (result.Username) {
            localStorage.setItem('userId', result.Username); 
        }

        toast.success("Login successful!")
        setTimeout(() => router.push("/dashboard"), 1000)
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
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          <Field>
            <FieldLabel>Username or Email</FieldLabel>
            <Input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </Field>

          <Field>
            <FieldLabel>Password</FieldLabel>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </Field>

          <Button type="submit" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </Button>

          <FieldDescription className="text-center mt-2">
            Don't have an account? <a href="/signup" className="underline">Sign up</a>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  )
}