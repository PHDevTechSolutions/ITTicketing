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
  Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTrigger, DialogTitle,
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

// --- INTERFACES (Kinuha sa original code) ---
interface ITConcern {
  id: string
  employeeName: string
  department: string
  type: string
  remarks: string
  dateCreated: string // Keep as string for simple fetching/sorting
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

// Removed NewTicket interface and related dummy states/handlers as they are not needed for ticket display.

export default function Page() {
  const router = useRouter()

  const [isRowView, setIsRowView] = useState(false)
  const [selectedConcern, setSelectedConcern] = useState<ITConcern | null>(null)
  const [status, setStatus] = useState<ITConcern["status"]>("Pending")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)

  // --- TICKET STATE ---
  const [allConcerns, setAllConcerns] = useState<ITConcern[]>([]) // Para sa lahat ng tickets
  const [isLoading, setIsLoading] = useState(true) // Loading state para sa tickets
  const [fetchError, setFetchError] = useState<string | null>(null) // Error state
  // --------------------

  const [filterBy, setFilterBy] = useState("all") // Added "all" default filter
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // --- STATE FOR PROFILE (Kinuha sa original code) ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 🧩 API FETCHING LOGIC (Profile and Tickets)

  // Fetch Profile (Same logic as before)
  const fetchProfile = async () => {
    setIsProfileLoading(true);
    setProfileError(null);
    try {
      const username = localStorage.getItem("userId");

      if (!username) {
        setProfileError("No login session found. Please log in.");
        return;
      }

      // Assuming API endpoint is /api/profile/[username]
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

  // 🚀 FETCH TICKETS FROM API
  const fetchConcerns = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      // Assume the API endpoint for all tickets is /api/tickets
      // Note: You might need to add token/auth headers here in a real app.
      const res = await fetch(`/api/tickets`);

      if (!res.ok) {
        throw new Error(`Failed to fetch tickets: ${res.statusText}`);
      }

      const data = await res.json();

      // Assuming the data.data is an array of ITConcern
      if (Array.isArray(data.data)) {
        setAllConcerns(data.data);
      } else {
        // Fallback for unexpected data structure
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


  // Fetch data on initial load
  useEffect(() => {
    fetchProfile();
    fetchConcerns();
    // Call the new ticket fetching function
  }, []);

  // Helper function to format date
  // Line 202 (Modified): Helper function to format date
  // Tinatanggap na ngayon ang 'string' o 'Date'
  const formatDate = (date: string | Date | undefined): string => {
    if (!date) return 'N/A';

    let dateToFormat: Date;

    // Type check: If it's a string, convert it to a Date object
    if (typeof date === 'string') {
      dateToFormat = new Date(date);
    } else {
      dateToFormat = date; // It's already a Date object
    }

    // Check if the date conversion was successful
    if (isNaN(dateToFormat.getTime())) {
      return 'Invalid Date';
    }

    return dateToFormat.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };
  // END OF PROFILE LOGIC

  // 🔍 FILTERING AND SEARCHING LOGIC (Using useMemo to optimize)
  const filteredConcerns = useMemo(() => {
    let filtered = allConcerns;
    const lowerCaseSearchTerm = searchTerm.toLowerCase().trim();

    // 1. Apply Filtering
    if (filterBy !== "all" && filterBy !== "") {
      filtered = filtered.filter(c => {
        switch (filterBy) {
          case "department": return c.department;
          default: return true;
        }
      });
    }

    // 2. Apply Searching
    if (lowerCaseSearchTerm) {
      filtered = filtered.filter(c => {
        // Search across relevant fields (adjust as needed)
        return (
          c.department.toLowerCase().includes(lowerCaseSearchTerm)
        );
      });
    }

    // Reset page to 1 if the filter/search changes
    if (currentPage !== 1) {
      setCurrentPage(1);
    }

    return filtered;
  }, [allConcerns, filterBy, searchTerm]); // Dependencies

  // 📝 PAGINATION LOGIC
  const totalConcerns = filteredConcerns.length
  const itemsPerPage = 6
  const totalPages = Math.ceil(totalConcerns / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = filteredConcerns.slice(startIndex, startIndex + itemsPerPage)


  // --- STYLING FUNCTIONS (Kinuha sa original code) ---
  const getRowBg = (priority: string, isRowView: boolean) => {
    if (isRowView) {
      switch (priority) {
        case "Critical": return "bg-red-200 hover:bg-red-300";
        case "High": return "bg-orange-200 hover:bg-orange-300";
        case "Medium": return "bg-yellow-200 hover:bg-yellow-300";
        case "Low": return "bg-green-200 hover:bg-green-300";
        case "Normal": return "bg-green-200 hover:bg-green-300";
        default: return "bg-gray-200 hover:bg-gray-300";
      }
    } else {
      switch (priority) {
        case "Critical": return "bg-red-200 hover:bg-red-300";
        case "High": return "bg-orange-300 hover:bg-orange-400";
        case "Medium": return "bg-yellow-300 hover:bg-yellow-400";
        case "Low": return "bg-green-300 hover:bg-green-400";
        case "Normal": return "bg-green-300 hover:bg-green-400";
        default: return "bg-gray-300 hover:bg-gray-400";
      }
    }
  }

  const getStatusBadgeColors = (status: string) => {
    switch (status) {
      case "Pending": return "bg-yellow-100 text-yellow-700"
      case "Ongoing": return "bg-blue-100 text-blue-700"
      case "Finished": return "bg-green-100 text-green-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  const getCardTextColors = (priority: string) => {
    // Keep the original color logic
    switch (priority) {

      case "Critical":
      case "High":
      case "Medium":
      case "Low":
      case "Normal":
        return "text-gray-800"; // Use dark text for colored backgrounds
      default:
        return "text-gray-700";
    }
  }
  // ------------------------------------------------------------------

  const openDialog = (concern: ITConcern) => {
    setSelectedConcern(concern)
    setStatus(concern.status)
  }

  const handleUpdate = () => {
    // TODO: Implement API call to update ticket status here
    alert(`✅ Ticket ${selectedConcern?.id} updated to "${status}". \n(Note: This is a dummy update alert.)`)
    // Optionally refetch tickets after successful update: fetchConcerns();
    toast.success("Login successful!")
    setSelectedConcern(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("userId")
    router.push("/login")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfilePic(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // --- RENDER FUNCTIONS ---

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-lg shadow-xl">
          <Loader2 className="h-10 w-10 animate-spin text-gray-700" />
          <p className="mt-4 text-lg font-semibold text-gray-700">Loading IT Support Tickets...</p>
        </div>
      )
    }

    if (fetchError) {
      return (
        <div className="flex flex-col items-center justify-center p-20 bg-red-50 rounded-lg border border-red-300 shadow-xl text-red-700">
          <Frown className="h-10 w-10" />
          <p className="mt-4 text-lg font-bold">Error Loading Tickets</p>
          <p className="text-sm mt-1">{fetchError}</p>
          <Button onClick={fetchConcerns} className="mt-4" variant="outline">
            Try Again
          </Button>
        </div>
      )
    }

    if (currentItems.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-20 bg-white rounded-lg shadow-xl text-gray-500">
          <Search className="h-10 w-10" />
          <p className="mt-4 text-lg font-semibold">No Tickets Found</p>
          <p className="text-sm mt-1">Adjust your search term or filter settings.</p>
        </div>
      )
    }


    // --- LIST (ROW) VIEW ---
    if (isRowView) {
      return (
        <div className="w-full bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden transition-all duration-500">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead className="bg-gray-700 text-white font-semibold">
                <tr>
                  <th className="p-3">Employee</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Remarks</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((c) => (
                  <tr
                    key={c.id}
                    // Pass isRowView=true to get the lighter row background
                    className={`border-b cursor-pointer ${getRowBg(
                      c.priority,
                      true
                    )}`}
                    onClick={() => openDialog(c)}
                  >
                    <td className="p-3 font-medium">{c.Fullname}</td>
                    <td className="p-3 text-gray-600">{c.department}</td>
                    <td className="p-3">{c.type}</td>
                    <td className="p-3 italic text-gray-500 truncate max-w-[250px]">
                      {c.remarks}
                    </td>
                    <td className="p-3">
                      {new Date(c.createdAt).toLocaleString("en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="p-3 font-semibold">{c.priority}</td>
                    <td className="p-3 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadgeColors(
                          c.status
                        )}`}
                      >
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    }

    // --- GRID (CARD) VIEW ---
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-7 transition-all duration-500">
        {currentItems.map((c) => (
          <div
            key={c.id}
            onClick={() => openDialog(c)}
            className={`rounded-lg border p-5 shadow hover:shadow-xl transition duration-300 cursor-pointer 
              ${getRowBg(c.priority, false)} 
              ${getCardTextColors(c.priority)}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-extrabold">
                {c.type}
              </h2>
              {/* Priority Badge */}
              <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border border-current 
                    ${c.priority === "Critical" ? 'text-red-800 border-red-800' :
                  c.priority === "High" ? 'text-orange-800 border-orange-800' :
                    c.priority === "Medium" ? 'text-yellow-800 border-yellow-800' :
                      c.priority === "Normal" ? 'text-green-800 border-green-800' :
                        'text-green-800 border-green-800'}`}
              >
                {c.priority}
              </span>
            </div>

            <h3 className="text-lg font-semibold mb-1">
              {c.Fullname}
            </h3>
            <p className="text-sm opacity-80 mb-2">{c.department}</p>
            <p className="text-sm italic line-clamp-2 mb-3 opacity-90">
              {c.remarks}
            </p>
            <div className="flex justify-between items-center text-xs pt-3 border-t">
              <span className="p-3">
                {new Date(c.createdAt).toLocaleString("en-US", {
                  year: "numeric",
                  month: "long", // Ginawang 'long' para sa buong pangalan ng buwan
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
              </span>
              <span
                className={`px-2 py-1 rounded-full font-bold uppercase ${getStatusBadgeColors(
                  c.status
                )}`}
              >
                {c.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    )
  }
  // ------------------------------------------------------------------


  return (
    <SidebarProvider>
      <ConcernSidebar />
      <SidebarInset>
        {/* HEADER (No changes needed) */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Concern</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-7 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-4 mb-3 md:mb-0">
              <h1 className="text-3xl font-extrabold text-gray-700">
                IT Support Tickets
              </h1>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsRowView(!isRowView)}
                className="bg-white hover:bg-gray-100"
              >
                {isRowView ? (
                  <LayoutGrid className="h-5 w-5 text-gray-700" />
                ) : (
                  <List className="h-5 w-5 text-gray-700" />
                )}
              </Button>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              <div className="relative w-51">
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-4 h-10 pr-10 rounded-lg bg-white border-gray-300"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[140px] h-10 bg-white border-gray-300">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* LIST or GRID (Calling the renderContent function) */}
          {renderContent()}

          {/* DIALOG (No changes needed) */}
          <Dialog
            open={!!selectedConcern}
            onOpenChange={() => setSelectedConcern(null)}
          >
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">
                  Ticket #{selectedConcern?.id} Details
                </DialogTitle>
              </DialogHeader>

              {selectedConcern && (
                <div className="space-y-4 text-sm p-2 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div>
                      <Label className="font-semibold text-gray-600">
                        Employee:
                      </Label>
                      <p className="font-medium text-gray-900">
                        {selectedConcern.Fullname}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-600">
                        Department:
                      </Label>
                      <p className="font-medium text-gray-900">
                        {selectedConcern.department}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-600">Concern Type:</Label>
                      <p className="font-medium text-gray-900">
                        {selectedConcern.type}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-600">Type of Request:</Label>
                      <p className="font-medium text-gray-900">
                        {selectedConcern.requesttype}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-600">Technician:</Label>
                      <p className="font-medium text-gray-900">
                        {selectedConcern.technicianname}
                      </p>
                    </div>
                                        <div>
                      <Label className="font-semibold text-gray-600">Date Scheduled:</Label>
                      <p className="font-medium text-gray-900">
                        {selectedConcern.dateSched}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-600">
                        Priority:
                      </Label>
                      <p
                        className={`font-bold ${selectedConcern.priority === "Critical"
                            ? "text-red-600"
                            : selectedConcern.priority === "High"
                              ? "text-orange-600"
                              : "text-green-600"
                          }`}
                      >
                        {selectedConcern.priority}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Label className="font-semibold text-gray-600">
                      Remarks:
                    </Label>
                    <p className="italic text-gray-700">
                      {selectedConcern.remarks}
                    </p>
                  </div>

                
                </div>
              )}

              <DialogFooter className="mt-4">
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* PAGINATION */}
          <div className="mt-8 flex justify-center">
            {totalConcerns > 0 && ( // Only show pagination if there are items
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage > 1) setCurrentPage(currentPage - 1)
                      }}
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <PaginationItem key={i}>
                      <PaginationLink
                        href="#"
                        isActive={i + 1 === currentPage}
                        onClick={(e) => {
                          e.preventDefault()
                          setCurrentPage(i + 1)
                        }}
                      >
                        {i + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={(e) => {
                        e.preventDefault()
                        if (currentPage < totalPages) setCurrentPage(currentPage + 1)
                      }}
                    />
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