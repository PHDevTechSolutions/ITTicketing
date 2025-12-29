"use client";

import * as React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { GalleryVerticalEnd, User, LogOut, Loader2, ChevronRight, Bell } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "../components/mode-toggle";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
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
} from "@/components/ui/sidebar";

// ----------------- TYPES -----------------
type Notification = {
  ticketNumber: string;
  action: "created" | "updated" | "processed";
  actor: string;
  message: string;
  date: string;
};

interface UserType {
  Firstname: string;
  Lastname: string;
  Username: string;
  Email: string;
  Role: string;
  ReferenceID: string;
  createdAt: string;
  ProfilePic?: string;
  Password?: string;
}

// ----------------- NAV DATA -----------------
const data = {
  navMain: [
    {
      title: "Main Menu",
      url: "#",
      items: [
        { title: "Dashboard", url: "/dashboard" },
        { title: "Concern", url: "/concern" },
        { title: "Tickets", url: "/tickets" },
      ],
    },
    {
      title: "Maintenance",
      url: "#",
      items: [
        { title: "Department", url: "/department" },
        { title: "Request Type", url: "/requesttype" },
        { title: "Type of Concern", url: "/typeofconcern" },
        { title: "Mode", url: "/mode" },
        { title: "Group", url: "/group" },
        { title: "Site", url: "/site" },
        { title: "Priority", url: "/priority" },
        { title: "Status", url: "/status" },
        { title: "Technician", url: "/technician" },
      ],
    },
  ],
};

