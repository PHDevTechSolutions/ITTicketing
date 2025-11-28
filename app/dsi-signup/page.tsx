import { GalleryVerticalEnd } from "lucide-react"

import { EndUserSignupForm } from "../components/eu-signup-form"

export default function SignupPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
        </a>
        <EndUserSignupForm/>
      </div>
    </div>
  )
}
