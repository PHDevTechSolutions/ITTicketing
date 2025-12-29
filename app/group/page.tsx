"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Plus, Edit, Trash2, MoreHorizontal, Loader2 
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Interface para sa Group (MongoDB Structure) ---
interface Group {
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

export default function GroupPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false); // 🔥 Fix for Hydration Error

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  // States
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [groups, setGroups] = useState<Group[]>([]);
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<Group | null>(null);
  const [newGroupName, setNewGroupName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🧩 FETCH Functions
  const fetchGroups = async () => { 
    setIsLoading(true);
    try {
      const res = await fetch("/api/group"); 
      const data = await res.json();
      if (res.ok && data.success) {
        setGroups(data.data); 
      }
    } catch (error) {
      console.error("Error fetching groups:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const res = await fetch(`/api/profile/${userId}`);
      const data = await res.json();
      if (res.ok && data.success) setCurrentUser(data.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  useEffect(() => {
    fetchGroups(); 
    fetchProfile();
  }, []);

  // 🧠 Handlers
  const handleSaveGroup = async () => {
    const trimmedName = newGroupName.trim();
    if (!trimmedName) return alert("Please enter the group name.");

    setIsSaving(true);
    try {
      const method = currentGroup ? "PUT" : "POST";
      const url = currentGroup ? `/api/group/${currentGroup._id}` : "/api/group";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`Group ${currentGroup ? "updated" : "created"} successfully!`);
        fetchGroups();
      } else {
        alert(data.message || "Failed to save group.");
      }
    } catch (error) {
      console.error("Error saving group:", error);
    } finally {
      setIsSaving(false);
      setIsGroupDialogOpen(false);
      setCurrentGroup(null);
      setNewGroupName("");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete Group "${name}"?`)) return; 

    try {
      const res = await fetch(`/api/group/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Group deleted successfully!");
        fetchGroups();
      }
    } catch (error) {
      console.error("Error deleting group:", error);
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

  // 🔥 Hydration Guard
  if (!mounted) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="dark:bg-zinc-950 transition-colors">
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white dark:bg-zinc-950 dark:border-zinc-800 px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="dark:text-zinc-400" />
            <Separator orientation="vertical" className="h-6 dark:bg-zinc-800" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="dark:text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="dark:text-zinc-100">Groups</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 bg-[#f7f8fa] dark:bg-zinc-950 min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
            <h1 className="text-3xl font-extrabold text-gray-700 dark:text-zinc-100 mb-4 md:mb-0">
              Group List
            </h1>
            <Button 
              onClick={handleOpenAdd}
              className="bg-gray-700 hover:bg-gray-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
            >
              <Plus className="h-5 w-5 mr-2" /> Group
            </Button>
          </div>

          {/* GROUP TABLE */}
          <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-700 dark:bg-zinc-800 text-white font-semibold sticky top-0">
                  <tr>
                    <th className="p-4">Group Name</th>
                    <th className="p-4 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800">
                  {isLoading ? (
                    <tr>
                      <td colSpan={2} className="p-6 text-center text-gray-500 dark:text-zinc-400">
                        <Loader2 className="h-5 w-5 animate-spin inline-block mr-2" /> Loading...
                      </td>
                    </tr>
                  ) : groups.length > 0 ? (
                    groups.map((group) => (
                      <tr key={group._id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4 font-medium text-gray-800 dark:text-zinc-200">{group.name}</td>
                        <td className="p-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0 dark:text-zinc-400">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="dark:bg-zinc-900 dark:border-zinc-800">
                              <DropdownMenuLabel className="dark:text-zinc-400">Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator className="dark:bg-zinc-800" />
                              <DropdownMenuItem 
                                className="cursor-pointer dark:text-zinc-300 dark:hover:bg-zinc-800"
                                onClick={() => handleEdit(group)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 dark:text-red-400 dark:hover:bg-red-950/30"
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
                      <td colSpan={2} className="p-6 text-center text-gray-500 dark:text-zinc-500 italic">
                        No groups found. Click "+ Group" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main> 
        
        {/* DIALOG */}
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
          <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                {currentGroup ? "Edit Group" : "Add New Group"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="groupName" className="text-right text-sm font-medium dark:text-zinc-300">Name :</Label>
                <Input
                  id="groupName"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="col-span-3 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                  placeholder="e.g., Network Services"
                  disabled={isSaving}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSaving) handleSaveGroup();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="dark:border-zinc-800 dark:text-zinc-300" disabled={isSaving}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveGroup} className="bg-gray-700 hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-950" disabled={isSaving}>
                {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
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