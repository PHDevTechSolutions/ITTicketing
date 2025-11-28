"use client";

import { useEffect, useState, useMemo } from "react";
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
const handleImageChange = () => {};
const handleLogout = () => {
  toast.info("Logged out (Dummy Function)");
};
const isProfileLoading = false;
const profileError = "";

// Added dummy currentUser state to prevent error in JSX
const DUMMY_CURRENT_USER: CurrentUser = {
  Firstname: "Admin",
  Lastname: "User",
  Username: "admin.user",
  Email: "admin@company.com",
  Role: "IT Administrator",
  ReferenceID: "A001",
  createdAt: "2024-01-15T10:00:00Z",
};

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
      return "bg-red-50 hover:bg-red-100/70";
    case "High":
      return "bg-orange-50 hover:bg-orange-100/70";
    case "Medium":
      return "bg-yellow-50 hover:bg-yellow-100/70";
    case "Low":
    default:
      return "bg-green-50 hover:bg-green-100/70";
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
      className={`w-full h-full cursor-pointer transition-colors ${getPriorityBg(
        concern.priority
      )}`}
      onClick={() => onClick(concern)}
    >
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span className="text-lg font-bold">{concern.type}</span>
          <span className="text-xs font-semibold uppercase px-2 py-1 rounded-full border border-current">
            {concern.priority}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm">
          <strong>Employee:</strong> {concern.employeeName}
        </p>
        <p className="text-sm">
          <strong>Department:</strong> {concern.department}
        </p>
        <p className="italic line-clamp-2 text-xs text-gray-600 h-8">
          {concern.remarks}
        </p>

        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-gray-500">ID: {concern.id}</span>
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadgeColors(
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
  const [currentUser, setCurrentUser] = useState<CurrentUser>(DUMMY_CURRENT_USER); 

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
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

    // 1. Search Filter (by ID, Employee, or Remarks)
    if (lowerSearchTerm) {
      results = results.filter(
        (c) =>
          c.id.toLowerCase().includes(lowerSearchTerm) ||
          c.employeeName.toLowerCase().includes(lowerSearchTerm) ||
          c.remarks.toLowerCase().includes(lowerSearchTerm)
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

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const pageNumbers = useMemo(() => {
    const pages = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage === 1) end = 3;
      if (currentPage === totalPages) start = totalPages - 2;

      for (let i = start; i <= end; i++) {
        if (i !== 1 && i !== totalPages) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }

    return pages.filter((item, index, self) => {
      // Remove consecutive ellipses and duplicates
      if (item === "..." && self[index - 1] === "...") return false;
      return self.indexOf(item) === index;
    });
  }, [totalPages, currentPage]);

  // ----------------------------
  // API Handlers (Unchanged)
  // ----------------------------
  const openDialog = (concern: ITConcern) => {
    setSelectedConcern(concern);
    setStatus(concern.status);
    setIsDeleteConfirmOpen(false);
  };

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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
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
                  <BreadcrumbPage>IT Support Tickets</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

{/* PROFILE + LOGOUT */}
          <div className="flex items-center gap-3">
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Profile"><User className="h-5 w-5 text-gray-600" /></Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[400px] bg-white rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-center">Profile Information</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col items-center mt-4 mb-2">
                  <div className="relative">
                    <img
                      src={
                        profilePic ||
                        "https://cdn-icons-png.flaticon.com/512/149/149071.png"
                      }
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-gray-300 shadow-sm"
                    />
                    <label
                      htmlFor="profile-upload"
                      className="absolute bottom-0 right-0 bg-gray-700 text-white text-xs px-2 py-1 rounded-md cursor-pointer hover:bg-gray-800"
                    >
                      Change
                    </label>
                    <input
                      type="file"
                      id="profile-upload"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
                <div className="grid gap-4 py-4 text-sm">
                  {/* 📌 INAYOS: Profile loading state at display */}
                  {isProfileLoading ? (
                    <p>Loading profile...</p>
                  ) : currentUser ? (
                    <>
                      <div><Label>Full Name:</Label><p className="font-medium text-gray-800">{currentUser.Firstname} {currentUser.Lastname}</p></div>
                      <div><Label>Username:</Label><p className="font-medium text-gray-800">{currentUser.Username}</p></div>
                      <div><Label>Email:</Label><p className="font-medium text-gray-800">{currentUser.Email}</p></div>
                      <div><Label>Role:</Label><p className="font-medium text-gray-800">{currentUser.Role}</p></div>
                      <div><Label>Reference ID:</Label><p className="font-medium text-gray-800">{currentUser.ReferenceID}</p></div>
                      <div><Label>Joined:</Label><p className="font-medium text-gray-800">{formatDate(new Date(currentUser.createdAt))}</p></div>
                    </>
                  ) : (
                    <p className="text-gray-500">Profile not found. Make sure userId is set in localStorage.</p>
                  )}
                </div>
                <DialogFooter className="flex justify-center">
                  <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleLogout}
              variant="secondary"
              size="icon"
              className="bg-red-50 text-red-600 hover:bg-red-100"
              title="Logout"
            ><LogOut className="h-5 w-5" /></Button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
            {/* TITLE AND VIEW TOGGLE (Unchanged) */}
            <div className="flex items-center gap-4 mb-3 md:mb-0">
              <h1 className="text-3xl font-extrabold text-gray-700">
                IT Support Tickets
              </h1>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsRowView(!isRowView)}
                className="bg-white hover:bg-gray-100"
                title={
                  isRowView ? "Switch to Grid View" : "Switch to List View"
                }
              >
                {isRowView ? (
                  <List className="h-5 w-5 text-gray-700" />
                ) : (
                  <LayoutGrid className="h-5 w-5 text-gray-700" />
                )}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-white hover:bg-gray-100 border-gray-300"
              >
                <Download className="h-5 w-5 text-gray-600" /> Download
              </Button>

              <div className="relative w-64">
                <Input
                  type="search"
                  placeholder="Search by ID, Employee, or Remarks..."
                  className="pl-4 h-10 pr-10 rounded-lg bg-white border-gray-300 focus-visible:ring-2 focus-visible:ring-gray-500"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              </div>

              {/* NEW DEPARTMENT FILTER */}
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
              >
                <SelectTrigger className="w-[150px] h-10 bg-white border-gray-300 focus:ring-gray-500">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  <Separator />
                  <SelectItem value="HR">HR</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="IT">IT</SelectItem>
                  <SelectItem value="Sales">Sales</SelectItem>
                  {/* ADDED: Other dummy departments to demonstrate filter */}
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Operations">Operations</SelectItem>
                </SelectContent>
              </Select>
              {/* END NEW DEPARTMENT FILTER */}

              {/* EXISTING STATUS/PRIORITY FILTER */}
              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[180px] h-10 bg-white border-gray-300 focus:ring-gray-500">
                  <SelectValue placeholder="Filter by Status/Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <Separator />
                  <SelectItem value="status-pending">Status: Pending</SelectItem>
                  <SelectItem value="status-ongoing">Status: Ongoing</SelectItem>
                  <SelectItem value="status-finished">
                    Status: Finished
                  </SelectItem>
                  <Separator />
                  <SelectItem value="priority-critical">
                    Priority: Critical
                  </SelectItem>
                  <SelectItem value="priority-high">Priority: High</SelectItem>
                  <SelectItem value="priority-medium">
                    Priority: Medium
                  </SelectItem>
                  <SelectItem value="priority-low">Priority: Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* LIST OR GRID (Unchanged) */}
          {concernsForPage.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-lg border border-dashed text-gray-500">
              No tickets found matching your criteria.
            </div>
          ) : isRowView ? (
            /* ------------ LIST VIEW ------------- */
            <div className="bg-white border rounded-lg overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-700 text-white sticky top-0">
                  <tr>
                    <th className="p-3 text-left">ID</th>
                    <th className="p-3 text-left">Employee</th>
                    <th className="p-3 text-left">Department</th>
                    <th className="p-3 text-left">Type</th>
                    <th className="p-3 text-left">Remarks</th>
                    <th className="p-3 text-center">Priority</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {concernsForPage.map((c) => (
                    <tr
                      key={c.id}
                      onClick={() => openDialog(c)}
                      className={`${getPriorityBg(
                        c.priority
                      )} cursor-pointer transition-colors border-b last:border-b-0`}
                    >
                      <td className="p-3 font-bold text-gray-700">{c.id}</td>
                      <td className="p-3">{c.employeeName}</td>
                      <td className="p-3">{c.department}</td>
                      <td className="p-3">{c.type}</td>
                      <td className="p-3 truncate max-w-xs">{c.remarks}</td>
                      <td className="p-3 text-center">{c.priority}</td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-3 py-1 rounded text-xs font-bold ${getStatusBadgeColors(
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {concernsForPage.map((concern) => (
                <ConcernCard
                  key={concern.id}
                  concern={concern}
                  onClick={openDialog}
                />
              ))}
            </div>
          )}

          {/* PAGINATION (Unchanged) */}
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
                          : undefined
                      }
                    />
                  </PaginationItem>

                  {pageNumbers.map((page, index) =>
                    page === "..." ? (
                      <PaginationItem key={index}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    ) : (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => goToPage(page as number)}
                          isActive={page === currentPage}
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
                          : undefined
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
              <div className="text-center text-sm mt-3 text-gray-500">
                Showing {startIndex + 1} to{" "}
                {Math.min(endIndex, filteredConcerns.length)} of{" "}
                {filteredConcerns.length} tickets.
              </div>
            </div>
          )}

          <Dialog
            open={!!selectedConcern}
            onOpenChange={(open) => {
              if (!open) {
                setSelectedConcern(null);
                setIsDeleteConfirmOpen(false);
              }
            }}
          >
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Ticket #{selectedConcern?.id}</DialogTitle>
              </DialogHeader>

              {selectedConcern && (
                <div className="space-y-3 py-2 text-sm">
                  <p>
                    <strong>Employee:</strong> {selectedConcern.employeeName}
                  </p>{" "}
                  {/* Changed from Fullname to employeeName as that's used in the card/table, but Fullname is still available from the interface */}
                  <p>
                    <strong>Department:</strong> {selectedConcern.department}
                  </p>
                  <p>
                    <strong>Date Scheduled:</strong> {selectedConcern.dateSched}
                  </p>{" "}
                  {/* ADDED: dateSched (from interface) */}
                  <p>
                    <strong>Type:</strong> {selectedConcern.type}
                  </p>
                  <p>
                    <strong>Request Type:</strong> {selectedConcern.requesttype}
                  </p>{" "}
                  {/* ADDED: requesttype (from interface) */}
                  <p>
                    <strong>Mode:</strong> {selectedConcern.mode}
                  </p>{" "}
                  {/* ADDED: mode (from interface) */}
                  <p>
                    <strong>Site:</strong> {selectedConcern.site}
                  </p>{" "}
                  {/* ADDED: site (from interface) */}
                  <p>
                    <strong>Group:</strong> {selectedConcern.group}
                  </p>{" "}
                  {/* ADDED: group (from interface) */}
                  <p>
                    <strong>Technician:</strong> {selectedConcern.technicianname}
                  </p>{" "}
                  {/* ADDED: technicianname (from interface) */}
                  <p>
                    <strong>Processed By:</strong> {selectedConcern.processedBy}
                  </p>{" "}
                  {/* ADDED: processedBy (from interface) */}
                  <p>
                    <strong>Priority:</strong> {selectedConcern.priority}
                  </p>
                  <p>
                    <strong>Status:</strong> {selectedConcern.status}
                  </p>

                  <div>
                    <strong className="block mb-1">Remarks:</strong>
                    <div className="p-3 bg-gray-50 border rounded-md italic whitespace-pre-wrap">
                      {selectedConcern.remarks}
                    </div>
                  </div>

                  <Label htmlFor="ticket-status" className="block pt-2">
                    Update Status
                  </Label>
                  <Select
                    value={status}
                    onValueChange={(v: ITConcern["status"]) => setStatus(v)} // Fixed: Using ITConcern["status"] for clarity, though IncomingTicketData["status"] is also correct.
                  >
                    <SelectTrigger id="ticket-status">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Ongoing">Ongoing</SelectItem>
                      <SelectItem value="Finished">Finished</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <DialogFooter className="flex justify-between items-center">
                <Button
                  variant="destructive"
                  onClick={() => setIsDeleteConfirmOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" /> Delete Ticket
                </Button>

                <div className="flex gap-2">
                  <Button
                    onClick={handleUpdate}
                    disabled={selectedConcern?.status === status}
                  >
                    Update Status
                  </Button>
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </div>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* 🗑️ DELETE CONFIRMATION DIALOG (Unchanged) */}
          <Dialog
            open={isDeleteConfirmOpen}
            onOpenChange={setIsDeleteConfirmOpen}
          >
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-red-600">
                  Confirm Deletion
                </DialogTitle>
                <DialogDescription>
                  Are you sure you want to permanently delete{" "}
                  **Ticket #{selectedConcern?.id}**? This action cannot be
                  undone.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDeleteConfirmOpen(false)}
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