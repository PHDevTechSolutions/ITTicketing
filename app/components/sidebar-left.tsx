// File: components/sidebar-left.tsx (Ito na ang dapat mong gamitin)

"use client"

import * as React from "react"
import { NavMain } from "../components/nav-main"
import { Sidebar, SidebarContent, SidebarHeader, SidebarRail } from "@/components/ui/sidebar"
import { PageType } from "../dsi-main/page"
import { Home, Inbox, PlusCircle, CheckCircle, Trash2, type LucideIcon, Clock } from "lucide-react" 
import { NavUser } from "../components/nav-user"
const data1 = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
}
// Navigation items
const data: {
  title: string
  key: PageType
  icon: LucideIcon
}[] = [
  { title: "Home", key: "home", icon: Home },
  { title: "Inbox", key: "inbox", icon: Inbox },
  { title: "Open Tickets", key: "openTickets", icon: PlusCircle },
  { title: "Pending Concerns", key: "pendingConcerns", icon: Clock },
  { title: "Closed Tickets", key: "closedTickets", icon: CheckCircle },
  { title: "Create Concern", key: "createConcern", icon: PlusCircle },
  { title: "Trash", key: "trash", icon: Trash2 },
]

export function SidebarLeft({
  setCurrentPage,
  ...props
}: {
  // Ang setCurrentPage ay ang handlePageChange galing Page.tsx, na may auto-close.
  setCurrentPage: React.Dispatch<React.SetStateAction<PageType>>
} & React.ComponentProps<typeof Sidebar>) {
  
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
            // Diretso nang tawagin ang setCurrentPage (handlePageChange)
            onClick: () => setCurrentPage(item.key),
          }))}
        />

      </SidebarHeader>
      <SidebarContent />
      <NavUser user={data1.user} />
      <SidebarRail />
    </Sidebar>
  )
}