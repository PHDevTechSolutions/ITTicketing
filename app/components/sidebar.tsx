"use client";

import * as React from "react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { GalleryVerticalEnd, User, LogOut, Loader2, ChevronRight, Bell } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
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

// ----------------- COMPONENT -----------------
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
  const [profilePic, setProfilePic] = useState<string | null>(null);
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
    new Date(dateStr).toLocaleDateString("en-US", {
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
      setProfilePic(userData.ProfilePic || null);
    } catch (err) {
      console.error(err);
      setProfileError("Failed to load profile.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const handleNotificationClick = (notif: Notification, index: number) => {
    console.log("Notification clicked:", notif);
    // router.push(`/tickets/${notif.ticketNumber}`); // optional
    // setUnreadNotifications(prev => Math.max(prev - 1, 0)); // optional mark as read
  };

  // ----------------- FETCH NOTIFICATIONS -----------------
  React.useEffect(() => {
    async function loadNotifications() {
      const res = await fetch("/api/tickets");
      const data = await res.json();

      const formatted: Notification[] = data.notifications.map((n: any) => ({
        ticketNumber: n.ticketNumber,
        action: n.action,
        actor: n.actor,
        message: n.message,
        date: n.date,
      }));

      setNotifications(formatted);
      setUnreadNotifications(formatted.length);
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
      console.error(err);
      alert("Failed: " + err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("refID");
    window.location.href = "/login";
  };

  // ----------------- JSX -----------------
  return (
    <Sidebar {...props} className="bg-white text-gray-900 border-r border-gray-200">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <div className="flex items-center gap-2 text-xl font-extrabold text-indigo-600">
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
                  className="w-full justify-start text-gray-900 hover:bg-gray-100"
                  data-open={openStates[index]}
                >
                  <div className="flex items-center justify-between w-full">
                    <ChevronRight
                      className={`h-4 w-4 mr-2 transition-transform ${
                        openStates[index] ? "rotate-90 text-indigo-600" : "rotate-0 text-gray-500"
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
                                ? "bg-indigo-100 text-indigo-700 hover:bg-indigo-200"
                                : "hover:bg-gray-100 text-gray-700"
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
      <div className="mr-auto flex items-center gap-3 px-4 py-2 border-t border-gray-200">
        {/* Notification */}
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

          {/* Notifications Dialog */}
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
                      className="p-3 border-b last:border-b-0 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleNotificationClick(notif, index)}
                    >
                      <p className="text-sm">
                        <span className="font-semibold">{notif.actor}</span> {notif.message}
                      </p>
                      <div className="flex justify-between text-xs text-gray-400 mt-1">
                        <span>Ticket #{notif.ticketNumber}</span>
                        <span>{formatDate(notif.date)}</span>
                      </div>
                      <span
                        className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                          notif.action === "created"
                            ? "bg-green-100 text-green-700"
                            : notif.action === "updated"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {notif.action.toUpperCase()}
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

        {/* Profile */}
        <Dialog
          open={isProfileOpen}
          onOpenChange={(open) => {
            setIsProfileOpen(open);
            if (open) fetchProfile();
          }}
        >
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" title="Profile" className="text-gray-600 hover:bg-gray-100">
              <User className="h-5 w-5" />
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-[400px] bg-white rounded-xl">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold text-center text-gray-900">
                Profile Information
              </DialogTitle>
            </DialogHeader>

            <div className="grid gap-4 py-4 text-sm w-full">
              {isProfileLoading ? (
                <div className="text-center p-4 text-gray-500">
                  <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                  <p>Loading profile data...</p>
                </div>
              ) : profileError ? (
                <div className="text-center p-4 text-red-500 border border-red-200 bg-red-50 rounded">
                  <p>{profileError}</p>
                  <p className="text-xs mt-1">Please check the network or login state.</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label className="text-gray-500">Full Name:</Label>
                    <p className="font-medium text-gray-800">{currentUser.Firstname} {currentUser.Lastname}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Username:</Label>
                    <p className="font-medium text-gray-800">{currentUser.Username}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Email:</Label>
                    <p className="font-medium text-gray-800">{currentUser.Email}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Role:</Label>
                    <p className="font-medium text-gray-800">{currentUser.Role}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Reference ID:</Label>
                    <p className="font-medium text-gray-800">{currentUser.ReferenceID}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">Joined:</Label>
                    <p className="font-medium text-gray-800">{formatDate(currentUser.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="text-gray-500">New Password:</Label>
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

            <DialogFooter className="flex justify-center gap-2">
              <Button variant="outline" onClick={handlePasswordUpdate}>
                Update Password
              </Button>
              <DialogClose asChild>
                <Button variant="outline">Close</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Logout */}
        <Dialog open={openLogout} onOpenChange={setOpenLogout}>
          <DialogTrigger asChild>
            <Button
              variant="secondary"
              size="icon"
              className="bg-red-100 hover:bg-red-200 text-red-700"
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
  );
}
