"use client";

import { useState, useEffect } from "react";
// Assuming you have these components configured
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
import { User, LogOut, Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
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

// Interfaces (Updated for RequestType and kept CurrentUser)
interface RequestType {
  _id: string; // Gamitin ang _id para sa MongoDB consistency
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
export default function RequestTypesPage() {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [profilePic, setProfilePic] = useState<string | null>(null);

  // State para sa Request Types (pinalitan ang 'departments' ng 'requestTypes')
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [isRequestTypeDialogOpen, setIsRequestTypeDialogOpen] = useState(false);
  const [currentRequestType, setCurrentRequestType] =
    useState<RequestType | null>(null);
  const [newRequestTypeName, setNewRequestTypeName] = useState("");

  // State para sa Profile
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // 🧩 FETCH Request Types from API
  const fetchRequestTypes = async () => {
    try {
      // 🎯 API path: /api/requesttype (index.ts)
      const res = await fetch("/api/requesttype"); 
      const data = await res.json();
      if (data.success) setRequestTypes(data.data);
    } catch (error) {
      console.error("Error fetching request types:", error);
    }
  };

  // 🧩 FETCH Profile from API (Kinuha mula sa DepartmentsPage)
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
    fetchRequestTypes(); // 🎯 Inilipat mula fetchDepartments
    fetchProfile();
  }, []);

  // 🧠 SAVE Request Type (CREATE or UPDATE)
  const handleSaveRequestType = async () => {
    if (!newRequestTypeName.trim())
      return alert("Please enter the Request Type name.");

    try {
      const method = currentRequestType ? "PUT" : "POST";
      // 🎯 API path: /api/requesttype/[id].ts o /api/requesttype/index.ts
      const url = currentRequestType
        ? `/api/requesttype/${currentRequestType._id}`
        : "/api/requesttype";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newRequestTypeName.trim() }),
      });
      const data = await res.json();

      if (data.success) {
        alert(
          `Request Type ${
            currentRequestType ? "updated" : "created"
          } successfully!`
        );
        fetchRequestTypes(); // I-refresh ang list
      } else {
        alert(
          data.message ||
            `Failed to ${
              currentRequestType ? "update" : "create"
            } request type.`
        );
      }
    } catch (error) {
      console.error("Error saving request type:", error);
      alert("Something went wrong.");
    }

    setIsRequestTypeDialogOpen(false);
    setNewRequestTypeName("");
    setCurrentRequestType(null);
  };

  // 🧠 DELETE Request Type
  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;

    try {
      // 🎯 API path: /api/requesttype/[id].ts
      const res = await fetch(`/api/requesttype/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Request Type deleted successfully!");
        fetchRequestTypes(); // I-refresh ang list
      } else {
        alert(data.message || "Failed to delete request type.");
      }
    } catch (error) {
      console.error("Error deleting request type:", error);
      alert("Something went wrong.");
    }
  };

  const handleEdit = (type: RequestType) => {
    setCurrentRequestType(type);
    setNewRequestTypeName(type.name);
    setIsRequestTypeDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setCurrentRequestType(null);
    setNewRequestTypeName("");
    setIsRequestTypeDialogOpen(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("userId");
    alert("Logged out! Redirect not implemented.");
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
                  <BreadcrumbLink href="/dashboard" className="text-gray-700">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  {/* 🎯 Binago ang text */}
                  <BreadcrumbPage>Request Type</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>


        </header>

        {/* MAIN */}
        <main className="p-6 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
            {/* 🎯 Binago ang title */}
            <h1 className="text-3xl font-extrabold text-gray-700">
              Request Types List
            </h1>
            <Button
              onClick={handleOpenAdd}
              className="bg-gray-700 hover:bg-gray-800 text-white"
            >
              <Plus className="h-5 w-5 mr-2" /> Request Type
            </Button>
          </div>

          {/* TABLE */}
          <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-700 text-white font-semibold sticky top-0">
                  <tr>
                    {/* 🎯 Binago ang header */}
                    <th className="p-4">Request Type Name</th>
                    <th className="p-4 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {requestTypes.length > 0 ? (
                    // 🎯 Binago ang variable: departments -> requestTypes, dept -> type
                    requestTypes.map((type) => (
                      <tr
                        key={type._id}
                        className="border-b hover:bg-gray-50 transition-colors"
                      >
                        <td className="p-4 font-medium text-gray-800">
                          {type.name}
                        </td>
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
                              {/* 🎯 Inayos ang onClick para sa handleEdit */}
                              <DropdownMenuItem
                                onClick={() => handleEdit(type)}
                                className="text-gray-700 hover:bg-gray-100"
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              {/* 🎯 Inayos ang onClick para sa handleDelete */}
                              <DropdownMenuItem
                                onClick={() => handleDelete(type._id, type.name)}
                                className="text-red-600 hover:bg-red-50"
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
                        {/* 🎯 Binago ang 'No departments' message */}
                        No request types found. Click "+ Request Type" to add one.
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
          open={isRequestTypeDialogOpen} // 🎯 Binago ang state
          onOpenChange={(open) => {
            setIsRequestTypeDialogOpen(open); // 🎯 Binago ang state setter
            if (!open) {
              setCurrentRequestType(null); // 🎯 Binago ang state
              setNewRequestTypeName(""); // 🎯 Binago ang state
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {/* 🎯 Binago ang title */}
                {currentRequestType ? "Edit Request Type" : "Add New Request Type"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="requestTypeName" className="text-right">
                  Name
                </Label>
                <Input
                  id="requestTypeName"
                  value={newRequestTypeName} // 🎯 Binago ang state
                  onChange={(e) => setNewRequestTypeName(e.target.value)} // 🎯 Binago ang state setter
                  className="col-span-3"
                  placeholder="e.g., Incident" // 🎯 Binago ang placeholder
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveRequestType} className="bg-gray-700 hover:bg-gray-800">
                {/* 🎯 Binago ang button text */}
                {currentRequestType ? "Save Changes" : "Create Request Type"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}