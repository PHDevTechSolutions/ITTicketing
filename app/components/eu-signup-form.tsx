"use client"
import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SignupForm1({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [firstname, setFirstname] = useState("")
  const [lastname, setLastname] = useState("")
  const [department, setDepartment] = useState("");
  const [referenceID, setReferenceID] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  // Auto generate ReferenceID based on First + Last name
  useEffect(() => {
    if (firstname && lastname) {
      const refID = `${firstname.charAt(0).toUpperCase()}${lastname
        .charAt(0)
        .toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`
      setReferenceID(refID)
    }
  }, [firstname, lastname])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (
      !username ||
      !email ||
      !password ||
      !confirmPassword ||
      !firstname ||
      !lastname ||
      !department
    ) {
      toast.error("All fields are required")
      return
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long")
      return
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/eugister", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          Username: username,
          Email: email,
          Password: password,
          Role: "enduser", // <-- dito idinagdag
          Firstname: firstname,
          Lastname: lastname,
          Department: department,
          ReferenceID: referenceID,
        }),
      })
      let result;
      try {
        result = await res.json(); // try to parse JSON
      } catch (err) {
        console.error("Failed to parse JSON:", err);
        toast.error("Server returned invalid response");
        return;
      }


      if (res.ok) {
        toast.success("Registration successful!")
        setUsername("")
        setEmail("")
        setPassword("")
        setConfirmPassword("")
        setFirstname("")
        setLastname("")
        setDepartment("")
        setReferenceID("")
        setTimeout(() => router.push("/dsi-login"), 1500)
      } else {
        toast.error(result.message || "Registration failed")
      }
    } catch (err) {
      console.error(err)
      toast.error("Server error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-2", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Create your account</CardTitle>
          <CardDescription>Enter your details below to register</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit}>
            <FieldGroup>
              <Input type="hidden" value={referenceID} readOnly />
              <Field>
                <FieldLabel>First Name</FieldLabel>
                <Input
                  type="text"
                  required
                  value={firstname}
                  onChange={(e) => setFirstname(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>Last Name</FieldLabel>
                <Input
                  type="text"
                  required
                  value={lastname}
                  onChange={(e) => setLastname(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>Email</FieldLabel>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </Field>

              <Field>
                <FieldLabel>Department</FieldLabel>
                <Select onValueChange={(value) => setDepartment(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sales Department">Sales Department</SelectItem>
                    <SelectItem value="IT Department">IT Department</SelectItem>
                    <SelectItem value="HR Department">HR Department</SelectItem>
                    <SelectItem value="Accounting Department">Accounting Department</SelectItem>
                    <SelectItem value="Procurement Department">Procurement Department</SelectItem>
                    <SelectItem value="Marketing Department">Marketing Department</SelectItem>
                    <SelectItem value="Ecommerce Department">Ecommerce Department</SelectItem>
                    <SelectItem value="CSR Department">CSR Department</SelectItem>
                    <SelectItem value="Admin Department">Admin Department</SelectItem>
                    <SelectItem value="Warehouse Department">Warehouse Department</SelectItem>
                    <SelectItem value="Logistic Department">Logistic Department</SelectItem>
                    <SelectItem value="Engineering Department">Engineering Department</SelectItem>
                  </SelectContent>
                </Select>
              </Field>

              <Field>
                <FieldLabel>Username</FieldLabel>
                <Input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
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

              <Field>
                <FieldLabel>Confirm Password</FieldLabel>
                <Input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </Field>

              <FieldDescription>Must be at least 8 characters long.</FieldDescription>

              <Button type="submit" disabled={loading}>
                {loading ? "Creating Account..." : "Create Account"}
              </Button>

              <FieldDescription className="text-center mt-1">
                Already have an account?{" "}
                <Link href="/login" className="underline">
                  Sign in
                </Link>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center text-">
        By continuing, you agree to our{" "}
        <a href="#" className="underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="underline">
          Privacy Policy
        </a>
        .
      </FieldDescription>
    </div>
  )
}
