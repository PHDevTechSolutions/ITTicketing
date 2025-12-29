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
import { useRouter } from "next/navigation";
// Interfaces
interface Technician {
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

export default function TechnicianPage() {
    const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/login"); // Redirect kung walang login
    }
  }, []);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [Technician, setTechnician] = useState<Technician[]>([]);
  const [isTechnicianDialogOpen, setIsTechnicianDialogOpen] = useState(false);
  const [currentTechnician, setCurrentTechnician] = useState<Technician | null>(null);
  const [newTechnicianName, setNewTechnicianName] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // 🧩 FETCH Status from API
  const fetchTechnician = async () => {
    try {
      const res = await fetch("/api/technician");
      const data = await res.json();
      if (data.success) setTechnician(data.data);
    } catch (error) {
      console.error("Error fetching technician:", error);
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
    fetchTechnician();
    fetchProfile();
  }, []);

  // 🧠 SAVE Department (CREATE or UPDATE)
  const handleSaveDepartment = async () => {
    if (!newTechnicianName.trim()) return alert("Please enter the Technician name.");

    try {
      const method = currentTechnician ? "PUT" : "POST";
      const url = currentTechnician ? `/api/technician/${currentTechnician._id}` : "/api/technician";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTechnicianName }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`Technician ${currentTechnician ? "updated" : "created"} successfully!`);
        fetchTechnician();
      } else {
        alert(data.message || `Failed to ${currentTechnician ? "update" : "create"} Technician.`);
      }
    } catch (error) {
      console.error("Error saving Technician:", error);
      alert("Something went wrong.");
    }

    setIsTechnicianDialogOpen(false);
    setNewTechnicianName("");
    setCurrentTechnician(null);
  };

  // 🧠 DELETE Department
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      const res = await fetch(`/api/technician/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Technician deleted successfully!");
        fetchTechnician();
      } else {
        alert(data.message || "Failed to delete Technician.");
      }
    } catch (error) {
      console.error("Error deleting Technician:", error);
      alert("Something went wrong.");
    }
  };

  const handleEdit = (Stat: Technician) => {
    setCurrentTechnician(Stat);
    setNewTechnicianName(Stat.name);
    setIsTechnicianDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setCurrentTechnician(null);
    setNewTechnicianName("");
    setIsTechnicianDialogOpen(true);
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
                  <BreadcrumbPage>Technician</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

        </header>

        {/* MAIN */}
        <main className="p-6 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
<div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
  <h1 className="text-3xl font-extrabold text-gray-700 mb-4 md:mb-0">
    Technician's List
  </h1>

  <Button onClick={handleOpenAdd} className="bg-gray-700 hover:bg-gray-800 text-white">
    <Plus className="h-5 w-5 mr-2" /> Technician
  </Button>
</div>


          {/* TABLE */}
          <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-700 text-white font-semibold sticky top-0">
                  <tr>
                    <th className="p-4">Technician Name</th>
                    <th className="p-4 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {Technician.length > 0 ? (
                    Technician.map((Tech) => (
                      <tr key={Tech._id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{Tech.name}</td>
                        <td className="p-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-2 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleEdit(Tech)} className="text-gray-700 hover:bg-gray-100">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(Tech._id, Tech.name)} className="text-red-600 hover:bg-red-50">
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
                        No Technician found.
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
          open={isTechnicianDialogOpen}
          onOpenChange={(open) => {
            setIsTechnicianDialogOpen(open);
            if (!open) {
              setCurrentTechnician(null);
              setNewTechnicianName("");
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {currentTechnician ? "Edit Technician" : "Add New Technician"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="statName" className="text-right text-lg ml-3">
                  Name :
                </Label>
                <Input
                  id="statName"
                  value={newTechnicianName}
                  onChange={(e) => setNewTechnicianName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., Joel"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveDepartment} className="bg-gray-700 hover:bg-gray-800">
                {currentTechnician ? "Save Changes" : "Create Technician"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}