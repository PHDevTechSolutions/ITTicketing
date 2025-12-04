"use client";

import { useState, useEffect } from "react";
// Assuming you have these components configured
import { AppSidebar } from "../components/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, LogOut, Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Interfaces
interface Status {
  _id: string;
  name: string;
}

interface CurrentUser {
  _id: string;
  Username: string;
  Email: string;
  Role: string;
  Firstname: string;
  Lastname: string;
  ReferenceID: string;
  createdAt: string;
}

export default function StatusPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [Status, setStatus] = useState<Status[]>([]);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<Status | null>(null);
  const [newStatusName, setNewStatusName] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // 🧩 FETCH Status from API
  const fetchStatus = async () => {
    try {
      const res = await fetch("/api/status");
      const data = await res.json();
      if (data.success) setStatus(data.data);
    } catch (error) {
      console.error("Error fetching status:", error);
    }
  };

  // 🧩 FETCH Profile from API
  const fetchProfile = async () => {
    try {
      // NOTE: Ensure 'userId' is saved in localStorage after login.
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setIsProfileLoading(false);
        return;
      }

      // This calls the API route defined in the next section: /api/profile/[id].ts
      const res = await fetch(`/api/profile/${userId}`);
      const data = await res.json();

      if (res.ok && data.success) setCurrentUser(data.data);
      else console.error("Failed to fetch profile:", data.message);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    fetchProfile();
  }, []);

  // 🧠 SAVE Department (CREATE or UPDATE)
  const handleSaveDepartment = async () => {
    if (!newStatusName.trim()) return alert("Please enter the Status name.");

    try {
      const method = currentStatus ? "PUT" : "POST";
      const url = currentStatus ? `/api/status/${currentStatus._id}` : "/api/status";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newStatusName }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`Status ${currentStatus ? "updated" : "created"} successfully!`);
        fetchStatus();
      } else {
        alert(data.message || `Failed to ${currentStatus ? "update" : "create"} Status.`);
      }
    } catch (error) {
      console.error("Error saving status:", error);
      alert("Something went wrong.");
    }

    setIsStatusDialogOpen(false);
    setNewStatusName("");
    setCurrentStatus(null);
  };

  // 🧠 DELETE Department
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/status/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Status deleted successfully!");
        fetchStatus();
      } else {
        alert(data.message || "Failed to delete Status.");
      }
    } catch (error) {
      console.error("Error deleting Status:", error);
      alert("Something went wrong.");
    }
  };

  const handleEdit = (Stat: Status) => {
    setCurrentStatus(Stat);
    setNewStatusName(Stat.name);
    setIsStatusDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setCurrentStatus(null);
    setNewStatusName("");
    setIsStatusDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    alert("Logged out! Redirect not implemented.");
    // In a real app, you would redirect to the login page
    // window.location.href = "/login"; 
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="text-gray-700">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Status</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center gap-3">
            {/* Profile Dialog */}
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Profile">
                  <User className="h-5 w-5 text-gray-600" />
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[400px] bg-white rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-center">Profile Information</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center mt-4 mb-2">
                  <div className="relative">
                    <img
                      src={profilePic || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                    />
                    <label
                      htmlFor="profile-upload"
                      className="absolute bottom-0 right-0 bg-gray-700 text-white text-xs px-2 py-1 rounded-md cursor-pointer hover:bg-gray-800"
                    >
                      Change
                    </label>
                    <input type="file" id="profile-upload" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </div>
                </div>

                <div className="grid gap-4 py-4 text-sm">
                  {isProfileLoading ? (
                    <p>Loading profile...</p>
                  ) : currentUser ? (
                    <>
                      <div><Label>Full Name:</Label><p className="font-medium">{currentUser.Firstname} {currentUser.Lastname}</p></div>
                      <div><Label>Username:</Label><p className="font-medium">{currentUser.Username}</p></div>
                      <div><Label>Email:</Label><p className="font-medium">{currentUser.Email}</p></div>
                      <div><Label>Role:</Label><p className="font-medium">{currentUser.Role}</p></div>
                      <div><Label>Reference ID:</Label><p className="font-medium">{currentUser.ReferenceID}</p></div>
                      <div><Label>Joined:</Label><p className="font-medium">{formatDate(new Date(currentUser.createdAt))}</p></div>
                    </>
                  ) : (
                    <p className="text-gray-500">Profile not found. Make sure userId is set in localStorage.</p>
                  )}
                </div>
                <DialogFooter className="flex justify-center">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button onClick={handleLogout} variant="secondary" size="icon" className="bg-red-50 text-red-600 hover:bg-red-100" title="Logout">
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* MAIN */}
        <main className="p-6 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <h1 className="text-3xl font-extrabold text-gray-700">Status List</h1>
            <Button onClick={handleOpenAdd} className="bg-gray-700 hover:bg-gray-800 text-white">
              <Plus className="h-5 w-5 mr-2" /> Status
            </Button>
          </div>

          {/* TABLE */}
          <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-700 text-white font-semibold sticky top-0">
                  <tr>
                    <th className="p-4">Status Name</th>
                    <th className="p-4 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Status.length > 0 ? (
                    Status.map((Stat) => (
                      <tr key={Stat._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{Stat.name}</td>
                        <td className="p-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(Stat)} className="text-gray-700 hover:bg-gray-100">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(Stat._id, Stat.name)} className="text-red-600 hover:bg-red-50">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-6 text-center text-gray-500 italic">
                        No Status found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* ADD/EDIT DIALOG */}
        <Dialog
          open={isStatusDialogOpen}
          onOpenChange={(open) => {
            setIsStatusDialogOpen(open);
            if (!open) {
              setCurrentStatus(null);
              setNewStatusName("");
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {currentStatus ? "Edit Status" : "Add New Status"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="statName" className="text-right">
                  Name
                </Label>
                <Input
                  id="statName"
                  value={newStatusName}
                  onChange={(e) => setNewStatusName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Pending"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveDepartment} className="bg-gray-700 hover:bg-gray-800">
                {currentStatus ? "Save Changes" : "Create Status"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}