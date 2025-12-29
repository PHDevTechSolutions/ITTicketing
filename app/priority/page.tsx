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
  User, LogOut, Plus, Edit, Trash2, MoreHorizontal, Loader2 // Idinagdag ang Loader2
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
import { useRouter } from "next/navigation";

// --- Interface para sa Priority (MongoDB Structure) ---
interface Priority {
  _id: string; // Pinalitan ang 'id' ng '_id' para tumugma sa MongoDB
  name: string; // Ang pangalan ng Priority (e.g., High, Medium, Low)
}

// 📌 INAYOS: Current User Interface (Mas Kumpleto)
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

// 📌 INAYOS: formatDate function
const formatDate = (date: Date) =>
  new Date(date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });


// --- Main Component ---
export default function PriorityPage() { // Pinalitan ang function name sa PriorityPage
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/login"); // Redirect kung walang login
    }
  }, []);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // 📌 INAYOS: States para sa User Profile
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // State para sa Priorities
  const [priorities, setPriorities] = useState<Priority[]>([]);
  
  // State para sa Add/Edit Dialog
  const [isPriorityDialogOpen, setIsPriorityDialogOpen] = useState(false);
  const [currentPriority, setCurrentPriority] = useState<Priority | null>(null);
  const [newPriorityName, setNewPriorityName] = useState("");

  const [isSaving, setIsSaving] = useState(false); // Para sa loading state ng Save button
  const [isLoading, setIsLoading] = useState(true); // Para sa loading state ng table

  // 📌 INAYOS: handleLogout (Kasama ang pagtanggal ng userId)
  const handleLogout = () => {
    localStorage.removeItem("userId"); // Tiyakin na tinatanggal ang userId
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

  // 🧩 FETCH Priorities from API (Dynamic Data Loading)
  const fetchPriorities = async () => { 
    setIsLoading(true);
    try {
      // I-assume na ang iyong API route ay `/api/priority` (o `/api/priorities`)
      const res = await fetch("/api/priority"); 
      const data = await res.json();
      if (res.ok && data.success) {
        setPriorities(data.data); 
      } else {
        console.error("Failed to fetch priorities:", data.message);
        // Wala munang alert para mas smooth ang initial load, pero ini-log pa rin sa console
      }
    } catch (error) {
      console.error("Error fetching priorities:", error);
      // Wala munang alert
    } finally {
        setIsLoading(false);
    }
  };

  // 📌 BAGONG FUNCTION: FETCH Profile from API
  const fetchProfile = async () => {
    setIsProfileLoading(true);
    try {
        const userId = localStorage.getItem("userId");
        if (!userId) {
            // Gumamit ng dummy data kung walang userId, para hindi mag-crash
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

  // I-fetch ang data kapag nag-load ang component
  useEffect(() => {
    fetchPriorities(); 
    fetchProfile(); // 📌 Idinagdag ang pag-fetch ng profile
  }, []); 

  // 🧠 SAVE Priority (CREATE or UPDATE)
  const handleSavePriority = async () => {
    const trimmedName = newPriorityName.trim();

    if (!trimmedName) {
      alert("Please enter the priority name.");
      return;
    }

    setIsSaving(true);

    try {
      const method = currentPriority ? "PUT" : "POST";
      const url = currentPriority
        ? `/api/priority/${currentPriority._id}` // I-assume na mayroong API route na gumagamit ng ID
        : "/api/priority";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message || `Priority ${currentPriority ? "updated" : "created"} successfully!`);
        fetchPriorities(); // I-refresh ang data matapos ang successful operation
      } else {
        alert(data.message || `Failed to ${currentPriority ? "update" : "create"} Priority.`);
      }
    } catch (error) {
      console.error("Error saving priority:", error);
      alert("Something went wrong with the network/server.");
    } finally {
      setIsSaving(false);
      // Reset and Close
      setIsPriorityDialogOpen(false);
      setCurrentPriority(null);
      setNewPriorityName("");
    }
  };

  // 🧠 DELETE Priority
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete Priority "${name}"? This action cannot be undone.`)) return; 

    try {
      // I-assume na ang iyong API route ay `/api/priority/[id].ts`
      const res = await fetch(`/api/priority/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Priority deleted successfully!");
        fetchPriorities(); // I-refresh ang data
      } else {
        alert(data.message || "Failed to delete Priority.");
      }
    } catch (error) {
      console.error("Error deleting priority:", error);
      alert("Something went wrong while deleting the priority.");
    }
  };

  const handleEdit = (priority: Priority) => {
    setCurrentPriority(priority);
    setNewPriorityName(priority.name);
    setIsPriorityDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setCurrentPriority(null);
    setNewPriorityName("");
    setIsPriorityDialogOpen(true);
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
                  <BreadcrumbPage>Priorities</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
         <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
  <h1 className="text-3xl font-extrabold text-gray-700 mb-4 md:mb-0">
    Priority List
  </h1>

  <Button 
    onClick={handleOpenAdd}
    className="bg-gray-700 hover:bg-gray-800 text-white"
  >
    <Plus className="h-5 w-5 mr-2" /> Priority
  </Button>
</div>


          {/* PRIORITY TABLE */}
          <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-700 text-white font-semibold sticky top-0">
                  <tr>
                    <th className="p-4">Priority Name</th>
                    <th className="p-4 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={2} className="p-6 text-center text-gray-500"><Loader2 className="h-5 w-5 animate-spin inline-block mr-2" /> Loading priorities...</td></tr>
                  ) : priorities.length > 0 ? (
                    priorities.map((priority) => (
                      <tr key={priority._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{priority.name}</td>
                        <td className="p-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-2 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="cursor-pointer text-gray-700 hover:bg-gray-100"
                                onClick={() => handleEdit(priority)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(priority._id, priority.name)}
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
                        No priorities found. Click "+ Priority" to add one.
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
            open={isPriorityDialogOpen} 
            onOpenChange={(open) => {
              setIsPriorityDialogOpen(open);
              if (!open) {
                setCurrentPriority(null);
                setNewPriorityName("");
              }
            }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {currentPriority ? "Edit Priority" : "Add New Priority"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priorityName" className="text-right text-lg ml-3">Name :</Label>
                <Input
                  id="priorityName"
                  value={newPriorityName}
                  onChange={(e) => setNewPriorityName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., High, Medium, Low"
                  disabled={isSaving}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSaving) handleSavePriority();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline" disabled={isSaving}>Cancel</Button></DialogClose>
              <Button onClick={handleSavePriority} className="bg-gray-700 hover:bg-gray-800" disabled={isSaving}>
                {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> {currentPriority ? "Saving Changes..." : "Creating Priority..."}</>
                ) : (
                    currentPriority ? "Save Changes" : "Create Priority"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </SidebarInset>
    </SidebarProvider>
  );
}