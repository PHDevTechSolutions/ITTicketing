"use client"

import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Sparkles,
} from "lucide-react"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar: string
    department: string
  }
}) {
  const { isMobile } = useSidebar()

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground md:h-8 md:p-0"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback className="rounded-lg">CN</AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">{user.name}</span>
                <span className="truncate text-xs">{user.email}</span>

              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
<DropdownMenuLabel className="p-2 font-normal">
  <div className="flex items-center gap-3 px-2 py-2 text-left text-sm">
    <Avatar className="h-12 w-12 rounded-lg">
      <AvatarImage src={user.avatar} alt={user.name} />
      <AvatarFallback className="rounded-lg">CN</AvatarFallback>
    </Avatar>
    <div className="grid flex-1 text-left leading-tight">
      <span className="truncate text-lg font-semibold">{user.name}</span>
      <span className="truncate text-sm font-medium text-gray-600">{user.department}</span>
      <span className="truncate text-sm text-gray-500">{user.email}</span>
    </div>
  </div>
</DropdownMenuLabel>

<DropdownMenuItem
  onClick={() => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      // Clear localStorage
      localStorage.removeItem("currentUser");
      localStorage.removeItem("refID");
      // Redirect to login page
      window.location.href = "/dsi-login";
    }
  }}
>
  <LogOut className="mr-2 h-4 w-4" />
  Log out
</DropdownMenuItem>



          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
