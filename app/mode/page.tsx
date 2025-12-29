"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "../components/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Interfaces
interface Mode {
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

export default function ModePage() {
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
  const [modes, setModes] = useState<Mode[]>([]);
  const [isModeDialogOpen, setIsModeDialogOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode | null>(null);
  const [newModeName, setNewModeName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // 🧩 FETCH Functions
  const fetchModes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/mode");
      const data = await res.json();
      if (res.ok && data.success) {
        setModes(data.data);
      }
    } catch (error) {
      console.error("Error fetching modes:", error);
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
    fetchModes();
    fetchProfile();
  }, []);

  // 🧠 Handlers
  const handleSaveMode = async () => {
    if (!newModeName.trim()) return alert("Please enter the mode name.");

    setIsSaving(true);
    try {
      const method = currentMode ? "PUT" : "POST";
      const url = currentMode ? `/api/mode/${currentMode._id}` : "/api/mode";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newModeName.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`Mode ${currentMode ? "updated" : "created"} successfully!`);
        fetchModes();
      } else {
        alert(data.message || "Failed to save mode.");
      }
    } catch (error) {
      console.error("Error saving mode:", error);
    } finally {
      setIsSaving(false);
      setIsModeDialogOpen(false);
      setCurrentMode(null);
      setNewModeName("");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete Mode "${name}"?`)) return;
    try {
      const res = await fetch(`/api/mode/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Mode deleted successfully!");
        fetchModes();
      }
    } catch (error) {
      console.error("Error deleting mode:", error);
    }
  };

  const handleEdit = (mode: Mode) => {
    setCurrentMode(mode);
    setNewModeName(mode.name);
    setIsModeDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setCurrentMode(null);
    setNewModeName("");
    setIsModeDialogOpen(true);
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
                  <BreadcrumbLink href="/dashboard" className="text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-200">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="dark:text-zinc-600" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="dark:text-zinc-100">Mode</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 bg-[#f7f8fa] dark:bg-zinc-950 min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
            <h1 className="text-3xl font-extrabold text-gray-700 dark:text-zinc-100 mb-4 md:mb-0">
              Mode List
            </h1>
            <Button
              onClick={handleOpenAdd}
              className="bg-gray-700 hover:bg-gray-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
            >
              <Plus className="h-5 w-5 mr-2" /> Mode
            </Button>
          </div>

          {/* MODE TABLE */}
          <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-700 dark:bg-zinc-800 text-white font-semibold sticky top-0">
                  <tr>
                    <th className="p-4">Mode Name</th>
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
                  ) : modes.length > 0 ? (
                    modes.map((mode) => (
                      <tr key={mode._id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4 font-medium text-gray-800 dark:text-zinc-200">{mode.name}</td>
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
                                onClick={() => handleEdit(mode)}
                                className="cursor-pointer dark:text-zinc-300 dark:hover:bg-zinc-800"
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(mode._id, mode.name)}
                                className="text-red-600 dark:text-red-400 cursor-pointer dark:hover:bg-red-950/30"
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
                        No modes found. Click "+ Mode" to add one.
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
          open={isModeDialogOpen}
          onOpenChange={(open) => {
            setIsModeDialogOpen(open);
            if (!open) {
              setCurrentMode(null);
              setNewModeName("");
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                {currentMode ? "Edit Mode" : "Add New Mode"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modeName" className="text-right text-sm font-medium dark:text-zinc-300">Name :</Label>
                <Input
                  id="modeName"
                  value={newModeName}
                  onChange={(e) => setNewModeName(e.target.value)}
                  className="col-span-3 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                  placeholder="e.g., Walk in"
                  disabled={isSaving}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="dark:border-zinc-800 dark:text-zinc-300" disabled={isSaving}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveMode} className="bg-gray-700 hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-950" disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                  currentMode ? "Save Changes" : "Create Mode"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}