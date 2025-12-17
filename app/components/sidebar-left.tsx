"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar"

import { NavMain } from "../components/nav-main"
import { PageType } from "../dsi-main/page"

import {
  Home,
  Inbox,
  PlusCircle,
  CheckCircle,
  Clock,
  LogOut,
  User,
  Loader2,
  Bell,
  type LucideIcon,
} from "lucide-react"

import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

// --------------------
// TYPES
// --------------------
interface CurrentUser {
  Firstname: string
  Lastname: string
  Username: string
  Email: string
  Role: string
  ReferenceID: string
  createdAt: string
}

interface NotificationType {
  message: string
  date: string
  read?: boolean
}

// --------------------
// NAVIGATION ITEMS
// --------------------
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

// --------------------
// COMPONENT
// --------------------
export function SidebarLeft({
  setCurrentPage,
  ...props
}: {
  setCurrentPage: React.Dispatch<React.SetStateAction<PageType>>
} & React.ComponentProps<typeof Sidebar>) {
  // --------------------
  // STATE
  // --------------------
  const [currentUser, setCurrentUser] = useState<CurrentUser>({
    Firstname: "",
    Lastname: "",
    Username: "",
    Email: "",
    Role: "",
    ReferenceID: "",
    createdAt: new Date().toISOString(),
  })

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [openLogout, setOpenLogout] = useState(false)

  const [notifications, setNotifications] = useState<NotificationType[]>([])
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)

  // --------------------
  // FETCH PROFILE
  // --------------------
  const fetchProfile = () => {
    setIsProfileLoading(true)
    setProfileError(null)

    try {
      const storedUser = localStorage.getItem("currentUser")
      if (!storedUser) {
        setProfileError("No login session found.")
        return
      }

      const userData = JSON.parse(storedUser)
      setCurrentUser(userData)
    } catch (error) {
      console.error(error)
      setProfileError("Failed to load profile.")
    } finally {
      setIsProfileLoading(false)
    }
  }

  // --------------------
  // LOGOUT
  // --------------------
  const handleLogout = () => {
    localStorage.removeItem("currentUser")
    window.location.href = "/dsi-login"
  }

  // --------------------
  // NOTIFICATIONS
  // --------------------
  const fetchNotifications = async () => {
    // Example: fetch from API or localStorage
    const fetched: NotificationType[] = [
      { message: "New concern assigned to you.", date: new Date().toISOString(), read: false },
      { message: "Ticket #123 updated.", date: new Date().toISOString(), read: false },
    ]
    setNotifications(fetched)
    setUnreadNotifications(fetched.filter(n => !n.read).length)
  }

  const handleNotificationClick = (notif: NotificationType) => {
    // Mark notification as read
    notif.read = true
    setUnreadNotifications(notifications.filter(n => !n.read).length)
    // Do something: navigate to concern/ticket
  }

  useEffect(() => {
    fetchNotifications()
  }, [])

  // --------------------
  // UTILS
  // --------------------
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString()

  // --------------------
  // RENDER
  // --------------------
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader className="flex flex-col items-center py-4">
        <img
          src="https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png"
          alt="Company Logo"
          className="block dark:hidden"
        />
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

      {/* -------------------- */}
      {/* PROFILE + NOTIFICATIONS + LOGOUT */}
      {/* -------------------- */}
      <div className="mr-auto flex items-center gap-3 px-4 py-2 border-t border-gray-200">
        {/* NOTIFICATION BELL */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            title="Notifications"
            className="text-gray-600 hover:bg-gray-100"
            onClick={() => setIsNotificationOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white font-bold">
                {unreadNotifications}
              </span>
            )}
          </Button>

          <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <DialogContent className="sm:max-w-[400px]">
              <DialogHeader>
                <DialogTitle>Notifications</DialogTitle>
              </DialogHeader>

              <div className="grid gap-2 py-2 text-sm max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 text-center">No new notifications</p>
                ) : (
                  notifications.map((notif, index) => (
                    <div
                      key={index}
                      className="p-2 border-b last:border-b-0 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleNotificationClick(notif)}
                    >
                      {notif.message}
                      <span className="text-gray-400 text-xs block">
                        {formatDate(notif.date)}
                      </span>
                    </div>
                  ))
                )}
              </div>

              <DialogFooter className="flex justify-center">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* PROFILE */}
        <Dialog
          open={isProfileOpen}
          onOpenChange={(open) => {
            setIsProfileOpen(open)
            if (open) fetchProfile()
          }}
        >
          <DialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              title="Profile"
              className="text-gray-600 hover:bg-gray-100"
            >
              <User className="h-5 w-5" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle className="text-center">Profile Information</DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4 text-sm">
              {isProfileLoading ? (
                <div className="text-center text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  Loading profile data...
                </div>
              ) : profileError ? (
                <div className="text-center text-red-500">{profileError}</div>
              ) : (
                <>
                  <div>
                    <Label>Full Name</Label>
                    <p className="font-medium">{currentUser.Firstname} {currentUser.Lastname}</p>
                  </div>
                  <div>
                    <Label>Username</Label>
                    <p className="font-medium">{currentUser.Username}</p>
                  </div>
                  <div>
                    <Label>Email</Label>
                    <p className="font-medium">{currentUser.Email}</p>
                  </div>
                  <div>
                    <Label>Role</Label>
                    <p className="font-medium">{currentUser.Role}</p>
                  </div>
                  <div>
                    <Label>Reference ID</Label>
                    <p className="font-medium">{currentUser.ReferenceID}</p>
                  </div>
                  <div>
                    <Label>Joined</Label>
                    <p className="font-medium">{formatDate(currentUser.createdAt)}</p>
                  </div>
                </>
              )}
            </div>

            <DialogFooter className="flex justify-center">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* LOGOUT */}
        <Dialog open={openLogout} onOpenChange={setOpenLogout}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-800 dark:hover:bg-red-700 dark:text-red-300"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Are you sure you want to logout?</DialogTitle>
            </DialogHeader>

            <DialogFooter className="flex justify-between">
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>

              <Button variant="destructive" onClick={handleLogout}>Logout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <SidebarRail />
    </Sidebar>
  )
}
