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
  Department: string
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
    Department: "",
    ReferenceID: "",
    createdAt: new Date().toISOString(),
  })

  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isProfileLoading, setIsProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [openLogout, setOpenLogout] = useState(false)
  const [newPassword, setNewPassword] = useState("");
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

      const handlePasswordUpdate = async () => {
    if (!currentUser.ReferenceID || !newPassword) return alert("Missing info");

    try {
      const res = await fetch(`/api/user/${currentUser.ReferenceID}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed");
      setCurrentUser((prev) => ({ ...prev, Password: newPassword }));
      alert("Password updated successfully!");
      setNewPassword("");
    } catch (err: any) {
      console.error(err);
      alert("Failed: " + err.message);
    }
  };


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
              className="text-white-600 hover:bg-gray-300"
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
                    <Label className="mb-1">Full Name:</Label>
                    <p className="font-medium">{currentUser.Firstname} {currentUser.Lastname}</p>
                  </div>
                  <div>
                    <Label className="mb-1">Username:</Label>
                    <p className="font-medium">{currentUser.Username}</p>
                  </div>
                  <div>
                    <Label className="mb-1">Email:</Label>
                    <p className="font-medium">{currentUser.Email}</p>
                  </div>
                  <div>
                    <Label className="mb-1">Department:</Label>
                    <p className="font-medium">{currentUser.Department}</p>
                  </div>
                  <div>
                    <Label className="mb-1">Reference ID:</Label>
                    <p className="font-medium">{currentUser.ReferenceID}</p>
                  </div>
                  <div>
                    <Label className="mb-1">Joined:</Label>
                    <p className="font-medium">{formatDate(currentUser.createdAt)}</p>
                  </div>
                                    <div>
                                      <Label className="text-white-500 mb-2">New Password:</Label>
                                      <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        placeholder="Enter new password"
                                      />
                                    </div>
                </>
              )}
            </div>

            <DialogFooter className="flex justify-center">
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
                                          <Button variant="outline" onClick={handlePasswordUpdate}>
                              Update Password
                            </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* LOGOUT */}
        <Dialog open={openLogout} onOpenChange={setOpenLogout}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="bg-white-100 hover:bg-red-200 text-red-700 dark:bg-white-800 dark:hover:bg-red-700 dark:text-red-300"
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
