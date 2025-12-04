"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Send, X } from "lucide-react";
import { SidebarLeft } from "../components/sidebar-left";
import { SidebarRight } from "../components/sidebar-right";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DialogFooter } from "@/components/ui/dialog";
import { ModeToggle } from "../components/mode-toggle";

export type PageType =
  | "home"
  | "inbox"
  | "openTickets"
  | "pendingConcerns"
  | "closedTickets"
  | "createConcern"
  | "trash";

interface Concern {
  FullName: string;
  department: string;
  requestType: string;
  type: string;
  mode: string;
  site: string;
  dateSched: string;
  priority: string;
  remarks: string;
}

interface ITConcern {
  id: string;
  employeeName: string;
  department: string; // Updated type
  type: string;
  remarks: string;
  dateCreated: string;
  status: string;
  priority: string;
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

interface ConcernItem {
  FullName1: string;
  department: string;
  dateSchedd: string;
  type: string;
  remarks: string;
  priority: string;
  requestType: string;
  mode: string;
  site: string;
  ConcernNumber?: string;
  createdAt?: Date;

}

export default function Page() {
  const [currentPage, setCurrentPage] = React.useState<PageType>("home");
  const [concerns, setConcerns] = React.useState<ConcernItem[]>([]);
  const [submitMessage, setSubmitMessage] = React.useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedConcern, setSelectedConcern] = React.useState<ConcernItem | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const initialConcernState: Concern = {
    FullName: "",
    department: "",
    requestType: "",
    type: "",
    mode: "",
    site: "",
    dateSched: "",
    priority: "",
    remarks: "",
  };

  // New concern form state
  const [newConcern, setNewConcern] = React.useState<Concern>(initialConcernState);

  // Validation errors for form
  const [validationErrors, setValidationErrors] = React.useState<Partial<Record<keyof Concern, boolean>>>({});

  const getErrorClass = (field: keyof Concern) =>
    validationErrors[field] ? "border-red-600" : "";