export function AppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname();

  // Sidebar open state
  const initialOpenStates = data.navMain.map((item, index) =>
    index === 0 ? true : item.items.some((sub) => pathname === sub.url)
  );
  const [openStates, setOpenStates] = useState<boolean[]>(initialOpenStates);
  const handleToggle = (index: number) => {
    setOpenStates((prev) => {
      const newState = [...prev];
      newState[index] = !newState[index];
      return newState;
    });
  };

  // Profile states
  const [newPassword, setNewPassword] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<UserType>({
    Firstname: "",
    Lastname: "",
    Username: "",
    Email: "",
    Role: "",
    ReferenceID: "",
    createdAt: new Date().toISOString(),
    Password: "",
  });
  const [openLogout, setOpenLogout] = useState(false);

  // Notification states
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);

  // ----------------- HELPERS -----------------
  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

  const fetchProfile = () => {
    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const storedUser = localStorage.getItem("currentUser");
      if (!storedUser) {
        setProfileError("No login session found.");
        return;
      }
      const userData = JSON.parse(storedUser);
      setCurrentUser(userData);
    } catch (err) {
      console.error(err);
      setProfileError("Failed to load profile.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleNotificationClick = (notif: Notification, index: number) => {
    console.log("Notification clicked:", notif);
  };

  // ----------------- FETCH NOTIFICATIONS -----------------
  React.useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await fetch("/api/tickets");
        const data = await res.json();
        const formatted: Notification[] = data.notifications.map((n: any) => ({
          ticketNumber: n.ticketNumber,
          action: n.action,
          actor: n.actor,
          message: n.message,
          date: n.createdAt,
        }));
        setNotifications(formatted);
        setUnreadNotifications(formatted.length);
      } catch (e) {
        console.error("Failed to load notifications", e);
      }
    }
    loadNotifications();
  }, []);

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
      alert("Failed: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("refID");
    window.location.href = "/login";
  };

  return (
    <Sidebar 
      {...props} 
      className="bg-white dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 border-r border-gray-200 dark:border-zinc-800"
    >
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                <GalleryVerticalEnd className="w-6 h-6" />
                <span>Admin Panel</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {data.navMain.map((item, index) => (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  onClick={() => handleToggle(index)}
                  className="w-full justify-start text-gray-900 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-900"
                  data-open={openStates[index]}
                >
                  <div className="flex items-center justify-between w-full">
                    <ChevronRight
                      className={`h-4 w-4 mr-2 transition-transform ${
                        openStates[index] ? "rotate-90 text-indigo-600 dark:text-indigo-400" : "rotate-0 text-gray-500"
                      }`}
                    />
                    <span className="font-semibold text-base flex-grow text-left">{item.title}</span>
                  </div>
                </SidebarMenuButton>

                {item.items && item.items.length > 0 && openStates[index] && (
                  <SidebarMenuSub>
                    {item.items.map((subItem) => {
                      const isActive = pathname === subItem.url;
                      return (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            isActive={isActive}
                            className={
                              isActive
                                ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60"
                                : "hover:bg-gray-100 dark:hover:bg-zinc-900 text-gray-700 dark:text-zinc-400"
                            }
                          >
                            <a href={subItem.url}>{subItem.title}</a>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer: Notifications, Profile, Logout */}
      <div className="mr-auto flex items-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        {/* Notification */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon"
            title="Notifications"
            className="text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900"
            onClick={() => setIsNotificationOpen(true)}
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white font-bold">
                {unreadNotifications}
              </span>
            )}
          </Button>

          <Dialog open={isNotificationOpen} onOpenChange={setIsNotificationOpen}>
            <DialogContent className="sm:max-w-[400px] bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="dark:text-zinc-100">Notifications</DialogTitle>
              </DialogHeader>

              <div className="grid gap-2 py-2 text-sm max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-gray-500 dark:text-zinc-500 text-center py-4">No new notifications</p>
                ) : (
                  notifications.map((notif, index) => (
                    <div
                      key={index}
                      className="p-3 border-b border-gray-100 dark:border-zinc-800 last:border-b-0 hover:bg-gray-50 dark:hover:bg-zinc-900/50 rounded cursor-pointer transition-colors"
                      onClick={() => handleNotificationClick(notif, index)}
                    >
                      <p className="text-sm dark:text-zinc-300">
                        <span className="font-semibold text-gray-900 dark:text-zinc-100">{notif.actor}</span>'s Created {notif.message}
                      </p>
                      <div className="flex justify-between text-xs text-gray-400 dark:text-zinc-500 mt-1">
                        <span>Ticket #{notif.ticketNumber}</span>
                        <span>{notif.date}</span>
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-medium uppercase ${
                          notif.action === "created"
                            ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                            : notif.action === "updated"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                            : "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                        }`}
                      >
                        {notif.action}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="dark:border-zinc-800 dark:hover:bg-zinc-900">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Profile */}
        <Dialog
          open={isProfileOpen}
          onOpenChange={(open) => {
            setIsProfileOpen(open);
            if (open) fetchProfile();
          }}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Profile" className="text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-900">
              <User className="h-5 w-5" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[400px] bg-white dark:bg-zinc-950 border-gray-200 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-center text-gray-900 dark:text-zinc-100">
                Profile Information
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4 text-sm">
              {isProfileLoading ? (
                <div className="text-center p-4 text-gray-500 dark:text-zinc-500">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  <p>Loading profile...</p>
                </div>
              ) : profileError ? (
                <div className="text-center p-4 text-red-500 bg-red-50 dark:bg-red-900/20 rounded border border-red-100 dark:border-red-900/30">
                  <p>{profileError}</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {[
                    { label: "Full Name", val: `${currentUser.Firstname} ${currentUser.Lastname}` },
                    { label: "Username", val: currentUser.Username },
                    { label: "Email", val: currentUser.Email },
                    { label: "Role", val: currentUser.Role },
                    { label: "Reference ID", val: currentUser.ReferenceID },
                    { label: "Joined", val: formatDate(currentUser.createdAt) },
                  ].map((item) => (
                    <div key={item.label}>
                      <Label className="text-gray-500 dark:text-zinc-500 text-xs">{item.label}</Label>
                      <p className="font-medium text-gray-800 dark:text-zinc-200">{item.val}</p>
                    </div>
                  ))}
                  <div className="pt-2">
                    <Label className="text-gray-500 dark:text-zinc-500 text-xs mb-1 block">New Password</Label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-zinc-800 bg-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-zinc-100"
                      placeholder="Enter new password"
                    />
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="flex flex-row justify-end gap-2">
              <DialogClose asChild>
                <Button variant="outline" className="dark:border-zinc-800 dark:hover:bg-zinc-900">Close</Button>
              </DialogClose>
              <Button onClick={handlePasswordUpdate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                Update
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logout */}
        <Dialog open={openLogout} onOpenChange={setOpenLogout}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[400px] dark:bg-zinc-950 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="dark:text-zinc-100 text-center">Are you sure you want to logout?</DialogTitle>
            </DialogHeader>
            <DialogFooter className="flex flex-row justify-center gap-4 mt-4">
              <DialogClose asChild>
                <Button variant="outline" className="flex-1 dark:border-zinc-800">Cancel</Button>
              </DialogClose>
              <Button variant="destructive" className="flex-1" onClick={handleLogout}>Logout</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <div className="ml-auto">
          <ModeToggle />
        </div>
      </div>

      <SidebarRail />
    </Sidebar>
  );
}