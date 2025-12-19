"use client";

import { useState, useEffect } from "react";
// I-assume na ito ang tamang path para sa iyong sidebar
import { AppSidebar } from "../components/sidebar";
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
  BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset, SidebarProvider, SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  User, LogOut, Plus, Edit, Trash2, MoreHorizontal, Loader2 
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Interface para sa Group (MongoDB Structure) ---
interface Group {
  _id: string; // Pinalitan ang 'id' ng '_id' para tumugma sa MongoDB
  name: string;
}

// 📌 INAYOS: Current User Interface (Tulad ng sa ModePage)
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

// 📌 INAYOS: formatDate function (Tulad ng sa ModePage)
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });


// --- Main Component ---
export default function GroupPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // 📌 INAYOS: State para sa User Profile
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // State para sa Groups
  const [groups, setGroups] = useState<Group[]>([]);
  
  // State para sa Add/Edit Dialog
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState("");

  const [isSaving, setIsSaving] = useState(false); // Para sa loading state ng Save button
  const [isLoading, setIsLoading] = useState(true); // Para sa loading state ng table

  // 📌 INAYOS: handleLogout (Kasama ang pagtanggal ng userId)
  const handleLogout = () => {
    localStorage.removeItem("userId");
    alert("Logged out! Redirect logic not implemented.");
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  // 🧩 FETCH Groups from API (Dynamic Data Loading)
  const fetchGroups = async () => { 
    setIsLoading(true);
    try {
      const res = await fetch("/api/group"); 
      const data = await res.json();
      if (res.ok && data.success) {
        setGroups(data.data); 
      } else {
        console.error("Failed to fetch groups:", data.message);
        alert(`Failed to load groups: ${data.message}`);
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
      alert("Network error while fetching groups.");
    } finally {
        setIsLoading(false);
    }
  };

  // 📌 INAYOS: FETCH Profile from API function (Tulad ng sa ModePage)
  const fetchProfile = async () => {
    setIsProfileLoading(true);
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        // Dummy data kung walang userId. Palitan ng actual logic/redirect.
        setCurrentUser({
            _id: "dummy-admin-id",
            Username: "super.admin",
            Email: "admin@example.com",
            Role: "Administrator",
            Firstname: "Super",
            Lastname: "Admin",
            ReferenceID: "REF-0000",
            createdAt: new Date().toISOString()
        });
        setIsProfileLoading(false);
        return;
      }

      // Ito ang magco-call sa actual API: /api/profile/[id].ts
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
    fetchGroups(); 
    // 📌 INAYOS: Pagtawag sa fetchProfile
    fetchProfile();
  }, []); // I-fetch ang data kapag nag-load ang component

  // 🧠 SAVE Group (CREATE or UPDATE)
  const handleSaveGroup = async () => {
    const trimmedName = newGroupName.trim();

    if (!trimmedName) {
      alert("Please enter the group name.");
      return;
    }

    setIsSaving(true);

    try {
      const method = currentGroup ? "PUT" : "POST";
      const url = currentGroup
        ? `/api/group/${currentGroup._id}`
        : "/api/group";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message || `Group ${currentGroup ? "updated" : "created"} successfully!`);
        fetchGroups(); // I-refresh ang data matapos ang successful operation
      } else {
        alert(data.message || `Failed to ${currentGroup ? "update" : "create"} Group.`);
      }
    } catch (error) {
      console.error("Error saving group:", error);
      alert("Something went wrong with the network/server.");
    } finally {
      setIsSaving(false);
      // Reset and Close
      setIsGroupDialogOpen(false);
      setCurrentGroup(null);
      setNewGroupName("");
    }
  };

  // 🧠 DELETE Group
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete Group "${name}"? This action cannot be undone.`)) return; 

    try {
      const res = await fetch(`/api/group/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Group deleted successfully!");
        fetchGroups(); // I-refresh ang data
      } else {
        alert(data.message || "Failed to delete Group.");
      }
    } catch (error) {
      console.error("Error deleting group:", error);
      alert("Something went wrong while deleting the group.");
    }
  };

  const handleEdit = (group: Group) => {
    setCurrentGroup(group);
    setNewGroupName(group.name);
    setIsGroupDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setCurrentGroup(null);
    setNewGroupName("");
    setIsGroupDialogOpen(true);
  };

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
                  <BreadcrumbLink href="/dashboard" className="text-gray-700">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Groups</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
  <h1 className="text-3xl font-extrabold text-gray-700 mb-4 md:mb-0">
    Group List
  </h1>

  <Button 
    onClick={handleOpenAdd}
    className="bg-gray-700 hover:bg-gray-800 text-white"
  >
    <Plus className="h-5 w-5 mr-2" /> Group
  </Button>
</div>


          {/* GROUP TABLE */}
          <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-700 text-white font-semibold sticky top-0">
                  <tr>
                    <th className="p-4">Group Name</th>
                    <th className="p-4 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={2} className="p-6 text-center text-gray-500"><Loader2 className="h-5 w-5 animate-spin inline-block mr-2" /> Loading groups...</td></tr>
                  ) : groups.length > 0 ? (
                    groups.map((group) => (
                      <tr key={group._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{group.name}</td>
                        <td className="p-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="cursor-pointer text-gray-700 hover:bg-gray-100"
                                onClick={() => handleEdit(group)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(group._id, group.name)}
                              >
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
                        No groups found. Click "+ Group" to add one.
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
            open={isGroupDialogOpen} 
            onOpenChange={(open) => {
              setIsGroupDialogOpen(open);
              if (!open) {
                setCurrentGroup(null);
                setNewGroupName("");
              }
            }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {currentGroup ? "Edit Group" : "Add New Group"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="groupName" className="text-right">Name</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Network Services"
                  disabled={isSaving}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSaving) handleSaveGroup();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
              <Button onClick={handleSaveGroup} className="bg-gray-700 hover:bg-gray-800" disabled={isSaving}>
                {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {currentGroup ? "Saving Changes..." : "Creating Group..."}</>
                ) : (
                    currentGroup ? "Save Changes" : "Create Group"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </SidebarInset>
    </SidebarProvider>
  );
}