  // Auto-close sidebar on mobile
  const closeSidebarOnMobile = React.useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      const trigger = document.getElementById("sidebar-toggle-button");
      if (trigger) (trigger as HTMLElement).click();
    }
  }, []);

  const [loading, setLoading] = React.useState(true);

  // Helper mapper: backend -> ConcernItem
  const mapBackendToConcernItem = (backend: any): ConcernItem => {
    return {
      FullName1: backend.Fullname ?? backend.FullName ?? "",
      department: backend.department ?? "",
      dateSchedd: backend.dateSched ?? "",
      type: backend.type ?? "",
      remarks: backend.remarks ?? "",
      priority: backend.priority ?? "",
      requestType: backend.requesttype ?? backend.requestType ?? "",
      mode: backend.mode ?? "",
      site: backend.site ?? "",
      ConcernNumber: backend.ConcernNumber ?? undefined,
      createdAt: backend.createdAt ? new Date(backend.createdAt) : undefined,
    };
  };

  // Load all concerns once
  React.useEffect(() => {
    async function loadConcerns() {
      try {
        const res = await fetch("/api/euconcern");
        const data = await res.json();

        if (data.success && Array.isArray(data.data)) {
          // Map each backend object to our ConcernItem shape
          const mapped = data.data.map((it: any) => mapBackendToConcernItem(it));
          setConcerns(mapped);
        } else {
          console.error("euconcern: unexpected payload", data);
        }
      } catch (error) {
        console.error("Failed to load concerns:", error);
      } finally {
        setLoading(false);
      }
    }

    loadConcerns();
  }, []);

  // Pagination Setup
  const itemsPerPage = 10;
  const [currentPageNumber, setCurrentPageNumber] = useState(1);

  // Compute total pages
  const totalPages = Math.max(1, Math.ceil(concerns.length / itemsPerPage));

  // Slice displayed concerns
  const paginatedConcerns = concerns.slice(
    (currentPageNumber - 1) * itemsPerPage,
    currentPageNumber * itemsPerPage
  );

  // Handlers
  const goToNextPage = () => {
    if (currentPageNumber < totalPages) {
      setCurrentPageNumber((p) => p + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPageNumber > 1) {
      setCurrentPageNumber((p) => p - 1);
    }
  };

  // Open a concern by ConcernNumber (fetch full details)
  const handleOpenConcern = async (concernNumber: string) => {
    try {
      const res = await fetch(`/api/euconcern/${encodeURIComponent(concernNumber)}`);
      const data = await res.json();
      if (!res.ok) {
        alert(data.message || "Failed to load concern details.");
        return;
      }

      // Map backend result to frontend shape and open modal
      const mapped = mapBackendToConcernItem(data.data);
      setSelectedConcern(mapped);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Failed to load concern:", err);
      alert("Error loading concern details.");
    }
  };

  const handleUpdateConcern = async () => {
    if (!selectedConcern || !selectedConcern.ConcernNumber) return;

    // Map frontend fields to backend payload (backend expects exact keys)
    const payload = {
      Fullname: selectedConcern.FullName1 || "",
      department: selectedConcern.department || "",
      requesttype: selectedConcern.requestType || "",
      type: selectedConcern.type || "",
      remarks: selectedConcern.remarks || "",
      priority: selectedConcern.priority || "",
      mode: selectedConcern.mode || "",
      site: selectedConcern.site || "",
      dateSched: selectedConcern.dateSchedd || "",
    };

    try {
      const res = await fetch(`/api/euconcern/${encodeURIComponent(selectedConcern.ConcernNumber)}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Update failed");

      // Update local state: map payload back to ConcernItem fields
      setConcerns((prev) =>
        prev.map((c) =>
          c.ConcernNumber === selectedConcern.ConcernNumber
            ? {
              ...c,
              FullName1: payload.Fullname,
              department: payload.department,
              dateSchedd: payload.dateSched,
              type: payload.type,
              remarks: payload.remarks,
              priority: payload.priority,
              requestType: payload.requesttype,
              mode: payload.mode,
              site: payload.site,
            }
            : c
        )
      );

      setIsModalOpen(false);
      setSelectedConcern(null);
    } catch (error: any) {
      alert("Error updating concern: " + (error.message ?? error));
    }
  };

  const handleDeleteConcern = async () => {
    if (!selectedConcern || !selectedConcern.ConcernNumber) return;

    if (!confirm("Are you sure you want to delete this concern?")) return;

    try {
      const res = await fetch(`/api/euconcern/${encodeURIComponent(selectedConcern.ConcernNumber)}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || "Delete failed");

      setConcerns((prev) => prev.filter((c) => c.ConcernNumber !== selectedConcern.ConcernNumber));
      setIsModalOpen(false);
      setSelectedConcern(null);
    } catch (error: any) {
      alert("Failed to delete concern: " + (error.message ?? error));
    }
  };

  const concernsForPage = concerns ?? [];
  const [isRowView, setIsRowView] = useState(true);
  const [concernss, setConcernss] = useState<ITConcern[]>([]);


  // ----------------------------
  // DUMMY DATA FOR TESTING FILTERS
  // ----------------------------
  const DUMMY_CONCERNS_DATA: ITConcern[] = [];
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
        setConcernss(sortedData);
      } catch (error) {
        console.error("Fetch error:", error);
        // Ensure some data is available for testing filters/UI
        setConcernss(DUMMY_CONCERNS_DATA);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, []);






  const handlePageChange = React.useCallback(
    (page: PageType) => {
      setCurrentPage(page);
      closeSidebarOnMobile();
    },
    [closeSidebarOnMobile]
  );

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      Fullname: newConcern.FullName,
      department: newConcern.department,
      requesttype: newConcern.requestType,
      type: newConcern.type,
      remarks: newConcern.remarks,
      priority: newConcern.priority,
      mode: newConcern.mode,
      site: newConcern.site,
      dateSched: newConcern.dateSched || "",
    };

    try {
      const res = await fetch("/api/euconcern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok) {
        setSubmitMessage({ type: "success", message: data.message || "Concern created" });

        // If backend returns the created object or ConcernNumber, append it to local state
        // Attempt to create a new ConcernItem from backend data if available
        const newConcernItem: ConcernItem = mapBackendToConcernItem({
          Fullname: payload.Fullname,
          department: payload.department,
          dateSchedd: payload.dateSched,
          type: payload.type,
          remarks: payload.remarks,
          priority: payload.priority,
          requesttype: payload.requesttype,
          mode: payload.mode,
          site: payload.site,
          ConcernNumber: data?.data?.ConcernNumber ?? data?.data?.ConcernNumber ?? undefined,
        });

        setConcerns((prev) => [...prev, newConcernItem]);

        setNewConcern(initialConcernState);
        setValidationErrors({});
      } else {
        setSubmitMessage({ type: "error", message: data.message || "Failed to create concern." });
      }
    } catch (error) {
      console.error(error);
      setSubmitMessage({ type: "error", message: "Failed to submit concern." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const breadcrumbMap: Record<PageType, string> = {
    home: "DISRUPTIVE SOLUTIONS INC. HELP DESK",
    inbox: "Inbox",
    openTickets: "Open Tickets",
    pendingConcerns: "Pending Concern",
    closedTickets: "Closed Tickets",
    createConcern: "Create Concern",
    trash: "Trash",
  };

  return (
    <SidebarProvider>
      <SidebarLeft
        // I-pasa ang custom handler
        setCurrentPage={handlePageChange as React.Dispatch<React.SetStateAction<PageType>>}
      />

      <SidebarInset>
        <header className="bg-background sticky top-0 flex h-14 shrink-0 items-center gap-2">
          <div className="flex flex-1 items-center gap-2 px-3">
            {/* *** IDINAGDAG ANG ID PARA SA DOM TRIGGER *** */}
            <SidebarTrigger id="sidebar-toggle-button" />
            <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbPage className="line-clamp-1">{breadcrumbMap[currentPage]}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          <div className="mr-5">
            <ModeToggle />
          </div>
        </header>

        <div className="flex flex-1 flex-col gap-4 p-4">
          {currentPage === "home" && (
            <div className="max-w-4xl mx-auto space-y-6">

              {/* Welcome Header */}
              <div className="rounded-xl bg-background dark:bg-background-dark p-6 shadow-lg border border-border dark:border-border-dark">
                <h1 className="text-2xl font-bold text-foreground dark:text-foreground-dark">Welcome!</h1>
                <p className="text-muted-foreground dark:text-muted-foreground-dark text-sm mt-1">
                  Submit new concerns and easily track the status of your previous requests.
                </p>
              </div>

              {/* Main CTA - Create Concern */}
              <div className="rounded-xl bg-primary/10 dark:bg-primary/20 border border-primary/20 p-6 shadow-md">
                <h2 className="text-lg font-semibold text-primary dark:text-primary-dark">Need assistance?</h2>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark mt-1">
                  Create a new concern and our team will assist you shortly.
                </p>

                <Button
                  className="mt-4"
                  onClick={() => handlePageChange("createConcern")}
                >
                  <Send className="size-5 mr-2" />
                  Create New Concern
                </Button>
              </div>

              {/* Recent Concerns */}
              <div className="rounded-xl bg-background dark:bg-background-dark p-6 shadow-lg border border-border dark:border-border-dark">
                <h2 className="text-lg font-semibold text-foreground dark:text-foreground-dark">My Recent Concerns</h2>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground-dark mt-1">Here are your latest submissions:</p>

                <div className="mt-4 space-y-3">
                  <div className="p-4 border rounded-lg bg-muted dark:bg-muted-dark">
                    <p className="font-medium text-foreground dark:text-foreground-dark">No recent concerns found.</p>
                    <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">Your submitted concerns will appear here.</p>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => handlePageChange("openTickets")}
                  className="p-4 bg-background dark:bg-background-dark border rounded-xl shadow hover:bg-accent hover:text-accent-foreground text-left"
                >
                  <p className="font-semibold text-foreground dark:text-foreground-dark">Track My Concerns</p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">View all your submitted tickets</p>
                </button>

                <button
                  onClick={() => handlePageChange("inbox")}
                  className="p-4 bg-background dark:bg-background-dark border rounded-xl shadow hover:bg-accent hover:text-accent-foreground text-left"
                >
                  <p className="font-semibold text-foreground dark:text-foreground-dark">Inbox</p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">Receive updates and messages</p>
                </button>

                <button
                  onClick={() => handlePageChange("pendingConcerns")}
                  className="p-4 bg-background dark:bg-background-dark border rounded-xl shadow hover:bg-accent hover:text-accent-foreground text-left"
                >
                  <p className="font-semibold text-foreground dark:text-foreground-dark">Pending Concerns</p>
                  <p className="text-xs text-muted-foreground dark:text-muted-foreground-dark">Check concerns that are still in progress</p>
                </button>

              </div>

            </div>
          )}
          {currentPage === "createConcern" && (
            <div className="max-w-5xl mx-auto p-6 bg-card text-card-foreground rounded-xl shadow-2xl border border-border">
              <div className="flex items-center space-x-3 pb-4 border-b border-border">
                <Send className="size-6 text-primary" />
                <h2 className="text-2xl font-bold text-foreground">New Concern / Concern Entry</h2>
              </div>

              {submitMessage && (
                <div
                  className={`mt-4 p-4 rounded-lg text-sm font-semibold transition-all duration-300 ${submitMessage.type === "success"
                    ? "bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-200 border border-green-300 dark:border-green-700"
                    : "bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-200 border border-red-300 dark:border-red-700"
                    }`}
                >
                  {submitMessage.message}
                </div>
              )}

              <form onSubmit={handleManualSubmit} className="space-y-6 mt-4 text-sm">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
                  {/* Full Name */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={validationErrors.FullName ? "text-red-600 dark:text-red-400" : ""}>
                      Full Name *
                    </Label>
                    <Input
                      placeholder="Requester's Full Name"
                      value={newConcern.FullName}
                      className={getErrorClass("FullName")}
                      onChange={(e) => setNewConcern({ ...newConcern, FullName: e.target.value })}
                    />
                  </div>

                  {/* Department Select (Hardcoded) */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={getErrorClass("department")}>Department *</Label>
                    <Select
                      value={newConcern.department}
                      onValueChange={(val) => setNewConcern({ ...newConcern, department: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("department")}`}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sales Department">Sales Department</SelectItem>
                        <SelectItem value="IT Department">IT Department</SelectItem>
                        <SelectItem value="HR Department">HR Department</SelectItem>
                        <SelectItem value="Accounting Department">Accounting Department</SelectItem>
                        <SelectItem value="Procurement Department">Procurement Department</SelectItem>
                        <SelectItem value="Marketing Department">Marketing Department</SelectItem>
                        <SelectItem value="Ecommerce Department">Ecommerce Department</SelectItem>
                        <SelectItem value="CSR Department">CSR Department</SelectItem>
                        <SelectItem value="Admin Department">Admin Department</SelectItem>
                        <SelectItem value="Warehouse Department">Warehouse Department</SelectItem>
                        <SelectItem value="Logistic Department">Logistic Department</SelectItem>
                        <SelectItem value="Engineering Department">Engineering Department</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Request Type (Hardcoded) */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={getErrorClass("requestType")}>Request Type *</Label>
                    <Select
                      value={newConcern.requestType}
                      onValueChange={(val) => setNewConcern({ ...newConcern, requestType: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("requestType")}`}>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Incedent">Incedent</SelectItem>
                        <SelectItem value="Request">Request</SelectItem>

                      </SelectContent>
                    </Select>
                  </div>

                  {/* Type of Concern (Hardcoded) */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={getErrorClass("type")}>Type of Concern *</Label>
                    <Select
                      value={newConcern.type}
                      onValueChange={(val) => setNewConcern({ ...newConcern, type: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("type")}`}>
                        <SelectValue placeholder="Select concern type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="365 Services">365 Services</SelectItem>
                        <SelectItem value="Advisory (CRITICAL)">Advisory (CRITICAL)</SelectItem>
                        <SelectItem value="Advisory (NON-CRITICAL)">Advisory (NON-CRITICAL)</SelectItem>
                        <SelectItem value="Foriclient">Foriclient</SelectItem>
                        <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Network">Network</SelectItem>
                        <SelectItem value="PC/Software">PC/Software</SelectItem>
                        <SelectItem value="SNOC">SNOC</SelectItem>
                        <SelectItem value="System">System</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Mode (Hardcoded) */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={getErrorClass("mode")}>Mode *</Label>
                    <Select
                      value={newConcern.mode}
                      onValueChange={(val) => setNewConcern({ ...newConcern, mode: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("mode")}`}>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Web Form">Web Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Site (Hardcoded) */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={getErrorClass("site")}>Site *</Label>
                    <Select
                      value={newConcern.site}
                      onValueChange={(val) => setNewConcern({ ...newConcern, site: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("site")}`}>
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Disruptive Solutions Inc - Pasig">Disruptive Solutions Inc - Pasig</SelectItem>
                        <SelectItem value="Disruptive Solutions Inc - J&L">Disruptive Solutions Inc - J&L</SelectItem>
                        <SelectItem value="Disruptive Solutions Inc - Primex">Disruptive Solutions Inc - Primex</SelectItem>
                        <SelectItem value="Buildchem">Buildchem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Date Sched */}
                  <div className="flex flex-col space-y-1.5">
                    <Label>Date Sched (optional)</Label>
                    <Input
                      type="date"
                      value={newConcern.dateSched}
                      onChange={(e) => setNewConcern({ ...newConcern, dateSched: e.target.value })}
                    />
                  </div>

                  {/* Priority (Hardcoded) */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={getErrorClass("priority")}>Priority *</Label>
                    <Select
                      value={newConcern.priority}
                      onValueChange={(val) => setNewConcern({ ...newConcern, priority: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("priority")}`}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Low">Low</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                </div>

                {/* Remarks */}
                <div className="flex flex-col space-y-1.5">
                  <Label className={validationErrors.remarks ? "text-red-600 dark:text-red-400" : ""}>Remarks *</Label>
                  <Textarea
                    placeholder="Enter remarks..."
                    value={newConcern.remarks}
                    className={getErrorClass("remarks")}
                    onChange={(e) => setNewConcern({ ...newConcern, remarks: e.target.value })}
                  />
                </div>

                {/* Form Footer */}
                <DialogFooter className="pt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setNewConcern(initialConcernState)
                      setValidationErrors({})
                      setSubmitMessage(null)
                    }}
                  >
                    <X className="size-4 mr-2" /> Clear Form
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting..." : (<><Send className="size-4 mr-2" /> Submit Concern</>)}
                  </Button>
                </DialogFooter>
              </form>
            </div>
          )}


          {currentPage === "inbox" && (
            <div className="max-w-4xl mx-auto w-full">
              <h2 className="text-2xl font-bold text-foreground mb-2">Inbox</h2>

              {/* READ / UNREAD COUNTERS */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex items-center gap-2 bg-red-100 dark:bg-red-800 text-red-700 dark:text-red-200 px-3 py-1 rounded-full">
                  <span className="font-medium">Unread</span>
                  <span className="font-bold">2</span> {/* Replace with unreadCount */}
                </div>

                <div className="flex items-center gap-2 bg-green-100 dark:bg-green-800 text-green-700 dark:text-green-200 px-3 py-1 rounded-full">
                  <span className="font-medium">Read</span>
                  <span className="font-bold">1</span> {/* Replace with readCount */}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card text-card-foreground shadow-sm divide-y">
                {/* Row Example 1 */}
                <div className="flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">TCK-000145</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      Technician assigned to your request. Please expect an update soon.
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">2 hours ago</div>
                  </div>
                </div>

                {/* Row Example 2 */}
                <div className="flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="w-3 h-3 bg-gray-400 dark:bg-gray-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">TCK-000142</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      Parts ordered. Will update once available.
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">1 day ago • Read</div>
                  </div>
                </div>

                {/* Row Example 3 */}
                <div className="flex items-start gap-3 p-4 hover:bg-muted/50 cursor-pointer">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mt-1"></div>
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">TCK-000138</div>
                    <div className="text-sm text-muted-foreground mt-0.5">
                      IT is currently inspecting your workstation issue.
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">3 hours ago</div>
                  </div>
                </div>
              </div>
            </div>
          )}



          {/* OPEN TICKETS */}
          {currentPage === "openTickets" && (
            <div className="max-w-6xl mx-auto w-full">
              <h2 className="text-2xl font-bold text-foreground mb-4">Open Tickets</h2>

              <div className="rounded-xl border border-border shadow-sm overflow-hidden bg-card">
                {/* Table Header */}
                <div className="grid grid-cols-3 bg-muted/60 px-4 py-3 text-sm font-semibold text-muted-foreground border-b border-border">
                  <div>Concern</div>
                  <div>Remarks</div>
                  <div className="text-right">Read Status</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {paginatedConcerns.map((item) => {
                    const key = item.ConcernNumber;
                    return (
                      <div
                        key={key}
                        onClick={() => item.ConcernNumber && handleOpenConcern(item.ConcernNumber)}
                        className="grid grid-cols-3 px-4 py-3 text-sm cursor-pointer transition 
                         hover:bg-accent/60 hover:text-accent-foreground"
                      >
                        {/* Concern */}
                        <div className="font-medium text-foreground">
                          {item.type || "No type"}
                        </div>

                        <div className="font-medium text-foreground">
                          {item.remarks || "no remarks"}
                        </div>

                        {/* Read Status */}
                        <div className="text-right">
                          <span className="px-2 py-1 text-xs rounded-full 
                                 bg-red-100 text-red-700 
                                 dark:bg-red-900/50 dark:text-red-300 font-semibold">
                            Unread
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center gap-3 p-4 bg-card">
                  <button
                    onClick={goToPrevPage}
                    disabled={currentPageNumber === 1}
                    className="px-4 py-2 text-sm rounded-full border border-border
                     bg-background hover:bg-accent hover:text-accent-foreground 
                     disabled:opacity-40 disabled:hover:bg-background transition"
                  >
                    ← Previous
                  </button>

                  <span className="text-sm font-semibold px-4 py-2 rounded-full 
                         bg-muted text-muted-foreground border border-border">
                    Page {currentPageNumber} of {totalPages}
                  </span>

                  <button
                    onClick={goToNextPage}
                    disabled={currentPageNumber === totalPages}
                    className="px-4 py-2 text-sm rounded-full border border-border 
                     bg-background hover:bg-accent hover:text-accent-foreground
                     disabled:opacity-40 disabled:hover:bg-background transition"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* MODAL */}
              {isModalOpen && selectedConcern && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm transition">
                  <div className="bg-card p-6 rounded-xl max-w-lg w-full shadow-xl border border-border">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-foreground">Concern Details</h2>
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          setSelectedConcern(null);
                        }}
                        className="text-muted-foreground hover:text-foreground transition"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Editable Form */}
                    <div className="grid grid-cols-1 gap-3 text-sm max-h-[70vh] overflow-y-auto pr-2">

                      {/* Name */}
                      <div>
                        <label className="font-semibold text-foreground">Employee Name:</label>
                        <input
                          type="text"
                          value={selectedConcern.FullName1 || ""}
                          onChange={(e) => setSelectedConcern({ ...selectedConcern, FullName1: e.target.value })}
                          className="w-full border border-border bg-background text-foreground
                           px-2 py-1 rounded focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>


                      {/* Department Select (Hardcoded) */}
                      <div className="flex flex-col space-y-1.5">
                        <Label className={getErrorClass("department")}>Department *</Label>
                        <Select
                          value={selectedConcern.department || ""}
                          onValueChange={(val) => setNewConcern({ ...newConcern, department: val })}
                        >
                          <SelectTrigger className={`w-full ${getErrorClass("department")}`}>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Sales Department">Sales Department</SelectItem>
                            <SelectItem value="IT Department">IT Department</SelectItem>
                            <SelectItem value="HR Department">HR Department</SelectItem>
                            <SelectItem value="Accounting Department">Accounting Department</SelectItem>
                            <SelectItem value="Procurement Department">Procurement Department</SelectItem>
                            <SelectItem value="Marketing Department">Marketing Department</SelectItem>
                            <SelectItem value="Ecommerce Department">Ecommerce Department</SelectItem>
                            <SelectItem value="CSR Department">CSR Department</SelectItem>
                            <SelectItem value="Admin Department">Admin Department</SelectItem>
                            <SelectItem value="Warehouse Department">Warehouse Department</SelectItem>
                            <SelectItem value="Logistic Department">Logistic Department</SelectItem>
                            <SelectItem value="Engineering Department">Engineering Department</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Type of Concern (Hardcoded) */}
                      <div className="flex flex-col space-y-1.5">
                        <Label className={getErrorClass("type")}>Type of Concern *</Label>
                        <Select
                          value={selectedConcern.type || ""}
                          onValueChange={(val) => setNewConcern({ ...newConcern, type: val })}
                        >
                          <SelectTrigger className={`w-full ${getErrorClass("type")}`}>
                            <SelectValue placeholder="Select concern type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="365 Services">365 Services</SelectItem>
                            <SelectItem value="Advisory (CRITICAL)">Advisory (CRITICAL)</SelectItem>
                            <SelectItem value="Advisory (NON-CRITICAL)">Advisory (NON-CRITICAL)</SelectItem>
                            <SelectItem value="Foriclient">Foriclient</SelectItem>
                            <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="Network">Network</SelectItem>
                            <SelectItem value="PC/Software">PC/Software</SelectItem>
                            <SelectItem value="SNOC">SNOC</SelectItem>
                            <SelectItem value="System">System</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Remarks */}
                      <div>
                        <label className="font-semibold text-foreground">Remarks:</label>
                        <textarea
                          value={selectedConcern.remarks || ""}
                          onChange={(e) => setSelectedConcern({ ...selectedConcern, remarks: e.target.value })}
                          className="w-full border border-border bg-background text-foreground
                           px-2 py-1 rounded focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>

                      {/* Date */}
                      <div>
                        <label className="font-semibold text-foreground">Date Scheduled:</label>
                        <input
                          type="date"
                          value={selectedConcern.dateSchedd ? selectedConcern.dateSchedd.substring(0, 10) : ""}
                          onChange={(e) =>
                            setSelectedConcern({
                              ...selectedConcern,
                              dateSchedd: e.target.value,
                            })
                          }
                          className="w-full border border-border bg-background text-foreground
                          px-2 py-1 rounded focus:ring-2 focus:ring-primary outline-none"
                        />
                      </div>

                      {/* Priority (Hardcoded) */}
                      <div className="flex flex-col space-y-1.5">
                        <Label className={getErrorClass("priority")}>Priority *</Label>
                        <Select
                          value={selectedConcern.priority || ""}
                          onValueChange={(val) => setNewConcern({ ...newConcern, priority: val })}
                        >
                          <SelectTrigger className={`w-full ${getErrorClass("priority")}`}>
                            <SelectValue placeholder="Select priority" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Low">Low</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Critical">Critical</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Concern Number */}
                      <div>
                        <label className="font-semibold text-foreground">Concern Number:</label>
                        <input
                          type="text"
                          value={selectedConcern.ConcernNumber || ""}
                          readOnly
                          className="w-full border border-border bg-muted text-foreground/70 px-2 py-1 rounded"
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={handleUpdateConcern}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
                      >
                        Update
                      </button>

                      <button
                        onClick={handleDeleteConcern}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          setSelectedConcern(null);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 transition"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}





          {currentPage === "closedTickets" && (
            <div className="max-w-5xl mx-auto w-full">

              <h2 className="text-2xl font-bold text-foreground mb-4">Closed Tickets</h2>

              <div className="rounded-xl border border-border shadow-sm overflow-hidden">

                {/* Table Header */}
                <div className="grid grid-cols-3 bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground border-b border-border">
                  <div>Ticket #</div>
                  <div>Subject / Concern</div>
                  <div className="text-right">Date Closed</div>
                </div>

                {/* Sample Rows */}
                <div className="divide-y divide-border">
                  {/* Row 1 */}
                  <div className="grid grid-cols-3 px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <div className="font-medium text-foreground">TCK-000121</div>
                    <div className="text-muted-foreground">Email account reset completed</div>
                    <div className="text-right text-muted-foreground">2025-01-22</div>
                  </div>

                  {/* Row 2 */}
                  <div className="grid grid-cols-3 px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <div className="font-medium text-foreground">TCK-000118</div>
                    <div className="text-muted-foreground">Printer installation done</div>
                    <div className="text-right text-muted-foreground">2025-01-20</div>
                  </div>

                  {/* Row 3 */}
                  <div className="grid grid-cols-3 px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <div className="font-medium text-foreground">TCK-000115</div>
                    <div className="text-muted-foreground">Laptop setup completed</div>
                    <div className="text-right text-muted-foreground">2025-01-18</div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {currentPage === "trash" && <div>Trash Page Content</div>}

          {currentPage === "pendingConcerns" && (
            <div className="max-w-6xl mx-auto w-full">

              <h2 className="text-2xl font-bold text-foreground mb-4">
                Pending Concerns
              </h2>

              <div className="rounded-xl border border-border shadow-sm overflow-hidden">

                <div className="bg-white border rounded-lg overflow-x-auto">
                  <table className="min-w-full text-sm">

                    {/* TABLE HEADER */}
                    <thead className="bg-gray-700 text-white sticky top-0">
                      <tr>
                        <th className="p-3 text-left">Employee</th>
                        <th className="p-3 text-left">Department</th>
                        <th className="p-3 text-left">Date Scheduled</th>
                        <th className="p-3 text-left">Site</th>
                        <th className="p-3 text-left">Status</th>
                        <th className="p-3 text-left">Remarks</th>
                        <th className="p-3 text-left">Priority</th>
                        <th className="p-3 text-left">Update Status</th>
                      </tr>
                    </thead>

                    {/* TABLE BODY */}
                    <tbody>
                      {(concernsForPage ?? []).map((c: any) => (
                        <tr key={c.ticketNumber} className="border-b last:border-b-0">
                          <td className="p-3">{c.employeeName}</td>
                          <td className="p-3">{c.department}</td>
                          <td className="p-3">{c.dateSched}</td>
                          <td className="p-3">{c.site}</td>
                          <td className="p-3">{c.status}</td>
                          <td className="p-3 truncate max-w-xs">{c.remarks}</td>
                          <td className="p-3 text-center">{c.priority}</td>
                          <td className="p-3 text-center">
                            <span className="px-3 py-1 rounded text-xs font-bold">
                              {c.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}


        </div>
      </SidebarInset>
      <SidebarRight />
    </SidebarProvider>
  )
}