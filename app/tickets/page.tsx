"use client";
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"
import { useEffect, useState, useMemo } from "react";
import { AppSidebar } from "../components/sidebar";
import { useRouter } from "next/navigation";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import {
  User,
  LogOut,
  Download,
  LayoutGrid,
  List,
  Search,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner"; // Added for notifications

// --------------------------
// INTERFACE FROM API (UPDATED WITH NEW FIELDS)
// --------------------------
type Department = "HR" | "Finance" | "IT" | "Sales" | "Marketing" | "Operations";
type Status = "Pending" | "Ongoing" | "Finished";
type Priority = "Low" | "Medium" | "High" | "Critical";


interface Ticket {
  _id: string
  Subject: string
  Department: string
  Status: string
  CreatedAt: string
  // 👉 idagdag mo lang yung fields na meron talaga sa ticket mo
}


interface ITConcern {
  id: string;
  employeeName: string;
  department: Department; // Updated type
  type: string;
  remarks: string;
  dateCreated: string;
  status: Status;
  priority: Priority;
  // --- ADDED FIELDS ---
  Fullname: string; // Used in Dialog
  dateSched: string; // Used in Dialog
  requesttype: string; // Used in Dialog
  mode: string; // Used in Dialog
  site: string; // Used in Dialog
  group: string; // Used in Dialog
  technicianname: string; // Used in Dialog
  processedBy: string; // Used in Dialog
  // --------------------
  createdAt: string;
}

// --------------------------
// Incoming Ticket Data Interface (for status update)
// --------------------------
interface IncomingTicketData {
  status: Status;
}

// --------------------------
// DUMMY INTERFACES/FUNCTIONS FOR PROFILE DIALOG (TO RESOLVE ERRORS)
// --------------------------
interface CurrentUser {
  Firstname: string;
  Lastname: string;
  Username: string;
  Email: string;
  Role: string;
  ReferenceID: string;
  createdAt: string;
}

const profilePic = "";
const handleImageChange = () => { };
const handleLogout = () => {
  toast.info("Logged out (Dummy Function)");
};
const isProfileLoading = false;
const profileError = "";



// Line 202 (Modified): Helper function to format date
const formatDate = (date: string | Date | undefined): string => {
  if (!date) return "N/A";

  let dateToFormat: Date;

  if (typeof date === "string") {
    dateToFormat = new Date(date);
  } else {
    dateToFormat = date; // It's already a Date object
  }

  if (isNaN(dateToFormat.getTime())) {
    return "Invalid Date";
  }

  return dateToFormat.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// ----------------------------
// Background Helpers
// ----------------------------
const getPriorityBg = (priority: ITConcern["priority"]) => {
  switch (priority) {
    case "Critical":
      return "bg-red-100 hover:bg-red-100/70";
    case "High":
      return "bg-orange-100 hover:bg-orange-100/70";
    case "Medium":
      return "bg-yellow-100 hover:bg-yellow-100/70";
    case "Low":
    default:
      return "bg-green-100 hover:bg-green-100/70";
  }
};

const getStatusBadgeColors = (status: ITConcern["status"]) => {
  switch (status) {
    case "Finished":
      return "bg-emerald-100 text-emerald-700";
    case "Ongoing":
      return "bg-blue-100 text-blue-700";
    case "Pending":
    default:
      return "bg-red-100 text-red-700";
  }
};

// ----------------------------
// CARD COMPONENT
// ----------------------------
function ConcernCard({
  concern,
  onClick,
}: {
  concern: ITConcern;
  onClick: (c: ITConcern) => void;
}) {
  return (
    <Card
      // Binawasan ang padding (p-3) at ginawang subtle ang hover (hover:opacity-85)
      className={`w-full cursor-pointer transition-all duration-200 p-0 hover:opacity-85 hover:scale-[0.98] border-none shadow-md text-black dark:text-black ${getPriorityBg(
        concern.priority
      )}`}
      onClick={() => onClick(concern)}
    >
      <CardHeader className="p-3 pb-1"> {/* Pinaliit ang padding ng Header */}
        <CardTitle className="flex justify-between items-center">
          <span className="text-base font-bold text-black dark:text-black leading-none">
            {concern.type}
          </span>
          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border border-black/30 text-black dark:text-black">
            {concern.priority}
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="p-3 pt-1 space-y-1.5"> {/* Pinaliit ang spacing at padding */}
        <p className="text-[12px] leading-tight text-black dark:text-black">
          <strong className="font-semibold text-black dark:text-black">Emp:</strong> {concern.Fullname}
        </p>
        <p className="text-[12px] leading-tight text-black dark:text-black">
          <strong className="font-semibold text-black dark:text-black">Dept:</strong> {concern.department}
        </p>

        {/* Mas maikling remarks area */}
        <p className="italic line-clamp-1 text-[11px] text-black/70 dark:text-black/80">
          {concern.remarks}
        </p>

        <div className="flex justify-between items-center pt-2 mt-1 border-t border-black/10">
          {/* Mas maliit na date text */}
          <span className="text-[10px] font-medium text-black/60 dark:text-black">
            {new Date(concern.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "2-digit",
              year: "2-digit", // Pinaikli ang taon para tipid sa space
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            })}
          </span>

          {/* Mas maliit na Status Badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase shadow-sm ${getStatusBadgeColors(
              concern.status
            )}`}
          >
            {concern.status}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

// ----------------------------
// MAIN PAGE
// ----------------------------
export default function ITConcernsPage() {
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem("currentUser");
    if (!user) {
      router.push("/login"); // Redirect kung walang login
    }
  }, []);
  const [isRowView, setIsRowView] = useState(true);
  const [selectedConcern, setSelectedConcern] = useState<ITConcern | null>(null);
  const [status, setStatus] = useState<ITConcern["status"]>("Pending");

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  // EXISTING FILTER
  const [filterBy, setFilterBy] = useState("all");
  // NEW DEPARTMENT FILTER STATE
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  // ADDED: Dummy state for current user to satisfy the Profile Dialog's JSX

  // 1️⃣ Raw data
  const [tickets, setTickets] = useState<Ticket[]>([])

  // 2️⃣ Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState<number>(8)

  // 3️⃣ Filtered data
  const filteredItems = tickets.filter((ticket) => {
    // 👉 palitan mo ng actual filters mo
    return true
  })

  // 4️⃣ Pagination logic
  const paginationEnabled = itemsPerPage < 100

  const displayedItems = paginationEnabled
    ? filteredItems.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    )
    : filteredItems.slice(0, itemsPerPage)

  // 5️⃣ Reset page when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1)
  }, [itemsPerPage])

  // -------------------------

  // ----------------------------
  // FETCHED DATA HERE
  // ----------------------------
  const [concerns, setConcerns] = useState<ITConcern[]>([]);
  const [loading, setLoading] = useState(true);

  // ----------------------------
  // DUMMY DATA FOR TESTING FILTERS
  // ----------------------------
  const DUMMY_CONCERNS_DATA: ITConcern[] = [];
  // ----------------------------


  // ----------------------------
  // FETCH API /api/tickets (GET)
  // ----------------------------
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const res = await fetch("/api/tickets");
        let fetchedData;

        if (res.ok) {
          const json = await res.json();
          // Assuming the API returns the new fields for each ticket
          fetchedData = json.success ? json.data : [];
        } else {
          // Fallback to dummy data if API fails
          console.warn("API fetch failed. Using dummy data for display.");
          fetchedData = DUMMY_CONCERNS_DATA;
        }

        // Sort by date created (newest first) for better UX
        const sortedData = fetchedData.sort(
          (a: ITConcern, b: ITConcern) =>
            new Date(b.dateCreated).getTime() -
            new Date(a.dateCreated).getTime()
        );
        setConcerns(sortedData);
      } catch (error) {
        console.error("Fetch error:", error);
        // Ensure some data is available for testing filters/UI
        setConcerns(DUMMY_CONCERNS_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);

  // ----------------------------
  // Filtering and Searching Logic (UPDATED)
  // ----------------------------
  const filteredConcerns = useMemo(() => {
    let results = concerns;
    const lowerSearchTerm = searchTerm.toLowerCase();

    if (lowerSearchTerm) {
      results = results.filter(
        (c) =>
          c.Fullname?.toLowerCase().includes(lowerSearchTerm)

      );
    }

    // 2. Department Filter (NEW)
    if (departmentFilter && departmentFilter !== "all") {
      results = results.filter((c) => c.department === departmentFilter);
    }

    // 3. Status/Priority Filter (Existing)
    if (filterBy && filterBy !== "all") {
      results = results.filter((c) => {
        switch (filterBy) {
          case "status-pending":
            return c.status === "Pending";
          case "status-ongoing":
            return c.status === "Ongoing";
          case "status-finished":
            return c.status === "Finished";
          case "priority-critical":
            return c.priority === "Critical";
          case "priority-high":
            return c.priority === "High";
          case "priority-medium":
            return c.priority === "Medium";
          case "priority-low":
            return c.priority === "Low";
          default:
            return true;
        }
      });
    }

    // Reset to the first page if filters change
    setCurrentPage(1);

    return results;
  }, [concerns, searchTerm, filterBy, departmentFilter]); // Dependency added

  // ----------------------------
  // Pagination Logic (Unchanged)
  // ----------------------------
  const totalPages = Math.ceil(filteredConcerns.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const concernsForPage = filteredConcerns.slice(startIndex, endIndex);


  const pageNumbers = useMemo<(number | "...")[]>(() => {
    const pages: (number | "...")[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // Always show first page
    pages.push(1);

    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    if (left > 2) pages.push("...");

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) pages.push("...");

    // Always show last page
    pages.push(totalPages);

    return pages;
  }, [currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  // ----------------------------
  // API Handlers (Unchanged)
  // ----------------------------
  const openDialog = (concern: ITConcern) => {
    setSelectedConcern(concern);
    setStatus(concern.status);
    setIsDeleteConfirmOpen(false);
  };

  const handleDownloadExcel = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation() // ⚡ Important: hindi matatamaan ng parent row/card click

    if (!concernsForPage || concernsForPage.length === 0) return

    // Optional: format columns for Excel
    const formattedData = concernsForPage.map((c) => ({
      Employee: c.Fullname,
      Department: c.department,
      "Date Scheduled": c.dateSched,
      Site: c.site,
      Remarks: c.remarks,
      Priority: c.priority,
      Status: c.status,
    }))

    // Create worksheet and workbook
    const worksheet = XLSX.utils.json_to_sheet(formattedData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Tickets")

    // Convert to Blob
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    })
    const file = new Blob([excelBuffer], {
      type:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    })

    // Trigger download
    saveAs(file, `tickets_${Date.now()}.xlsx`)
  }



  const handleUpdate = async () => {
    if (!selectedConcern) return;

    try {
      const response = await fetch(`/api/tickets/${selectedConcern.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const resJson = await response.json();
        throw new Error(resJson.message || "Failed to update ticket.");
      }

      const resData = await response.json();
      toast.success(
        `Ticket #${selectedConcern.id} status updated to: ${status}.`
      );

      // Update local state
      setConcerns((prev) =>
        prev.map((c) =>
          c.id === selectedConcern.id ? { ...c, status } : c
        )
      );

      setSelectedConcern(null); // Close dialog
    } catch (error: any) {
      console.error("Error updating ticket:", error);
      toast.error(error.message || "Failed to update ticket. Please try again.");
    }
  };

  const handleDelete = async () => {
    if (!selectedConcern) return;

    try {
      const response = await fetch(`/api/tickets/${selectedConcern.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const resJson = await response.json();
        throw new Error(resJson.message || "Failed to delete ticket.");
      }

      toast.success(`Ticket #${selectedConcern.id} successfully deleted.`);

      // Remove from local state
      setConcerns((prev) =>
        prev.filter((c) => c.id !== selectedConcern.id)
      );

      // Close dialogs
      setSelectedConcern(null);
      setIsDeleteConfirmOpen(false);
    } catch (error: any) {
      console.error("Error deleting ticket:", error);
      toast.error(error.message || "Failed to delete ticket. Please try again.");
      setIsDeleteConfirmOpen(false);
    }
  };

  // ----------------------------
  // LOADING STATE (Unchanged)
  // ----------------------------
  if (loading) {
    return (
      <div className="w-full py-20 text-center text-gray-600">
        <span className="text-lg font-semibold">
          <Loader2 className="h-6 w-6 inline-block mr-2 animate-spin" />
          Loading tickets...
        </span>
      </div>
    );
  }

  return (
    <SidebarProvider>
      {/* ADDED: A dummy AppSidebar to prevent error, assuming it's in the correct path */}
      <AppSidebar />
      <SidebarInset>
        {/* --------------- HEADER ---------------- (Unchanged) */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm transition-colors dark:bg-black dark:border-zinc-800 dark:shadow-none">
          <div className="flex items-center gap-4">
            {/* Sidebar Trigger */}
            <SidebarTrigger className="text-slate-600 dark:text-zinc-400 dark:hover:text-zinc-100" />

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
                  <BreadcrumbPage className="text-slate-900 font-medium dark:text-zinc-100">
                    IT Support Tickets
                  </BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 bg-[#f7f8fa] dark:bg-zinc-950 min-h-[calc(100vh-4rem)] transition-colors">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-zinc-800">
            {/* TITLE AND VIEW TOGGLE (Unchanged Logic) */}
            <div className="flex items-center gap-4 mb-3 md:mb-0">
              <h1 className="text-3xl font-extrabold text-gray-700 dark:text-zinc-100">
                IT Support Tickets
              </h1>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsRowView(!isRowView)}
                className="bg-white hover:bg-gray-100 dark:bg-zinc-900 dark:border-zinc-800 dark:hover:bg-zinc-800"
                title={
                  isRowView ? "Switch to Grid View" : "Switch to List View"
                }
              >
                {isRowView ? (
                  <List className="h-5 w-5 text-gray-700 dark:text-zinc-300" />
                ) : (
                  <LayoutGrid className="h-5 w-5 text-gray-700 dark:text-zinc-300" />
                )}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 text-[11px] md:text-xs">
              {/* Download Button */}
              <Button className="h-8 md:h-10 px-3 md:px-4 text-[11px] md:text-xs dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300" onClick={handleDownloadExcel}>
                Download
              </Button>

              {/* Search */}
              <div className="relative w-[160px] md:w-50">
                <Input
                  type="search"
                  placeholder="Search Employee"
                  className="h-8 md:h-10 pr-8 md:pr-10 text-[11px] md:text-xs rounded-lg bg-white border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-500 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-3 w-3 md:h-4 md:w-4 absolute right-2 md:right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" />
              </div>

              {/* Department Filter */}
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-[120px] md:w-[140px] h-8 md:h-10 text-[11px] md:text-xs bg-white border-gray-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
                  <SelectItem value="all">All Departments</SelectItem>
                  <Separator className="dark:bg-zinc-800" />
                  <SelectItem value="Sales Department">Sales</SelectItem>
                  <SelectItem value="IT Department">IT</SelectItem>
                  <SelectItem value="HR Department">HR</SelectItem>
                  <SelectItem value="Accounting Department">Accounting</SelectItem>
                  <SelectItem value="Procurement Department">Procurement</SelectItem>
                  <SelectItem value="Marketing Department">Marketing</SelectItem>
                  <SelectItem value="Ecommerce Department">Ecommerce</SelectItem>
                  <SelectItem value="CSR Department">CSR</SelectItem>
                  <SelectItem value="Admin Department">Admin</SelectItem>
                  <SelectItem value="Warehouse Department">Warehouse</SelectItem>
                  <SelectItem value="Logistic Department">Logistic</SelectItem>
                  <SelectItem value="Engineering Department">Engineering</SelectItem>
                </SelectContent>
              </Select>

              {/* Status / Priority Filter */}
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[70px] md:w-[80px] h-8 md:h-10 text-[11px] md:text-xs bg-white border-gray-300 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                  <SelectValue placeholder="Filter" />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
                  <SelectItem value="all">All</SelectItem>
                  <Separator className="dark:bg-zinc-800" />
                  <SelectItem value="status-pending">Pending</SelectItem>
                  <SelectItem value="status-ongoing">Ongoing</SelectItem>
                  <SelectItem value="status-finished">Finished</SelectItem>
                  <Separator className="dark:bg-zinc-800" />
                  <SelectItem value="priority-critical">Critical</SelectItem>
                  <SelectItem value="priority-high">High</SelectItem>
                  <SelectItem value="priority-medium">Medium</SelectItem>
                  <SelectItem value="priority-low">Low</SelectItem>
                </SelectContent>
              </Select>

              {/* Items Per Page */}
              <Select
                value={String(itemsPerPage)}
                onValueChange={(value) => setItemsPerPage(Number(value))}
              >
                <SelectTrigger className="w-[55px] md:w-[60px] h-8 md:h-10 text-[11px] md:text-xs dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100">
                  <SelectValue placeholder="Items" />
                </SelectTrigger>
                <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
                  <SelectItem value="8">8</SelectItem>
                  <SelectItem value="25">25</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                  <Separator className="dark:bg-zinc-800" />
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                  <SelectItem value="1000">1000</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* LIST OR GRID */}
          {concernsForPage.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-lg border border-dashed text-gray-500 dark:bg-zinc-900/50 dark:border-zinc-800 dark:text-zinc-400">
              No tickets found matching your criteria.
            </div>
          ) : isRowView ? (
            /* ------------ LIST VIEW ------------- */
            /* ------------ LIST VIEW ------------- */
            <div className="bg-white border rounded-lg overflow-x-auto dark:bg-zinc-900 dark:border-zinc-800">
              <table className="min-w-full text-[11px] md:text-xs">
                <thead className="bg-gray-700 text-white sticky top-0 dark:bg-zinc-800 dark:text-zinc-200">
                  <tr>
                    <th className="p-2 md:p-3 text-left whitespace-nowrap">Employee</th>
                    <th className="p-2 md:p-3 text-left whitespace-nowrap">Department</th>
                    <th className="p-2 md:p-3 text-left whitespace-nowrap">Date</th>
                    <th className="p-2 md:p-3 text-left whitespace-nowrap">Site</th>
                    <th className="p-2 md:p-3 text-left whitespace-nowrap">Remarks</th>
                    <th className="p-2 md:p-3 text-left whitespace-nowrap">Priority</th>
                    <th className="p-2 md:p-3 text-left whitespace-nowrap">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-zinc-800">
                  {concernsForPage.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => openDialog(c)}
                      className={`
    ${getPriorityBg(c.priority)} 
  `}
                    >
                      {/* Pinalitan ang dark:text-zinc-XXX ng dark:text-black para sa value */}
                      <td className="p-2 md:p-3 whitespace-nowrap dark:text-black font-medium">{c.Fullname}</td>
                      <td className="p-2 md:p-3 whitespace-nowrap dark:text-black">{c.department}</td>
                      <td className="p-2 md:p-3 whitespace-nowrap dark:text-black">{c.dateSched}</td>
                      <td className="p-2 md:p-3 whitespace-nowrap dark:text-black">{c.site}</td>
                      <td className="p-2 md:p-3 truncate max-w-[120px] md:max-w-xs dark:text-black">
                        {c.remarks}
                      </td>
                      <td className="p-2 md:p-3 text-center whitespace-nowrap dark:text-black">
                        {c.priority}
                      </td>
                      <td className="p-2 md:p-3 text-center whitespace-nowrap">
                        <span
                          className={`px-2 md:px-3 py-0.5 md:py-1 rounded text-[10px] md:text-xs font-bold ${getStatusBadgeColors(
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
          ) : (
            /* ------------ GRID VIEW ------------- */

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-6">
              {concernsForPage.map((concern) => (
                <div
                  key={concern.id}
                  className="rounded-lg border bg-white dark:bg-zinc-900 dark:border-zinc-800 text-black dark:text-black"
                >
                  <ConcernCard
                    concern={concern}
                    onClick={openDialog}
                  />
                </div>
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => goToPage(currentPage - 1)}
                      className={
                        currentPage === 1
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer dark:text-zinc-400 dark:hover:bg-zinc-800"
                      }
                    />
                  </PaginationItem>

                  {pageNumbers.map((page, index) =>
                    page === "..." ? (
                      <PaginationItem key={`ellipsis-${index}`}>
                        <PaginationEllipsis className="pointer-events-none dark:text-zinc-600" />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => goToPage(page)}
                          isActive={page === currentPage}
                          className="cursor-pointer dark:text-zinc-400 dark:data-[active=true]:bg-zinc-800 dark:data-[active=true]:text-zinc-100"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  )}

                  <PaginationItem>
                    <PaginationNext
                      onClick={() => goToPage(currentPage + 1)}
                      className={
                        currentPage === totalPages
                          ? "pointer-events-none opacity-50"
                          : "cursor-pointer dark:text-zinc-400 dark:hover:bg-zinc-800"
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>

              <div className="text-center text-sm mt-3 text-gray-500 dark:text-zinc-500">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredConcerns.length)} of{" "}
                {filteredConcerns.length} tickets.
              </div>
            </div>
          )}

          {/* DIALOG DETAILS */}
          <Dialog
            open={!!selectedConcern}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedConcern(null);
                setIsDeleteConfirmOpen(false);
              }
            }}
          >
            <DialogContent className="w-full sm:max-w-[400px] md:max-w-[500px] max-h-[90vh] overflow-y-auto dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100">
              <DialogHeader>
                <DialogTitle className="dark:text-zinc-100">Ticket #{selectedConcern?.id}</DialogTitle>
              </DialogHeader>

              {selectedConcern && (
                <div className="space-y-3 py-2 text-[11px] sm:text-sm md:text-sm">
                  <p><strong className="dark:text-zinc-200">Employee:</strong> {selectedConcern.Fullname}</p>
                  <p><strong className="dark:text-zinc-200">Department:</strong> {selectedConcern.department}</p>
                  <p>
                    <strong className="dark:text-zinc-200">Date Scheduled:</strong>{" "}
                    {selectedConcern.dateSched
                      ? new Date(selectedConcern.dateSched).toLocaleDateString("en-US", {
                        year: "numeric", month: "long", day: "2-digit",
                      })
                      : "N/A"}
                  </p>
                  <p><strong className="dark:text-zinc-200">Type:</strong> {selectedConcern.type}</p>
                  <p><strong className="dark:text-zinc-200">Request Type:</strong> {selectedConcern.requesttype}</p>
                  <p><strong className="dark:text-zinc-200">Mode:</strong> {selectedConcern.mode}</p>
                  <p><strong className="dark:text-zinc-200">Site:</strong> {selectedConcern.site}</p>
                  <p><strong className="dark:text-zinc-200">Group:</strong> {selectedConcern.group}</p>
                  <p><strong className="dark:text-zinc-200">Technician:</strong> {selectedConcern.technicianname}</p>
                  <p><strong className="dark:text-zinc-200">Processed By:</strong> {selectedConcern.processedBy}</p>
                  <p><strong className="dark:text-zinc-200">Priority:</strong> {selectedConcern.priority}</p>
                  <p>
                    <strong className="dark:text-zinc-200">Date Created:</strong>{" "}
                    {selectedConcern.createdAt
                      ? new Date(selectedConcern.createdAt).toLocaleString("en-US", {
                        year: "numeric", month: "long", day: "2-digit", hour: "numeric", minute: "2-digit", hour12: true,
                      })
                      : "N/A"}
                  </p>

                  <div>
                    <strong className="block mb-1 dark:text-zinc-200">Remarks:</strong>
                    <div className="p-2 sm:p-3 bg-gray-50 dark:bg-zinc-900 border dark:border-zinc-800 rounded-md italic whitespace-pre-wrap text-[11px] sm:text-sm dark:text-zinc-400">
                      {selectedConcern.remarks}
                    </div>
                  </div>

                  <Label htmlFor="ticket-status" className="block pt-2 text-[11px] sm:text-sm dark:text-zinc-200">
                    Update Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(v: ITConcern["status"]) => setStatus(v)}
                  >
                    <SelectTrigger id="ticket-status" className="text-[11px] sm:text-sm dark:bg-zinc-900 dark:border-zinc-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800">
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0 mt-4">
                <div className="flex gap-2 w-full text-sx sm:w-auto">
                  <Button
                    variant="destructive"
                    onClick={() => setIsDeleteConfirmOpen(true)}
                    className="flex items-center gap-2 sm:w-auto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button onClick={handleUpdate} disabled={selectedConcern?.status === status} className="dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-300">
                    Update Status
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline" className="dark:border-zinc-800 dark:hover:bg-zinc-900">Close</Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* DELETE CONFIRMATION DIALOG */}
          <Dialog
            open={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
          >
            <DialogContent className="sm:max-w-[425px] dark:bg-zinc-950 dark:border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-red-600 dark:text-red-500">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription className="dark:text-zinc-400">
                  Are you sure you want to permanently delete{" "}
                  <strong>Ticket #{selectedConcern?.id}</strong>? This action cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteConfirmOpen(false)}
                  className="dark:border-zinc-800 dark:hover:bg-zinc-900"
                >
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Confirm Delete
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}