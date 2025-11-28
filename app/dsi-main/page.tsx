"use client";

import * as React from "react";
import { useState } from "react";
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

interface ConcernItem {
  _id: string; // MongoDB ObjectId as string
  Fullname: string;
  department: string;
  dateSched: string;
  type: string;
  remarks: string;
  priority: string;
  requesttype: string;
  mode: string;
  site: string;
  ConcernNumber?: string;
  createdAt?: Date;
}


type Department = {
  _id: string;
  name: string;
  createdAt: string;
};

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
    validationErrors[field] ? "border-red-600" : ""

  // Auto-close sidebar on mobile
  const closeSidebarOnMobile = React.useCallback(() => {
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      const trigger = document.getElementById("sidebar-toggle-button")
      if (trigger) (trigger as HTMLElement).click()
    }
  }, [])

  const [departments, setDepartments] = React.useState<Department[]>([]);
  const [requestTypes, setRequestTypes] = React.useState<string[]>([]);
  const [concernTypes, setConcernTypes] = React.useState<string[]>([]);
  const [modes, setModes] = React.useState<string[]>([]);
  const [sites, setSites] = React.useState<string[]>([]);
  const [priorities, setPriorities] = React.useState<string[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [deptRes, rtRes, typeRes, modeRes, siteRes, priorityRes] = await Promise.all([
          fetch("/api/departments"),
          fetch("/api/requesttype"),
          fetch("/api/typeofconcern"),
          fetch("/api/mode"),
          fetch("/api/site"),
          fetch("/api/priority")
        ]);

        const deptData = await deptRes.json();
        const rtData = await rtRes.json();
        const typeData = await typeRes.json();
        const modeData = await modeRes.json();
        const siteData = await siteRes.json();
        const priorityData = await priorityRes.json();

        setDepartments(deptData.data.map((d: any) => ({
          _id: d._id.toString(),
          name: d.name,
          createdAt: d.createdAt
        })));

        setRequestTypes(rtData.data || []);
        setConcernTypes(typeData.data || []);
        setModes(modeData.data || []);
        setSites(siteData.data || []);
        setPriorities(priorityData.data || []);

      } catch (err) {
        console.error("Failed to fetch dropdown data:", err);
      }
    };

    fetchData();
  }, []);



  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    async function loadConcerns() {
      try {
        const res = await fetch("/api/euconcern");
        const data = await res.json();

        if (data.success) {
          setConcerns(data.data); // ito yung formatted list
        }
      } catch (error) {
        console.error("Failed to load concerns:", error);
      } finally {
        setLoading(false);
      }
    }

    loadConcerns();
  }, []);

  const handleUpdateConcern = async () => {
    if (!selectedConcern) return;

    try {
const res = await fetch(`/api/euconcern/${String(selectedConcern._id)}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(selectedConcern),
});

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      // Update local state
      setConcerns((prev) =>
        prev.map((c) => (c._id === selectedConcern._id ? selectedConcern : c))
      );
      setIsModalOpen(false);
      setSelectedConcern(null);
    } catch (error: any) {
      alert("Error updating concern: " + error.message);
    }
  };


  const handleDeleteConcern = async () => {
    if (!selectedConcern) return;

    if (!confirm("Are you sure you want to delete this concern?")) return;

    try {
      const res = await fetch(`/api/euconcern/${selectedConcern._id}`, {
        method: "DELETE",
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      setConcerns((prev) => prev.filter((c) => c._id !== selectedConcern._id));
      setIsModalOpen(false);
      setSelectedConcern(null);
    } catch (error: any) {
      alert("Failed to delete concern: " + error.message);
    }
  };


  const handlePageChange = React.useCallback((page: PageType) => {
    setCurrentPage(page)
    closeSidebarOnMobile()
  }, [closeSidebarOnMobile])

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

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
    }

    try {
      const res = await fetch("/api/euconcern", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) {
        setSubmitMessage({ type: "success", message: data.message })
        setNewConcern(initialConcernState)
        setValidationErrors({})
      } else {
        setSubmitMessage({ type: "error", message: data.message })
      }
    } catch (error) {
      console.error(error)
      setSubmitMessage({ type: "error", message: "Failed to submit concern." })
    } finally {
      setIsSubmitting(false)
    }
  }

  const breadcrumbMap: Record<PageType, string> = {
    home: "DISRUPTIVE SOLUTIONS INC. HELP DESK",
    inbox: "Inbox",
    openTickets: "Open Tickets",
    pendingConcerns: "Pending Concern",
    closedTickets: "Closed Tickets",
    createConcern: "Create Concern",
    trash: "Trash",
  }

  const openCreateConcern = (id: string) => {
    console.log("Opening concern:", id);
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
                  <Send className="size-4 mr-2" />
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

                  {/* Department Select (Required + Red Border) */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={getErrorClass("department")}>Department</Label>
                    <Select
                      value={newConcern.department}
                      onValueChange={(val) => setNewConcern({ ...newConcern, department: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("department")}`}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept._id} value={dept.name}>
                            {dept.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Request Type */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={validationErrors.requestType ? "text-red-600 dark:text-red-400" : ""}>
                      Request Type *
                    </Label>
                    <Select
                      value={newConcern.requestType}
                      onValueChange={(val) => setNewConcern({ ...newConcern, requestType: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("requestType")}`}>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        {requestTypes.map((rt, index) => (
                          <SelectItem key={index} value={rt}>{rt}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Type of Concern */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={validationErrors.type ? "text-red-600 dark:text-red-400" : ""}>
                      Type of Concern *
                    </Label>
                    <Select
                      value={newConcern.type}
                      onValueChange={(val) => setNewConcern({ ...newConcern, type: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("type")}`}>
                        <SelectValue placeholder="Select concern type" />
                      </SelectTrigger>
                      <SelectContent>
                        {concernTypes.map((c, index) => (
                          <SelectItem key={index} value={c}>{c}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {/* Mode */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={validationErrors.mode ? "text-red-600 dark:text-red-400" : ""}>
                      Mode *
                    </Label>
                    <Select
                      value={newConcern.mode}
                      onValueChange={(val) => setNewConcern({ ...newConcern, mode: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("mode")}`}>
                        <SelectValue placeholder="Select mode" />
                      </SelectTrigger>
                      <SelectContent>
                        {modes.map((m, index) => (
                          <SelectItem key={index} value={m}>{m}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Site */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={validationErrors.site ? "text-red-600 dark:text-red-400" : ""}>
                      Site *
                    </Label>
                    <Select
                      value={newConcern.site}
                      onValueChange={(val) => setNewConcern({ ...newConcern, site: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("site")}`}>
                        <SelectValue placeholder="Select site" />
                      </SelectTrigger>
                      <SelectContent>
                        {sites.map((s, index) => (
                          <SelectItem key={index} value={s}>{s}</SelectItem>
                        ))}
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

                  {/* Priority */}
                  <div className="flex flex-col space-y-1.5">
                    <Label className={validationErrors.priority ? "text-red-600 dark:text-red-400" : ""}>
                      Priority *
                    </Label>
                    <Select
                      value={newConcern.priority}
                      onValueChange={(val) => setNewConcern({ ...newConcern, priority: val })}
                    >
                      <SelectTrigger className={`w-full ${getErrorClass("priority")}`}>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        {priorities.map((p, index) => (
                          <SelectItem key={index} value={p}>{p}</SelectItem>
                        ))}
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
          
          {currentPage === "openTickets" && (
            <div className="max-w-6xl mx-auto w-full">
              <h2 className="text-2xl font-bold text-foreground mb-4">Open Tickets</h2>

              <div className="rounded-xl border border-border shadow-sm overflow-hidden">
                {/* Table Header */}
                <div className="grid grid-cols-3 bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground border-b border-border">
                  <div>Ticket #</div>
                  <div>Latest Update</div>
                  <div className="text-right">Read Status</div>
                </div>

                {/* Table Rows */}
                <div className="divide-y divide-border">
                  {concerns.map((item, idx) => {
                    const safeId = item._id ? item._id.toString() : `fallback-${idx}`;

                    return (
                      <div
                        key={safeId}
                        onClick={() => {
                          if (!item) return; // extra safety
                          setSelectedConcern(item);
                          setIsModalOpen(true);
                        }}
                        className="grid grid-cols-3 px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer"
                      >
                        <div className="font-medium text-foreground">
                          {item.ConcernNumber || "No #"}
                        </div>
                        <div className="text-muted-foreground">
                          {item.remarks || "No update"}
                        </div>
                        <div className="text-right">
                          <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 font-semibold">
                            Unread
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal */}
              {isModalOpen && selectedConcern && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                  <div className="bg-background dark:bg-background-dark p-6 rounded-xl max-w-lg w-full shadow-lg border border-border">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold">Concern Details</h2>
                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          setSelectedConcern(null);
                        }}
                        className="text-muted-foreground hover:text-foreground-dark"
                      >
                        ✕
                      </button>
                    </div>

                    {/* Editable Form */}
                    <div className="grid grid-cols-1 gap-2 text-sm max-h-[70vh] overflow-y-auto">
                      <div>
                        <label className="font-semibold">Employee Name:</label>
                        <input
                          type="text"
                          value={selectedConcern.Fullname || ""}
                          onChange={(e) =>
                            setSelectedConcern({
                              ...selectedConcern,
                              Fullname: e.target.value,
                            })
                          }
                          className="w-full border px-2 py-1 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="font-semibold">Department:</label>
                        <input
                          type="text"
                          value={selectedConcern.department || ""}
                          onChange={(e) =>
                            setSelectedConcern({
                              ...selectedConcern,
                              department: e.target.value,
                            })
                          }
                          className="w-full border px-2 py-1 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="font-semibold">Type:</label>
                        <input
                          type="text"
                          value={selectedConcern.type || ""}
                          onChange={(e) =>
                            setSelectedConcern({ ...selectedConcern, type: e.target.value })
                          }
                          className="w-full border px-2 py-1 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="font-semibold">Remarks:</label>
                        <textarea
                          value={selectedConcern.remarks || ""}
                          onChange={(e) =>
                            setSelectedConcern({
                              ...selectedConcern,
                              remarks: e.target.value,
                            })
                          }
                          className="w-full border px-2 py-1 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="font-semibold">Date Scheduled:</label>
                        <input
                          type="date"
                          value={selectedConcern.dateSched || ""}
                          onChange={(e) =>
                            setSelectedConcern({
                              ...selectedConcern,
                              dateSched: e.target.value,
                            })
                          }
                          className="w-full border px-2 py-1 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="font-semibold">Priority:</label>
                        <input
                          type="text"
                          value={selectedConcern.priority || ""}
                          onChange={(e) =>
                            setSelectedConcern({
                              ...selectedConcern,
                              priority: e.target.value,
                            })
                          }
                          className="w-full border px-2 py-1 rounded text-sm"
                        />
                      </div>

                      <div>
                        <label className="font-semibold">Concern Number:</label>
                        <input
                          type="text"
                          value={selectedConcern.ConcernNumber || ""}
                          onChange={(e) =>
                            setSelectedConcern({
                              ...selectedConcern,
                              ConcernNumber: e.target.value,
                            })
                          }
                          className="w-full border px-2 py-1 rounded text-sm"
                        />
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="mt-4 flex justify-end gap-2">
                      <button
                        onClick={handleUpdateConcern}
                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Update
                      </button>

                      <button
                        onClick={handleDeleteConcern}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                      >
                        Delete
                      </button>

                      <button
                        onClick={() => {
                          setIsModalOpen(false);
                          setSelectedConcern(null);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark"
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

              <h2 className="text-2xl font-bold text-foreground mb-4">Pending Concerns</h2>

              <div className="rounded-xl border border-border shadow-sm overflow-hidden">

                {/* Table Header */}
                <div className="grid grid-cols-4 bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground border-b border-border">
                  <div>Ticket #</div>
                  <div>Latest Update</div>
                  <div>Status</div>
                  <div className="text-right">Read Status</div>
                </div>

                <div className="divide-y divide-border">
                  {/* Row 1 - In Progress */}
                  <div className="grid grid-cols-4 px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <div className="font-medium text-foreground">TCK-000145</div>
                    <div className="text-muted-foreground">Assigned to IT technician</div>
                    <div>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300">
                        In Progress
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 font-semibold">
                        Unread
                      </span>
                    </div>
                  </div>

                  {/* Row 2 - Pending */}
                  <div className="grid grid-cols-4 px-4 py-3 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer">
                    <div className="font-medium text-foreground">TCK-000142</div>
                    <div className="text-muted-foreground">Waiting for parts delivery</div>
                    <div>
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                        Pending
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 font-semibold">
                        Read
                      </span>
                    </div>
                  </div>
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