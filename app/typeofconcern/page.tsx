"use client";

import { useState, useEffect } from "react";
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
import { User, LogOut, Plus, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react"; 
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
import { useRouter } from "next/navigation";
// Interfaces
interface ConcernType {
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

// --- Main Component ---
export default function ConcernTypesPage() { 
    const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/login"); // Redirect kung walang login
    }
  }, []);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  const [concernTypes, setConcernTypes] = useState<ConcernType[]>([]);
  const [isConcernTypeDialogOpen, setIsConcernTypeDialogOpen] = useState(false);
  const [currentConcernType, setCurrentConcernType] = useState<ConcernType | null>(null);
  const [newConcernTypeName, setNewConcernTypeName] = useState("");
  
  const [isSaving, setIsSaving] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // 🧩 FETCH Concern Types from API
  const fetchConcernTypes = async () => { 
    setIsLoading(true);
    try {
      const res = await fetch("/api/typeofconcern"); 
      const data = await res.json();
      if (res.ok && data.success) {
        setConcernTypes(data.data); 
      } else {
        console.error("Failed to fetch concern types:", data.message);
      }
    } catch (error) {
      console.error("Error fetching concern types:", error);
    } finally {
        setIsLoading(false);
    }
  };

  // 🧩 FETCH Profile from API
  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setIsProfileLoading(false);
        return;
      }

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
    fetchConcernTypes(); 
    fetchProfile();
  }, []);

  // 🧠 SAVE Concern Type (CREATE or UPDATE)
  const handleSaveConcernType = async () => { 
    if (!newConcernTypeName.trim())
      return alert("Please enter the Type of Concern name.");

    setIsSaving(true);

    try {
      const method = currentConcernType ? "PUT" : "POST"; 
      const url = currentConcernType
        ? `/api/typeofconcern/${currentConcernType._id}`
        : "/api/typeofconcern";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newConcernTypeName.trim() }), 
      });
      const data = await res.json();

      if (data.success) {
        alert(
          `Type of Concern ${
            currentConcernType ? "updated" : "created"
          } successfully!`
        );
        fetchConcernTypes(); 
      } else {
        alert(
          data.message ||
            `Failed to ${
              currentConcernType ? "update" : "create"
            } Type of Concern.`
        );
      }
    } catch (error) {
      console.error("Error saving concern type:", error); 
      alert("Something went wrong.");
    } finally {
        setIsSaving(false);
    }

    setIsConcernTypeDialogOpen(false); 
    setNewConcernTypeName(""); 
    setCurrentConcernType(null); 
  };

  // 🧠 DELETE Concern Type
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete Type of Concern "${name}"? This action cannot be undone.`)) return; 

    try {
      const res = await fetch(`/api/typeofconcern/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Type of Concern deleted successfully!"); 
        fetchConcernTypes(); 
      } else {
        alert(data.message || "Failed to delete Type of Concern."); 
      }
    } catch (error) {
      console.error("Error deleting concern type:", error); 
      alert("Something went wrong.");
    }
  };

  const handleEdit = (type: ConcernType) => { 
    setCurrentConcernType(type);
    setNewConcernTypeName(type.name);
    setIsConcernTypeDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setCurrentConcernType(null);
    setNewConcernTypeName("");
    setIsConcernTypeDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    alert("Logged out! Redirect not implemented.");
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
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

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
                  <BreadcrumbPage>Type of Concern</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* MAIN */}
        <main className="p-6 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
  <h1 className="text-3xl font-extrabold text-gray-700 mb-4 md:mb-0">
    Type of Concerns List
  </h1>
  <Button
    onClick={handleOpenAdd}
    className="bg-gray-700 hover:bg-gray-800 text-white"
  >
    <Plus className="h-5 w-5 mr-2" /> Type of Concern
  </Button>
</div>


          {/* TABLE */}
          <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              {/* WALANG WHITESPACE DITO */}
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-700 text-white font-semibold sticky top-0">
                  <tr><th className="p-4">Type of Concern Name</th><th className="p-4 text-center w-[100px]">Action</th></tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={2} className="p-6 text-center text-gray-500"><Loader2 className="h-5 w-5 animate-spin inline-block mr-2" /> Loading concern types...</td></tr>
                  ) : concernTypes.length > 0 ? (
                    concernTypes.map((type) => (
                      <tr key={type._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{type.name}</td>
                        <td className="p-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => handleEdit(type)}
                                className="text-gray-700 hover:bg-gray-100 cursor-pointer"
                              ><Edit className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleDelete(type._id, type.name)}
                                className="text-red-600 hover:bg-red-50 cursor-pointer"
                              ><Trash2 className="mr-2 h-4 w-4" /> Delete</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={2} className="p-6 text-center text-gray-500 italic">No concern types found. Click "+ Type of Concern" to add one.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* ADD/EDIT DIALOG */}
        <Dialog
          open={isConcernTypeDialogOpen} 
          onOpenChange={(open) => {
            setIsConcernTypeDialogOpen(open);
            if (!open) {
              setCurrentConcernType(null);
              setNewConcernTypeName("");
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {currentConcernType ? "Edit Type of Concern" : "Add New Type of Concern"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="concernTypeName" className="text-right">Name</Label>
                <Input
                  id="concernTypeName"
                  value={newConcernTypeName} 
                  onChange={(e) => setNewConcernTypeName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Network"
                  disabled={isSaving}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
              <Button onClick={handleSaveConcernType} className="bg-gray-700 hover:bg-gray-800" disabled={isSaving}>
                {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {currentConcernType ? "Saving Changes..." : "Creating Concern Type..."}</>
                ) : (
                    currentConcernType ? "Save Changes" : "Create Type of Concern"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}