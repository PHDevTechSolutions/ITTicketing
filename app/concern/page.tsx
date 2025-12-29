"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { ConcernSidebar } from "../components/app-concern-sidebar"
import {
  Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger, } from "@/components/ui/sidebar"
import {
  Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  User, LogOut, LayoutGrid, List, Download, Search, Loader2, Frown,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import {
  Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious,
} from "@/components/ui/pagination"

// --- INTERFACES ---
interface ITConcern {
  id: string
  employeeName: string
  department: string
  type: string
  remarks: string
  dateCreated: string
  priority: string
  status: "Pending" | "Ongoing" | "Finished"
  createdAt: string;
  Fullname: string
  requesttype: string
  technicianname: string
  dateSched: string;
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
  Fullname: string
}

export default function Page() {
  const router = useRouter()
  
  // 🟢 HYDRATION FIX: State to check if component is mounted
  const [mounted, setMounted] = useState(false)

  const [isRowView, setIsRowView] = useState(false)
  const [selectedConcern, setSelectedConcern] = useState<ITConcern | null>(null)
  const [status, setStatus] = useState<ITConcern["status"]>("Pending")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)

  const [allConcerns, setAllConcerns] = useState<ITConcern[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [fetchError, setFetchError] = useState<string | null>(null)

  const [filterBy, setFilterBy] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 🧩 INITIAL LOAD & AUTH CHECK
  useEffect(() => {
    setMounted(true) // Set to true once the browser loads the component
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/login");
    } else {
      fetchProfile();
      fetchConcerns();
    }
  }, [router]);

  // 🧩 API FETCHING LOGIC
  const fetchProfile = async () => {
    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const username = localStorage.getItem("userId");
      if (!username) {
        setProfileError("No login session found. Please log in.");
        return;
      }
      const res = await fetch(`/api/profile/${username}`);
      const data = await res.json();
      if (res.ok && data.success) {
        setCurrentUser(data.data);
      } else {
        setProfileError(data.message || "Failed to load user profile.");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileError("Network error while fetching profile.");
    } finally {
      setIsProfileLoading(false);
    }
  };

  const fetchConcerns = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await fetch(`/api/tickets`);
      if (!res.ok) throw new Error(`Failed to fetch tickets: ${res.statusText}`);
      const data = await res.json();
      if (Array.isArray(data.data)) {
        setAllConcerns(data.data);
      } else {
        setAllConcerns([]);
        setFetchError("Received unexpected data format for tickets.");
      }
      toast.success("Fetch Ticket successful!")
    } catch (error) {
      console.error("Error fetching concerns:", error);
      setFetchError("Failed to connect to ticket service or network error.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'N/A';
    let dateToFormat = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateToFormat.getTime())) return 'Invalid Date';
    return dateToFormat.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // 🔍 FILTERING AND SEARCHING LOGIC
  const filteredConcerns = useMemo(() => {
    let filtered = allConcerns;
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    if (filterBy !== "all" && filterBy !== "") {
      filtered = filtered.filter(c => filterBy === "department" ? c.department : true);
    }

    if (lowerCaseSearchTerm) {
      filtered = filtered.filter(c => c.department.toLowerCase().includes(lowerCaseSearchTerm));
    }

    return filtered;
  }, [allConcerns, filterBy, searchTerm]);

  // 📝 PAGINATION LOGIC
  const totalConcerns = filteredConcerns.length
  const itemsPerPage = 6
  const totalPages = Math.ceil(totalConcerns / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredConcerns.slice(startIndex, startIndex + itemsPerPage)

  // --- STYLING FUNCTIONS ---
  const getRowBg = (priority: string, isRowView: boolean) => {
    const shades = isRowView 
      ? { crit: "bg-red-200 hover:bg-red-300", high: "bg-orange-200 hover:bg-orange-300", med: "bg-yellow-200 hover:bg-yellow-300", low: "bg-green-200 hover:bg-green-300" }
      : { crit: "bg-red-200 hover:bg-red-300", high: "bg-orange-300 hover:bg-orange-400", med: "bg-yellow-300 hover:bg-yellow-400", low: "bg-green-300 hover:bg-green-400" };
    
    switch (priority) {
      case "Critical": return shades.crit;
      case "High": return shades.high;
      case "Medium": return shades.med;
      case "Low": case "Normal": return shades.low;
      default: return "bg-gray-200 hover:bg-gray-300";
    }
  }

  const getStatusBadgeColors = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700";
      case "Ongoing": return "bg-blue-100 text-blue-700";
      case "Finished": return "bg-green-100 text-green-700";
      default: return "bg-gray-100 text-gray-700";
    }
  }

  const getCardTextColors = (priority: string) => "text-gray-800";

  const openDialog = (concern: ITConcern) => {
    setSelectedConcern(concern);
    setStatus(concern.status);
  }

  const handleUpdate = () => {
    alert(`✅ Ticket ${selectedConcern?.id} updated to "${status}".`);
    toast.success("Update successful!");
    setSelectedConcern(null);
  }

  const handleLogout = () => {
    localStorage.removeItem("userId");
    router.push("/login");
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setProfilePic(reader.result as string);
      reader.readAsDataURL(file);
    }
  }

  // --- RENDER CONTENT FUNCTION ---
  const renderContent = () => {
    if (isLoading) return (
      <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 rounded-lg shadow-xl">
        <Loader2 className="h-10 w-10 animate-spin text-gray-700 dark:text-slate-400" />
        <p className="mt-4 text-lg font-semibold text-gray-700 dark:text-slate-300">Loading IT Support Tickets...</p>
      </div>
    );

    if (fetchError) return (
      <div className="flex flex-col items-center justify-center p-20 bg-red-50 dark:bg-red-900/10 rounded-lg border border-red-300 dark:border-red-800 shadow-xl text-red-700 dark:text-red-400">
        <Frown className="h-10 w-10" />
        <p className="mt-4 text-lg font-bold">Error Loading Tickets</p>
        <Button onClick={fetchConcerns} className="mt-4" variant="outline">Try Again</Button>
      </div>
    );

    if (currentItems.length === 0) return (
      <div className="flex flex-col items-center justify-center p-20 bg-white dark:bg-slate-900 rounded-lg shadow-xl text-gray-500">
        <Search className="h-10 w-10" />
        <p className="mt-4 text-lg font-semibold">No Tickets Found</p>
      </div>
    );

    if (isRowView) {
      return (
        <div className="w-full bg-white dark:bg-slate-900 shadow-xl rounded-lg border border-gray-200 dark:border-slate-800 overflow-hidden transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-[11px] md:text-xs">
              <thead className="bg-gray-700 dark:bg-slate-800 text-white font-semibold">
                <tr>
                  <th className="p-2 md:p-3">Employee</th>
                  <th className="p-2 md:p-3">Department</th>
                  <th className="p-2 md:p-3">Type</th>
                  <th className="p-2 md:p-3">Remarks</th>
                  <th className="p-2 md:p-3">Date</th>
                  <th className="p-2 md:p-3">Priority</th>
                  <th className="p-2 md:p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((c) => (
                  <tr key={c.id} className={`border-b dark:border-slate-800 cursor-pointer ${getRowBg(c.priority, true)}`} onClick={() => openDialog(c)}>
                    <td className="p-2 md:p-3 font-medium">{c.Fullname}</td>
                    <td className="p-2 md:p-3">{c.department}</td>
                    <td className="p-2 md:p-3">{c.type}</td>
                    <td className="p-2 md:p-3 italic truncate max-w-[150px]">{c.remarks}</td>
                    <td className="p-2 md:p-3">{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td className="p-2 md:p-3 font-semibold">{c.priority}</td>
                    <td className="p-2 md:p-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${getStatusBadgeColors(c.status)}`}>
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 transition-all duration-500">
        {currentItems.map((c) => (
          <div key={c.id} onClick={() => openDialog(c)} className={`rounded-lg border p-5 shadow hover:shadow-xl transition duration-300 cursor-pointer ${getRowBg(c.priority, false)} ${getCardTextColors(c.priority)}`}>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-extrabold">{c.type}</h2>
              <span className="text-xs font-bold uppercase px-3 py-1 rounded-full border border-current">{c.priority}</span>
            </div>
            <h3 className="text-lg font-semibold mb-1">{c.Fullname}</h3>
            <p className="text-sm opacity-80 mb-2">{c.department}</p>
            <p className="text-sm italic line-clamp-2 mb-3 opacity-90">{c.remarks}</p>
            <div className="flex justify-between items-center text-xs pt-3 border-t border-black/10">
              <span>{new Date(c.createdAt).toLocaleDateString("en-US", { month: 'long', day: '2-digit', year: 'numeric' })}</span>
              <span className={`px-2 py-1 rounded-full font-bold uppercase ${getStatusBadgeColors(c.status)}`}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // 🛑 STOP: IF NOT MOUNTED (Avoids Hydration Error)
  if (!mounted) return null;

  return (
    <SidebarProvider>
      <ConcernSidebar />
      <SidebarInset>
        {/* HEADER */}
<header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white dark:bg-black border-slate-200 dark:border-zinc-800 px-6 transition-colors shadow-sm dark:shadow-none">
  <div className="flex items-center gap-4">
    {/* Sidebar Trigger */}
    <SidebarTrigger className="text-slate-600 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-100" />
    
    {/* Vertical Separator */}
    <Separator orientation="vertical" className="h-6 bg-slate-200 dark:bg-zinc-800" />
    
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink 
            href="/dashboard" 
            className="text-slate-500 hover:text-slate-900 dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            Dashboard
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        <BreadcrumbSeparator className="hidden md:block text-slate-400 dark:text-zinc-700" />
        
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium text-slate-900 dark:text-zinc-100">
            Concern
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  </div>
</header>

        {/* MAIN CONTENT */}
        <main className="p-7 bg-slate-50 dark:bg-slate-950 min-h-[calc(100vh-4rem)] transition-colors">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-4 mb-3 md:mb-0">
              <h1 className="text-3xl font-extrabold text-slate-700 dark:text-slate-100">IT Support Tickets</h1>
              <Button variant="outline" size="icon" onClick={() => setIsRowView(!isRowView)} className="bg-white dark:bg-slate-900 dark:border-slate-700">
                {isRowView ? <LayoutGrid className="h-5 w-5 text-slate-700 dark:text-slate-300" /> : <List className="h-5 w-5 text-slate-700 dark:text-slate-300" />}
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2 md:gap-3">
              <div className="relative w-[160px] md:w-55">
                <Input type="search" placeholder="Search Department" className="pl-3 md:pl-4 h-8 md:h-9 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Search className="h-3 w-3 md:h-4 md:w-4 absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[100px] md:w-[120px] h-8 md:h-10 bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent className="dark:bg-slate-900">
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {renderContent()}

          {/* TICKET DETAILS DIALOG */}
          <Dialog open={!!selectedConcern} onOpenChange={() => setSelectedConcern(null)}>
            <DialogContent className="sm:max-w-[450px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 [&>button]:hidden">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-slate-900 dark:text-slate-100">Ticket #{selectedConcern?.id} Details</DialogTitle>
              </DialogHeader>
              {selectedConcern && (
                <div className="space-y-4 text-sm p-4 border rounded-lg bg-slate-50 dark:bg-slate-800/50 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                    <div><Label className="text-[10px] uppercase text-slate-500">Employee</Label><p className="font-medium dark:text-slate-100">{selectedConcern.Fullname}</p></div>
                    <div><Label className="text-[10px] uppercase text-slate-500">Department</Label><p className="font-medium dark:text-slate-100">{selectedConcern.department}</p></div>
                    <div><Label className="text-[10px] uppercase text-slate-500">Concern Type</Label><p className="font-medium dark:text-slate-100">{selectedConcern.type}</p></div>
                    <div><Label className="text-[10px] uppercase text-slate-500">Priority</Label><p className={`font-bold ${selectedConcern.priority === "Critical" ? "text-red-500" : "text-green-500"}`}>{selectedConcern.priority}</p></div>
                  </div>
                  <div className="pt-3 border-t dark:border-slate-700">
                    <Label className="text-[10px] uppercase text-slate-500">Remarks</Label>
                    <p className="italic dark:text-slate-300">{selectedConcern.remarks}</p>
                  </div>
                </div>
              )}
              <DialogFooter className="mt-4">
                <DialogClose asChild><Button variant="outline" className="dark:border-slate-700">Close</Button></DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* PAGINATION */}
          <div className="mt-8 flex justify-center pb-10">
            {totalConcerns > 0 && (
              <Pagination>
                <PaginationContent className="dark:text-slate-300">
                  <PaginationItem>
                    <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); if (currentPage > 1) setCurrentPage(currentPage - 1); }} className="dark:hover:bg-slate-800" />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink href="#" isActive={i + 1 === currentPage} onClick={(e) => { e.preventDefault(); setCurrentPage(i + 1); }} 
                        className={i + 1 === currentPage ? "" : "dark:hover:bg-slate-800"}>
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext href="#" onClick={(e) => { e.preventDefault(); if (currentPage < totalPages) setCurrentPage(currentPage + 1); }} className="dark:hover:bg-slate-800" />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            )}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}