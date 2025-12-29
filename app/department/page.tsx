"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "../components/sidebar";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Edit, Trash2, MoreHorizontal } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Interfaces
interface Department {
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

export default function DepartmentsPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false); // Para iwas hydration error sa main page

  useEffect(() => {
    setMounted(true);
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/login");
    }
  }, [router]);

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isDeptDialogOpen, setIsDeptDialogOpen] = useState(false);
  const [currentDept, setCurrentDept] = useState<Department | null>(null);
  const [newDeptName, setNewDeptName] = useState("");
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      const res = await fetch("/api/departments");
      const data = await res.json();
      if (data.success) setDepartments(data.data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

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
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchProfile();
  }, []);

  const handleSaveDepartment = async () => {
    if (!newDeptName.trim()) return alert("Please enter the Department name.");
    try {
      const method = currentDept ? "PUT" : "POST";
      const url = currentDept ? `/api/departments/${currentDept._id}` : "/api/departments";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newDeptName }),
      });
      const data = await res.json();
      if (data.success) {
        alert(`Department ${currentDept ? "updated" : "created"} successfully!`);
        fetchDepartments();
      } else {
        alert(data.message || `Failed to ${currentDept ? "update" : "create"} department.`);
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Something went wrong.");
    }
    setIsDeptDialogOpen(false);
    setNewDeptName("");
    setCurrentDept(null);
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      const res = await fetch(`/api/departments/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Department deleted successfully!");
        fetchDepartments();
      } else {
        alert(data.message || "Failed to delete department.");
      }
    } catch (error) {
      console.error("Error deleting department:", error);
      alert("Something went wrong.");
    }
  };

  const handleEdit = (dept: Department) => {
    setCurrentDept(dept);
    setNewDeptName(dept.name);
    setIsDeptDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setCurrentDept(null);
    setNewDeptName("");
    setIsDeptDialogOpen(true);
  };

  // Huwag mag-render hangga't hindi pa mounted para iwas Hydration Mismatch
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
                  <BreadcrumbPage className="dark:text-zinc-100">Departments</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* MAIN */}
        <main className="p-6 bg-[#f7f8fa] dark:bg-zinc-950 min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
            <h1 className="text-3xl font-extrabold text-gray-700 dark:text-zinc-100 mb-4 md:mb-0">
              Departments List
            </h1>
            <Button onClick={handleOpenAdd} className="bg-gray-700 hover:bg-gray-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300">
              <Plus className="h-5 w-5 mr-2" /> Department
            </Button>
          </div>

          <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-700 dark:bg-zinc-800 text-white font-semibold sticky top-0">
                  <tr>
                    <th className="p-4">Department Name</th>
                    <th className="p-4 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800">
                  {departments.length > 0 ? (
                    departments.map((dept) => (
                      <tr key={dept._id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4 font-medium text-gray-800 dark:text-zinc-200">{dept.name}</td>
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
                              <DropdownMenuItem onClick={() => handleEdit(dept)} className="cursor-pointer dark:text-zinc-300 dark:hover:bg-zinc-800">
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDelete(dept._id, dept.name)} className="text-red-600 dark:text-red-400 cursor-pointer dark:hover:bg-red-950/30">
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
                        No departments found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </main>

        {/* DIALOGS */}
        <Dialog
          open={isDeptDialogOpen}
          onOpenChange={(open) => {
            setIsDeptDialogOpen(open);
            if (!open) {
              setCurrentDept(null);
              setNewDeptName("");
            }
          }}
        >
          <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                {currentDept ? "Edit Department" : "Add New Department"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="deptName" className="text-right text-sm font-medium dark:text-zinc-300">
                  Name :
                </Label>
                <Input
                  id="deptName"
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  className="col-span-3 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                  placeholder="e.g., Human Resources"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="dark:border-zinc-800 dark:text-zinc-300">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveDepartment} className="bg-gray-700 hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-950">
                {currentDept ? "Save Changes" : "Create Department"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}