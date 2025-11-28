"use client"

import * as React from "react"
import { usePathname } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from "@/components/ui/sidebar"

// Navigation Data
const data = {
  navMain: [
    {
      title: "Main Menu",
      url: "#",
      items: [
        {
          title: "Dashboard",
          url: "/dashboard",
        },
        {
          title: "Concern",
          url: "/concern",
        },
        {
          title: "Tickets",
          url: "/tickets",
        },
      ],
    },
    {
      title: "Maintenance",
      url: "#",
      items: [
        {
          title: "Department",
          url: "/department",
        },
        {
          title: "Request Type",
          url: "/requesttype",
        },
        {
          title: "Type of Concern",
          url: "/typeofconcern",
        },
                {
          title: "Mode",
          url: "/mode",
        },
                {
          title: "Group",
          url: "group",
        },
        {
          title: "Site",
          url: "site",
        },
        {
          title: "Priority",
          url: "/priority",
        },
        {
          title: "Status",
          url: "/status",
        },
        {
          title: "Technician",
          url: "/technician",
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar {...props}>
      {/* Sidebar Header (logo or title) */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 text-lg font-bold">
                <GalleryVerticalEnd className="w-5 h-5" />
                <span>Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Sidebar Navigation */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton asChild>
                  <a href={item.url} className="font-medium">
                    {item.title}
                  </a>
                </SidebarMenuButton>

                {/* Sub Menu */}
                {item.items?.length ? (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isActive = pathname === subItem.url
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive}
                          >
                            <a href={subItem.url}>
                              {subItem.title}
                            </a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      )
                    })}
                  </SidebarMenuSub>
                ) : null}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarRail />
    </Sidebar>
  )
}
