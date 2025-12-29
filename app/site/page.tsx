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
import { Plus, Edit, Trash2, MoreHorizontal, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// --- Interface para sa Site ---
interface Site {
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

export default function SitePage() {
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
  const [sites, setSites] = useState<Site[]>([]);
  const [isSiteDialogOpen, setIsSiteDialogOpen] = useState(false);
  const [currentSite, setCurrentSite] = useState<Site | null>(null);
  const [newSiteName, setNewSiteName] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // 🧩 FETCH Functions
  const fetchSites = async () => { 
    setIsLoading(true);
    try {
      const res = await fetch("/api/site"); 
      const data = await res.json();
      if (res.ok && data.success) {
        setSites(data.data); 
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
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
    fetchSites(); 
    fetchProfile();
  }, []); 

  // 🧠 Handlers
  const handleSaveSite = async () => {
    const trimmedName = newSiteName.trim();
    if (!trimmedName) return alert("Please enter the site name.");

    setIsSaving(true);
    try {
      const method = currentSite ? "PUT" : "POST";
      const url = currentSite ? `/api/site/${currentSite._id}` : "/api/site";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName }),
      });
      const data = await res.json();

      if (data.success) {
        alert(`Site ${currentSite ? "updated" : "created"} successfully!`);
        fetchSites();
      } else {
        alert(data.message || "Failed to save site.");
      }
    } catch (error) {
      console.error("Error saving site:", error);
    } finally {
      setIsSaving(false);
      setIsSiteDialogOpen(false);
      setCurrentSite(null);
      setNewSiteName("");
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete Site "${name}"?`)) return; 

    try {
      const res = await fetch(`/api/site/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        alert("Site deleted successfully!");
        fetchSites();
      }
    } catch (error) {
      console.error("Error deleting site:", error);
    }
  };

  const handleEdit = (site: Site) => {
    setCurrentSite(site);
    setNewSiteName(site.name);
    setIsSiteDialogOpen(true);
  };

  const handleOpenAdd = () => {
    setCurrentSite(null);
    setNewSiteName("");
    setIsSiteDialogOpen(true);
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
                  <BreadcrumbPage className="dark:text-zinc-100">Sites</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 bg-[#f7f8fa] dark:bg-zinc-950 min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
            <h1 className="text-3xl font-extrabold text-gray-700 dark:text-zinc-100 mb-4 md:mb-0">
              Site List
            </h1>
            <Button 
              onClick={handleOpenAdd}
              className="bg-gray-700 hover:bg-gray-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300"
            >
              <Plus className="h-5 w-5 mr-2" /> Site
            </Button>
          </div>

          {/* SITE TABLE */}
          <div className="bg-white dark:bg-zinc-900 shadow-xl rounded-lg border border-gray-200 dark:border-zinc-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-xs">
                <thead className="bg-gray-700 dark:bg-zinc-800 text-white font-semibold sticky top-0">
                  <tr>
                    <th className="p-4">Site Name</th>
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
                  ) : sites.length > 0 ? (
                    sites.map((site) => (
                      <tr key={site._id} className="border-b dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors">
                        <td className="p-4 font-medium text-gray-800 dark:text-zinc-200">{site.name}</td>
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
                                onClick={() => handleEdit(site)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 dark:text-red-400 dark:hover:bg-red-950/30"
                                onClick={() => handleDelete(site._id, site.name)}
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
                        No sites found. Click "+ Site" to add one.
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
            open={isSiteDialogOpen} 
            onOpenChange={(open) => {
              setIsSiteDialogOpen(open);
              if (!open) {
                setCurrentSite(null);
                setNewSiteName("");
              }
            }}
        >
          <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900 dark:text-zinc-100">
                {currentSite ? "Edit Site" : "Add New Site"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="siteName" className="text-right text-sm font-medium dark:text-zinc-300">Name :</Label>
                <Input
                  id="siteName"
                  value={newSiteName}
                  onChange={(e) => setNewSiteName(e.target.value)}
                  className="col-span-3 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100"
                  placeholder="e.g., Disruptive Solutions Inc"
                  disabled={isSaving}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !isSaving) handleSaveSite();
                  }}
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="dark:border-zinc-800 dark:text-zinc-300" disabled={isSaving}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveSite} className="bg-gray-700 hover:bg-gray-800 dark:bg-zinc-100 dark:text-zinc-950" disabled={isSaving}>
                {isSaving ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>
                ) : (
                    currentSite ? "Save Changes" : "Create Site"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </SidebarInset>
    </SidebarProvider>
  );
}