"use client";

import { useState, useEffect } from "react";
// I-assume na ito ang tamang path para sa iyong sidebar
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
import {
  User,
  LogOut,
  Plus,
  Edit,
  Trash2,
  MoreHorizontal,
  Loader2, // Idinagdag para sa Loading UI
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
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

// --- Interface para sa Mode ---
interface Mode {
  _id: string; // Gamitin ang _id para sa MongoDB
  name: string; // Ang pangalan ng Mode (e.g., Online, Walk-in)
}

// 📌 KULANG #1: Interface para sa CurrentUser
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

// 📌 KULANG #2: formatDate function
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });


// --- Main Component ---
export default function ModePage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // 📌 KULANG #3: States para sa User Profile
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // State para sa Modes
  const [modes, setModes] = useState<Mode[]>([]);

  // State para sa Add/Edit Dialog
  const [isModeDialogOpen, setIsModeDialogOpen] = useState(false);
  const [currentMode, setCurrentMode] = useState<Mode | null>(null);
  const [newModeName, setNewModeName] = useState("");

  // State para sa API operations
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 🧩 FETCH Modes from API
  const fetchModes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/mode"); // Gagamit ng /api/mode/index.ts (GET)
      const data = await res.json();
      if (res.ok && data.success) {
        setModes(data.data);
      } else {
        console.error("Failed to fetch modes:", data.message);
      }
    } catch (error) {
      console.error("Error fetching modes:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 📌 KULANG #4: FETCH Profile from API function
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
    fetchModes();
    // 📌 KULANG #5: Pagtawag sa fetchProfile
    fetchProfile(); 
  }, []);

  // 🧠 SAVE Mode (CREATE or UPDATE)
  const handleSaveMode = async () => {
    if (!newModeName.trim()) {
      alert("Please enter the mode name.");
      return;
    }

    setIsSaving(true);
    const trimmedName = newModeName.trim();

    try {
      const method = currentMode ? "PUT" : "POST";
      const url = currentMode ? `/api/mode/${currentMode._id}` : "/api/mode";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const data = await res.json();

      if (data.success) {
        alert(
          `Mode ${currentMode ? "updated" : "created"} successfully!`
        );
        fetchModes(); // I-refresh ang listahan
      } else {
        alert(
          data.message ||
            `Failed to ${currentMode ? "update" : "create"} Mode.`
        );
      }
    } catch (error) {
      console.error("Error saving mode:", error);
      alert("Something went wrong while communicating with the server.");
    } finally {
      setIsSaving(false);
    }

    // Reset and Close
    setIsModeDialogOpen(false);
    setCurrentMode(null);
    setNewModeName("");
  };

  // 🧠 DELETE Mode
  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Are you sure you want to delete Mode "${name}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/mode/${id}`, { method: "DELETE" }); 
      const data = await res.json();

      if (data.success) {
        alert("Mode deleted successfully!");
        fetchModes(); // I-refresh ang listahan
      } else {
        alert(data.message || "Failed to delete Mode.");
      }
    } catch (error) {
      console.error("Error deleting mode:", error);
      alert("Something went wrong while communicating with the server.");
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

  // --- Other handlers ---
  const handleLogout = () => {
    localStorage.removeItem("userId"); // Idinagdag ang pagtanggal ng userId
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
  // --- End Other handlers ---

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
                  <BreadcrumbPage>Mode</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
  <h1 className="text-3xl font-extrabold text-gray-700 mb-4 md:mb-0">
    Mode List
  </h1>

  {/* ADD MODE BUTTON */}
  <Button
    onClick={handleOpenAdd}
    className="bg-gray-700 hover:bg-gray-800 text-white"
  >
    <Plus className="h-5 w-5 mr-2" /> Mode
  </Button>
</div>


          {/* MODE TABLE */}
          <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-700 text-white font-semibold sticky top-0">
                  <tr><th className="p-4">Mode Name</th><th className="p-4 text-center w-[100px]">Action</th></tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={2} className="p-6 text-center text-gray-500"><Loader2 className="h-5 w-5 animate-spin inline-block mr-2" /> Loading modes...</td></tr>
                  ) : modes.length > 0 ? (
                    modes.map((mode) => (
                      <tr key={mode._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{mode.name}</td>
                        <td className="p-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0"><span className="sr-only">Open menu</span><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="cursor-pointer text-gray-700 hover:bg-gray-100"
                                onClick={() => handleEdit(mode)}
                              ><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(mode._id, mode.name)}
                              ><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={2} className="p-6 text-center text-gray-500 italic">No modes found. Click "+ Mode" to add one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </main>

        {/* ADD/EDIT DIALOG */}
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
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {currentMode ? "Edit Mode" : "Add New Mode"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="modeName" className="text-right">Name</Label>
                <Input
                  id="modeName"
                  value={newModeName}
                  onChange={(e) => setNewModeName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Walk in, Phone Call"
                  disabled={isSaving} // I-disable habang nagse-save
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
              <Button onClick={handleSaveMode} className="bg-gray-700 hover:bg-gray-800" disabled={isSaving}>
                {isSaving ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {currentMode ? "Saving Changes..." : "Creating Mode..."}</>
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