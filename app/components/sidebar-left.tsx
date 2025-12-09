"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import { NavMain } from "../components/nav-main"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { PageType } from "../dsi-main/page"
import { Home, Inbox, PlusCircle, CheckCircle, Clock, type LucideIcon } from "lucide-react" 
import { NavUser } from "../components/nav-user"

// Navigation items
const data: {
  title: string
  key: PageType
  icon: LucideIcon
}[] = [
  { title: "Home", key: "home", icon: Home },
  { title: "Inbox", key: "inbox", icon: Inbox },
  { title: "Create Concern", key: "createConcern", icon: PlusCircle },
  { title: "Open Tickets", key: "openTickets", icon: PlusCircle },
  { title: "Pending Concerns", key: "pendingConcerns", icon: Clock },
  { title: "Closed Tickets", key: "closedTickets", icon: CheckCircle },
]

export function SidebarLeft({
  setCurrentPage,
  ...props
}: {
  setCurrentPage: React.Dispatch<React.SetStateAction<PageType>>
} & React.ComponentProps<typeof Sidebar>) {

  const [user, setUser] = useState<{ name: string; email: string; avatar: string; department:string }>({
  name: "",
  email: "",
  avatar: "/default-avatar.png", // default avatar
  department: "",
})


useEffect(() => {
  const storedUser = localStorage.getItem("currentUser")
  if (storedUser) {
    const parsedUser = JSON.parse(storedUser)
    setUser({
      name: `${parsedUser.Firstname} ${parsedUser.Lastname}`,
      email: parsedUser.Email,
      avatar: parsedUser.avatar || "/default-avatar.png", // fallback
      department: parsedUser.Department || "",
    })
  }
}, [])




  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="flex flex-col items-center py-4">
        <img
          src="https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png"
          alt="Company Logo"
          className="block dark:hidden"
        />

        {/* Dark mode logo (white) */}
        <img
          src="https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-white-scaled.png"
          alt="Company Logo"
          className="hidden dark:block"
        />
        <br />

        <NavMain
          items={data.map((item) => ({
            ...item,
            onClick: () => setCurrentPage(item.key),
          }))}
        />
      </SidebarHeader>

      <SidebarContent />

      {/* Display dynamic user */}
      <NavUser user={user} />

      <SidebarRail />
    </Sidebar>
  )
}
