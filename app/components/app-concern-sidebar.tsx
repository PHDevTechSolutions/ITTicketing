"use client"

import React, { useState, useEffect } from "react";
import { ArchiveX, File, Inbox, Send, Trash2, MessageSquareMore } from "lucide-react"
import { AppSidebar } from "../components/sidebar"
import { Label } from "@/components/ui/label"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
} from "@/components/ui/sidebar"

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { SetStateAction } from "react"
// --- Interfaces ---
interface MailItem {
    name: string
    Email: string
    subject: string
    depts: string
    date: string
    teaser: string
    mode: string
    priority: "Critical" | "High" | "Normal" | "Resolved" | string
    status: string
    ConcernNumber?: string; // add this
    requesttype1: string
    type: string
    createdAt: string;
    site: string;
    readstatus: string;
}

interface TicketForm {
    ticketNumber: string
    Fullname: string
    department: string
    dateSched: string
    type: string
    status: string
    remarks: string
    processedBy: string
    priority: string
    requesttype: string
    mode: string
    site: string
    group: string
    technicianname: string
    createdAt: string
    Email: string
    readstatus: string
    ConcernNumber: string
}

// 📌 Generic Interface for fetched items (Mode, Group, Department, etc.)
interface Item {
    name: string
}

// 🧩 Sample Data (Used as API Fallback)
const data = {
    navMain: [
        { title: "Inbox", url: "#", icon: Inbox, isActive: true },
        { title: "Drafts", url: "#", icon: File, isActive: false },
        { title: "Sent", url: "#", icon: Send, isActive: false },
        { title: "Junk", url: "#", icon: ArchiveX, isActive: false },
        { title: "Trash", url: "#", icon: Trash2, isActive: false },
    ],
    mails: [] as MailItem[],
    // Static Fallback Data
    departments: ["IT Department", "Customer Support", "Marketing", "HR"],
    requestTypes: ["Issue", "Request", "Inquiry"],
    concernTypes: ["Network", "Account", "Software", "Hardware"],
    modes: ["Email", "Walk-in", "Phone"],
    groups: ["Tier 1 Support", "Network Team", "Admin"],
    technicians: ["John Doe", "Jane Smith", "Alex Tan"],
    sites: ["Main Office", "Satellite Branch A", "Remote Location"],
    priorities: ["Critical", "High", "Normal", "Low"],
    status: ["Pending", "In Progress", "Resolved", "Cancelled"],
}

// 🔹 Priority badge color
const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "Critical":
            return "bg-red-100 text-red-700 border border-red-300"
        case "High":
            return "bg-orange-100 text-orange-700 border border-orange-300"
        case "Normal":
            return "bg-yellow-100 text-yellow-700 border border-yellow-300"
        case "Resolved":
            return "bg-green-100 text-green-700 border border-green-300"
        default:
            return "bg-gray-100 text-gray-700 border border-gray-300"
    }
}

// 🔹 Background color per priority
const getBgColor = (priority: string) => {
    switch (priority) {
        case "Critical":
            return "critical-bg-pulse";
        case "High":
            return "bg-orange-50 hover:bg-orange-100"
        case "Normal":
            return "bg-yellow-50 hover:bg-yellow-100"
        case "Resolved":
            return "bg-green-50 hover:bg-green-100"
        default:
            return "bg-gray-50 hover:bg-gray-100"
    }
}

const initialNewTicketState: TicketForm = {
    ticketNumber: "",
    Fullname: "",
    department: "",
    dateSched: "",
    type: "",
    status: "Pending",
    remarks: "",
    processedBy: "",
    priority: "",
    requesttype: "",
    mode: "Web Form",
    site: "",
    group: "",
    technicianname: "",
    createdAt: "",
    Email: "",
    readstatus: "",
    ConcernNumber: "",
}

// Define REQUIRED_FIELDS here (excluding ticketNumber and dateSched)
const REQUIRED_FIELDS: (keyof TicketForm)[] = [
    "Fullname", "department", "type", "priority", "requesttype", "mode", "site", "group", "remarks", "processedBy", "dateSched", "technicianname", "status"
];


// 🔄 Helper function for fetching lists and pre-filling FullName
const useFetchList = (apiPath: string, fallbackData: string[]) => {
    const [list, setList] = React.useState<Item[]>([])

    React.useEffect(() => {
        async function fetchData() {
            try {
                // 🔹 Fetch list from API
                const res = await fetch(apiPath)
                const data = await res.json()

                if (data.success && Array.isArray(data.data)) {
                    setList(data.data)
                } else {
                    // Use fallback data if API returns success=false
                    const staticList: Item[] = fallbackData.map(item => ({ name: item }))
                    setList(staticList)
                }
            } catch (err) {
                // Fallback if API call fails entirely
                const staticList: Item[] = fallbackData.map(item => ({ name: item }))
                setList(staticList)
            }
        }

        fetchData()
    }, [apiPath, fallbackData])

    return list
}


// --- Main Component ---
export function ConcernSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const [mails, setMails] = useState<MailItem[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);

    useEffect(() => {
        const fetchConcerns = async () => {
            try {
                // 1️⃣ Load current user from localStorage
                const storedUser = localStorage.getItem("currentUser");
                if (!storedUser) return;

                const parsedUser = JSON.parse(storedUser);
                const userEmail = parsedUser.Email;

                // 2️⃣ Fetch concerns
                const res = await fetch("/api/euconcern/"); // include trailing slash
                if (!res.ok) {
                    console.error(`HTTP error! status: ${res.status}`);
                    return;
                }

                const json = await res.json();
                if (!json.success) return;

                // 3️⃣ Format and filter by user email
                const formatted: MailItem[] = json.data
                    .filter((c: any) => c.Email === userEmail)
                    .map((c: any) => ({
                        name: c.employeeName,
                        depts: c.department,
                        Email: c.Email,
                        subject: `${c.type} (${c.department})`,
                        createdAt: c.createdAt ?? "N/A",
                        requesttype1: c.reqt,
                        site: c.site || "",
                        mode: c.mode,
                        type: c.type,
                        teaser: `${c.remarks}.`,
                        priority: c.priority || "Normal",
                        status: c.status || "Pending",
                        readstatus: c.readstatus,
                        ConcernNumber: c.ConcernNumber,
                    }));

                setMails(formatted);

                // 4️⃣ Compute unread count
                const storedRead = JSON.parse(localStorage.getItem("readInbox") || "[]");
                const unread = formatted.filter((c) => !storedRead.includes(c.ConcernNumber)).length;
                setUnreadCount(unread);

            } catch (err) {
                console.error("Failed to fetch concerns:", err);
            }
        };

        fetchConcerns();
    }, []);





    // ⚙️ States for dynamic lists 

    const modes = useFetchList("/api/mode", data.modes)
    const groups = useFetchList("/api/group", data.groups)
    const departments = useFetchList("/api/departments", data.departments)
    const requestTypes = useFetchList("/api/requesttype", data.requestTypes)
    const concernTypes = useFetchList("/api/typeofconcern", data.concernTypes)
    const technicians = useFetchList("/api/technician", data.technicians)
    const priorities = useFetchList("/api/priority", data.priorities)
    const sites = useFetchList("/api/site", data.sites)
    const status = useFetchList("/api/status", data.status)

    const [activeItem] = React.useState(data.navMain[0])



    // 🟢 Dialog states
    const [selectedMail, setSelectedMail] = React.useState<MailItem | null>(null)
    const [isDialogOpen, setIsDialogOpen] = React.useState(false) // Concern Details Dialog
    const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false) // Create Ticket from Concern Dialog
    const [isManualAddDialogOpen, setIsManualAddDialogOpen] = React.useState(false) // Add New Ticket Dialog (Manual)

    // 📝 State for "Create Ticket from Concern" Dialog
    const [ticketForm, setTicketForm] = React.useState<TicketForm>(initialNewTicketState)

    // 📝 State for "Add New Ticket" (Manual Entry) Dialog
    const [newTicket, setNewTicket] = React.useState<TicketForm>(initialNewTicketState)

    // ❌ Validation State - FIXED: Ginamit ang Partial para maiwasan ang TS2345/2740
    const [validationErrors, setValidationErrors] = React.useState<Partial<Record<keyof TicketForm, boolean>>>({});

    // ⚙️ State para sa Unreads toggle
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    // 🟢 Example: mark every mail with a read status
    // Pwede mo rin gawing API field kung galing sa backend
    const mailsWithReadStatus = mails.map(mail => ({
        ...mail,
        read: mail.status === "Resolved" || mail.status === "In Progress", // example
    }));

    const [originalReadStatus, setOriginalReadStatus] = useState<string>(
        selectedMail?.readstatus || ""
    );

    // Filter mails based on toggle
    const displayedMails = showUnreadOnly
        ? mailsWithReadStatus.filter(mail => !mail.read)
        : mailsWithReadStatus;

    // 📋 Validation Logic
    const validateForm = (formData: TicketForm) => {
        // FIXED: Ginamit ang Partial
        const errors: Partial<Record<keyof TicketForm, boolean>> = {};
        let isValid = true;

        REQUIRED_FIELDS.forEach(key => {
            // Check if field is empty (string or number)
            if (!formData[key] || String(formData[key]).trim() === "") {
                errors[key] = true;
                isValid = false;
            }
        });
        setValidationErrors(errors as SetStateAction<Partial<Record<keyof TicketForm, boolean>>>);
        return isValid;
    };

    // 🖍️ Error Class Helper
    const getErrorClass = (fieldName: keyof TicketForm) => {
        return validationErrors[fieldName] ? "border-red-500 focus:border-red-500 focus:ring-red-500" : "";
    };



    // 🔹 Handlers
    const openDialog = (mail: MailItem) => {
        setSelectedMail(mail)
        setIsDialogOpen(true)
        handleUpdate();
    }

    const openAddDialog = () => {
        // Safe to clear errors using {}
        setValidationErrors({});
        if (selectedMail) {
            // Extract Ticket Number from subject (e.g., IT-0003)
            const ticketNumMatch = selectedMail.subject.match(/\((.*?)\)/)
            const ticketNumber = ticketNumMatch ? ticketNumMatch[1] : ""

            // Extract Department from teaser (e.g., IT Department)
            const deptMatch = selectedMail.teaser.match(/Department:\s(.*?)\./)
            const department = deptMatch ? deptMatch[1] : ""

            // Extract Type from subject (e.g., Network)
            const type = selectedMail.subject.split(" ")[0] || ""

            // Initialize the ticketForm with extracted data
            setTicketForm({
                ...initialNewTicketState,
                ticketNumber: ticketNumber,
                Fullname: selectedMail.name,
                department: selectedMail.depts,
                requesttype: selectedMail.requesttype1,
                type: selectedMail.type,
                remarks: selectedMail.teaser,
                priority: selectedMail.priority,
                createdAt: selectedMail.createdAt,
                site: selectedMail.site,
                Email: selectedMail.Email,
                readstatus: selectedMail.readstatus,
                ConcernNumber: selectedMail.ConcernNumber || "",
                // Use the priority from the mail
            })
        }
        setIsDialogOpen(false)
        setIsAddDialogOpen(true)
    }

    // 💾 API Function for Ticket Submission
    const createTicket = async (ticketData: TicketForm) => {
        try {
            const { ticketNumber, ...dataToSubmit } = ticketData;

            const response = await fetch("/api/tickets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(dataToSubmit),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            return result;
        } catch (error) {
            console.error("Error creating ticket:", error);
            throw new Error("Failed to submit ticket to the server.");
        }
    };

    const handleUpdate = async () => {
        if (!selectedMail) return;

        // Determine the new read status
        let newReadStatus = selectedMail.readstatus;
        if (selectedMail.readstatus.toLowerCase() === "unread") {
            newReadStatus = "read";
        }

        // Check if readstatus actually changed
        if (newReadStatus === originalReadStatus) {
            return;
        }

        try {
            const res = await fetch(`/api/euconcern/${selectedMail.ConcernNumber}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    readstatus: newReadStatus, // send the updated value to DB
                }),
            });

            const data = await res.json();

            // Update frontend state after successful DB update
            setSelectedMail({ ...selectedMail, readstatus: newReadStatus });
            setOriginalReadStatus(newReadStatus);
        } catch (error) {
            console.error(error);
        }
    };

    const handleUpdateMode = async () => {
        if (!selectedMail) return;

        // Check if mode already "Yes"
        if (selectedMail.mode?.toLowerCase() === "yes") {
            return;
        }

        try {
            const res = await fetch(`/api/euconcern/${selectedMail.ConcernNumber}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    mode: "Yes", // update mode to "Yes"
                }),
            });

            if (!res.ok) {
                console.error("Failed to update mode");
                return;
            }

            const data = await res.json();
            console.log("Mode updated:", data);

            // Update frontend state after successful DB update
            setSelectedMail({ ...selectedMail, mode: "Yes" });
        } catch (error) {
            console.error(error);
        }
    };





    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // 1️⃣ Form Validation
        if (!validateForm(ticketForm)) {
            toast.error("Please fill out all required fields marked in red.");
            return;
        }

        try {
            // 2️⃣ CREATE TICKET
            await createTicket(ticketForm);
            console.log("🧾 Ticket submitted:", ticketForm);
            toast.success("Ticket successfully created from concern!");

            // 3️⃣ POST TO INBOX
            try {
                const inboxRes = await fetch("/api/inbox", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ConcernNumber: selectedMail?.ConcernNumber,
                        remarks: "Technician assigned to your request. Please expect an update soon."
                    }),
                });

                if (!inboxRes.ok) {
                    const text = await inboxRes.text();
                    console.error("Failed to post to inbox:", text);
                    toast.warning("Ticket created but failed to notify inbox.");
                } else {
                    const inboxData = await inboxRes.json();
                    console.log("Inbox created:", inboxData);
                }
            } catch (err) {
                console.error("Inbox API error:", err);
                toast.warning("Ticket created but failed to notify inbox.");
            }

            // 4️⃣ UPDATE CONCERN MODE
            await handleUpdateMode(); // ⭐ Tawagin dito para i-set mode = "Yes"

            // 5️⃣ Cleanup UI
            setTicketForm(initialNewTicketState);
            setIsAddDialogOpen(false);
            setValidationErrors({});

            // 6️⃣ Page Refresh
            window.location.reload();

        } catch (error) {
            console.error(error);
            toast.error("Failed to submit ticket.");
        }
    };



    const [searchTerm, setSearchTerm] = React.useState("");
    const filteredMails = mails.filter((mail) =>
  mail.name.toLowerCase().includes(searchTerm.toLowerCase())
);

    const [showSidebar, setShowSidebar] = React.useState(false);

    const handleManualSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        // 2. Form Validation: Check required fields
        if (!validateForm(newTicket)) {
            toast.error("Please fill out all required fields marked in red.");
            return;
        }

        try {
            // 🚀 Call the API function for the manual ticket
            await createTicket(newTicket);
            console.log("🆕 New Ticket Added:", newTicket)
            toast.success("New Ticket successful!")
            // Cleanup and Close
            setNewTicket(initialNewTicketState);
            setIsManualAddDialogOpen(false)
            setValidationErrors({});

            // 1. Page Refresh: DAPAT MAG REFRESH YUNG PAGE KAPAG NAG TRUE
            window.location.reload();

        } catch (error) {
            toast.error("Failed to add new ticket.");
        }
    }

    return (
        <>
            <AppSidebar />
            {/* Floating Hamburger Button */}
            <div className="fixed bottom-10 right-4 z-50 md:hidden flex items-center justify-center">
                <button
                    className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
                    onClick={() => setShowSidebar(true)}
                >
                    {/* Icon para sa Concern/Message */}
                    <MessageSquareMore size={28} />

                    {/* Unread Count Badge */}
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 flex items-center justify-center h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white transform translate-x-1/4 -translate-y-1/4">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>


            {/* Sidebar */}
            <Sidebar
                collapsible="none"
                className={`
    overflow-y-auto h-screen
    bg-white border-r z-40
    transform transition-transform duration-300
    md:flex md:w-[21%] md:translate-x-0
    fixed top-0 left-0
    ${showSidebar ? "w-4/5 translate-x-0" : "-translate-x-full"} 
    md:static md:translate-x-0
  `}
            >

                {/* 🧭 Header */}
              <SidebarHeader className=" border-b p-3 bg-gray-50">
  <div className="flex w-full items-center justify-between">
    <div className="text-foreground text-base font-semibold">
      {activeItem?.title}
    </div>
    <div className="flex items-center">
      {/* ➕ Add Ticket button */}
      <Button
        size="sm"
        className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1"
        onClick={() => {
          setValidationErrors({}); // Clear errors
          setIsManualAddDialogOpen(true);
        }}
      >
        + Ticket
      </Button>

      {/* Close button for mobile */}
      <div className="flex justify-end p-4 md:hidden">
        <Button onClick={() => setShowSidebar(false)} variant="outline">
          ✕
        </Button>
      </div>
    </div>
  </div>

  {/* Search Input */}
  <SidebarInput
    placeholder="Search Employee name..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  />
</SidebarHeader>
                <SidebarContent>
  <SidebarGroup className="px-0">
    <SidebarGroupContent>
      {filteredMails.map((mail) => (
        <button
          key={mail.ConcernNumber || mail.subject + mail.date}
          onClick={() => openDialog(mail)}
          className={`transition-all flex flex-col gap-2 border-b p-4 text-xs text-left w-full last:border-b-0 ${getBgColor(mail.priority)}`}
        >
          <div className="flex w-full items-center gap-2">
            <span className="font-semibold text-gray-900">{mail.name}</span>
            <span className="px-4 py-2">
              {new Date(mail.createdAt).toLocaleString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-800">{mail.subject}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityColor(mail.priority)}`}
            >
              {mail.priority}
            </span>
          </div>
          <span className="line-clamp-2 text-xs text-gray-700">{mail.teaser}</span>
        </button>
      ))}
    </SidebarGroupContent>
  </SidebarGroup>
</SidebarContent>


            </Sidebar>


            {/* 🪟 Concern Details Dialog */}
            <Dialog open={isDialogOpen}>
                <DialogContent
                    className="sm:max-w-md [&>button]:hidden"

                    // ❌ bawal magsara pag click sa labas
                    onInteractOutside={(e) => e.preventDefault()}

                    // ❌ bawal magsara pag ESC
                    onEscapeKeyDown={(e) => e.preventDefault()}
                >
                    {selectedMail && (
                        <>
                            <DialogHeader>
                                <DialogTitle>{selectedMail.subject}</DialogTitle>
                                <DialogDescription>
                                    Concern details from <strong>{selectedMail.name}</strong>
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-4 space-y-3 text-xs">
                                <div>
                                    <strong>Name:</strong> {selectedMail.name}
                                </div>

                                <div>
                                    <strong>Email:</strong> {selectedMail.Email}
                                </div>

                                <div>
                                    <strong>Request Type:</strong> {selectedMail.requesttype1}
                                </div>

                                <div>
                                    <strong>Concern Number:</strong> {selectedMail.ConcernNumber}
                                </div>

                                <div>
                                    <strong>Date Created:</strong>{" "}
                                    {new Date(selectedMail.createdAt).toLocaleString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                        year: "numeric",
                                        hour: "numeric",
                                        minute: "2-digit",
                                        hour12: true,
                                    })}
                                </div>

                                <div>
                                    <strong>Site:</strong> {selectedMail.site}
                                </div>

                                {/* hidden readstatus (for update) */}
                                <div className="hidden">
                                    <label className="font-semibold">Read Status:</label>
                                    <input
                                        type="text"
                                        value={selectedMail.readstatus || ""}
                                        onChange={(e) =>
                                            setSelectedMail({
                                                ...selectedMail,
                                                readstatus: e.target.value,
                                            })
                                        }
                                        className="w-full border px-2 py-1 rounded"
                                    />
                                </div>

                                <div>
                                    <strong>Priority:</strong>{" "}
                                    <Badge className={getPriorityColor(selectedMail.priority)}>
                                        {selectedMail.priority}
                                    </Badge>
                                </div>

                                <div className="pt-2 border-t mt-2">
                                    <strong>Remarks:</strong>
                                    <p className="mt-1 text-gray-700">{selectedMail.teaser}</p>
                                </div>
                            </div>

                            <div className="mt-6 flex justify-end gap-2">
                                {/* ✅ Close button LANG ang pwedeng magsara */}
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        handleUpdate();          // ❗ HINDI TINANGGAL
                                        setIsDialogOpen(false);
                                    }}

                                >
                                    Close
                                </Button>

                                <Button onClick={openAddDialog}>
                                    Create Ticket
                                </Button>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>


            {/* 🎫 Create Ticket Dialog (from Concern/Email) */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Create New Ticket</DialogTitle>
                        <DialogDescription>
                            Review and finalize the ticket details based on the end user concern. Required fields are marked with a **RED BORDER** if left empty.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Row 1 */}
                            <div className="flex flex-col space-y-1.5 hidden">
                                <Label>Ticket Number</Label>
                                <Input value={ticketForm.ticketNumber} readOnly />
                            </div>

                            {/* Full Name (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("Fullname")}>Full Name</Label>
                                <Input value={ticketForm.Fullname} readOnly className={getErrorClass("Fullname")} />
                            </div>


                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("Email")}>Email</Label>
                                <Input value={ticketForm.Email} readOnly className={getErrorClass("Email")} />
                            </div>

                            {/* Department (Required + Red Border) */}

                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("department")}>Department</Label>
                                <Input value={ticketForm.department} readOnly className={getErrorClass("department")} />
                            </div>

                            {/* Row 2 */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("requesttype")}>Request Type</Label>
                                <Input
                                    value={selectedMail?.requesttype1 ?? ""}
                                    readOnly
                                    className={getErrorClass("requesttype")}
                                />
                            </div>


                            {/* Row 2 */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("type")}>Type Of Concern</Label>
                                <Input
                                    value={selectedMail?.subject ?? ""}
                                    readOnly
                                    className={getErrorClass("type")}
                                />
                            </div>




                            {/* Mode (Read-only) */}
                            {/* Mode (Read-only, White BG) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label>Mode</Label>
                                <input
                                    type="text"
                                    value="Web Form"
                                    readOnly
                                    className="w-full rounded-md border border-input bg-white px-3 py-2 text-xs text-foreground cursor-default"
                                />
                            </div>



                            {/* Row 3 */}
                            {/* Group (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("group")}>Group</Label>
                                <Select
                                    value={ticketForm.group}
                                    onValueChange={(value) =>
                                        setTicketForm({ ...ticketForm, group: value })
                                    }
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("group")}`}>
                                        <SelectValue placeholder="Select Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem key={group.name} value={group.name}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Technician Name (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("technicianname")}>Technician Name</Label>
                                <Select
                                    value={ticketForm.technicianname}
                                    onValueChange={(value) => setTicketForm({ ...ticketForm, technicianname: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("technicianname")}`}>
                                        <SelectValue placeholder="Select name" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {technicians.map((technician) => (
                                            <SelectItem
                                                key={technician.name}
                                                value={technician.name}
                                            >
                                                {technician.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Site (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("site")}>Site</Label>
                                <Select
                                    value={ticketForm.site}
                                    onValueChange={(value) =>
                                        setTicketForm({ ...ticketForm, site: value })
                                    }
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("site")}`}>
                                        <SelectValue placeholder="Select site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sites.map(site => <SelectItem key={site.name} value={site.name}>{site.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Row 4 */}
                            <div className="flex flex-col space-y-1.5">
                                <Label>Date Scheduled (Required)</Label>
                                <Input
                                    type="date"
                                    value={ticketForm.dateSched}
                                    min={new Date().toISOString().split("T")[0]} // hindi pwedeng past date
                                    onChange={(e) =>
                                        setTicketForm({ ...ticketForm, dateSched: e.target.value })
                                    }
                                />
                            </div>


                            {/* Priority (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("priority")}>Priority</Label>
                                <Select
                                    value={ticketForm.priority}
                                    onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("priority")}`}>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorities.map(prio => <SelectItem key={prio.name} value={prio.name}>{prio.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Status Select (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("status")}>Status</Label>
                                <Select
                                    value={ticketForm.status}
                                    onValueChange={(value) => setTicketForm({ ...ticketForm, status: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("status")}`}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger><SelectContent>
                                        {status.map(Stat => <SelectItem key={Stat.name} value={Stat.name}>{Stat.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div></div>
                        </div>

                        {/* Remarks (Full Width, Required + Red Border) */}
                        <div className="flex flex-col space-y-1.5">
                            <Label className={getErrorClass("remarks")}>Remarks</Label>
                            <Textarea
                                placeholder="Enter remarks or description..."
                                value={ticketForm.remarks}
                                className={getErrorClass("remarks")}
                                onChange={(e) =>
                                    setTicketForm({ ...ticketForm, remarks: e.target.value })
                                }
                            />
                        </div>

                        {/* Processed By (Full Width, Required + Red Border) */}
                        <div className="flex flex-col space-y-1.5">
                            <Label className={getErrorClass("processedBy")}>Processed By</Label>
                            <Input
                                placeholder="Name of processor"
                                value={ticketForm.processedBy} // Pre-filled with FullName
                                className={getErrorClass("processedBy")}
                                onChange={(e) =>
                                    setTicketForm({ ...ticketForm, processedBy: e.target.value })
                                }
                            />
                        </div>


                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            {/* Submission Button */}
                            <Button type="submit">Submit Ticket</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* ➕ Add New Ticket Dialog (Manual Entry) */}
            <Dialog open={isManualAddDialogOpen} onOpenChange={setIsManualAddDialogOpen}>
                <DialogContent className="sm:max-w-3xl">
                    <DialogHeader>
                        <DialogTitle>Add New Ticket Manually</DialogTitle>
                        <DialogDescription>
                            Enter the details for a new support ticket. Required fields are marked with a **RED BORDER** if left empty.
                        </DialogDescription>
                    </DialogHeader>

                    {/* Manual Entry Form */}
                    <form onSubmit={handleManualSubmit} className="space-y-3 mt-4 text-xs">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {/* Manual Ticket Number Input (Hidden) */}
                            <div className="flex flex-col space-y-1.5 hidden">
                                <Label>Ticket Number</Label>
                                <Input
                                    placeholder="e.g. 1"
                                    value={newTicket.ticketNumber}
                                    onChange={(e) => setNewTicket({ ...newTicket, ticketNumber: e.target.value })}
                                />
                            </div>

                            {/* Full Name Input (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("Fullname")}>Full Name</Label>
                                <Input
                                    placeholder="Requester's Full Name"
                                    value={newTicket.Fullname}
                                    className={getErrorClass("Fullname")}
                                    onChange={(e) => setNewTicket({ ...newTicket, Fullname: e.target.value })}
                                />
                            </div>

                            {/* Department Select (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("department")}>Department</Label>
                                <Select
                                    value={newTicket.department}
                                    onValueChange={(value) => setNewTicket({ ...newTicket, department: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("department")}`}>
                                        <SelectValue placeholder="Select department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.name} value={dept.name}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Request Type Select (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("requesttype")}>Request Type</Label>
                                <Select
                                    value={newTicket.requesttype}
                                    onValueChange={(value) => setNewTicket({ ...newTicket, requesttype: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("requesttype")}`}>
                                        <SelectValue placeholder="Select request type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {requestTypes.map(type => <SelectItem key={type.name} value={type.name}>{type.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Type of Concern Select (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("type")}>Type of Concern</Label>
                                <Select
                                    value={newTicket.type}
                                    onValueChange={(value) => setNewTicket({ ...newTicket, type: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("type")}`}>
                                        <SelectValue placeholder="Select concern type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {concernTypes.map(concern => <SelectItem key={concern.name} value={concern.name}>{concern.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Mode Select (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("mode")}>Mode</Label>
                                <Select
                                    value={newTicket.mode}
                                    onValueChange={(value) => setNewTicket({ ...newTicket, mode: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("mode")}`}>
                                        <SelectValue placeholder="Select Mode" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {modes.map((mode) => (
                                            <SelectItem key={mode.name} value={mode.name}>
                                                {mode.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Group Select (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("group")}>Group</Label>
                                <Select
                                    value={newTicket.group}
                                    onValueChange={(value) => setNewTicket({ ...newTicket, group: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("group")}`}>
                                        <SelectValue placeholder="Select Group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {groups.map((group) => (
                                            <SelectItem key={group.name} value={group.name}>
                                                {group.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            {/* Technician Name (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("technicianname")}>Technician Name</Label>
                                <Select
                                    value={newTicket.technicianname}
                                    onValueChange={(value) => setNewTicket({ ...newTicket, technicianname: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("technicianname")}`}>
                                        <SelectValue placeholder="Select name" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {technicians.map((technician) => (
                                            <SelectItem
                                                key={technician.name}
                                                value={technician.name}
                                            >
                                                {technician.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Site Select (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("site")}>Site</Label>
                                <Select
                                    value={newTicket.site}
                                    onValueChange={(value) => setNewTicket({ ...newTicket, site: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("site")}`}>
                                        <SelectValue placeholder="Select site" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sites.map(site => <SelectItem key={site.name} value={site.name}>{site.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Date Sched Input (Optional) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label>Date Scheduled (Required)</Label>
                                <Input
                                    type="date"
                                    value={newTicket.dateSched}
                                    onChange={(e) => setNewTicket({ ...newTicket, dateSched: e.target.value })}
                                    min={new Date().toISOString().split("T")[0]} // <-- only future and today
                                />
                            </div>

                            {/* Priority Select (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("priority")}>Priority</Label>
                                <Select
                                    value={newTicket.priority}
                                    onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("priority")}`}>
                                        <SelectValue placeholder="Select priority" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {priorities.map(prio => <SelectItem key={prio.name} value={prio.name}>{prio.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Status Select (Required + Red Border) */}
                            <div className="flex flex-col space-y-1.5">
                                <Label className={getErrorClass("status")}>Status</Label>
                                <Select
                                    value={newTicket.status}
                                    onValueChange={(value) => setNewTicket({ ...newTicket, status: value })}
                                >
                                    <SelectTrigger className={`w-full ${getErrorClass("status")}`}>
                                        <SelectValue placeholder="Select status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {status.map(Stat => <SelectItem key={Stat.name} value={Stat.name}>{Stat.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div></div>
                        </div>

                        {/* Remarks (Full Width, Required + Red Border) */}
                        <div className="flex flex-col space-y-1.5">
                            <Label className={getErrorClass("remarks")}>Remarks</Label>
                            <Textarea
                                placeholder="Enter remarks or description..."
                                value={newTicket.remarks}
                                className={getErrorClass("remarks")}
                                onChange={(e) => setNewTicket({ ...newTicket, remarks: e.target.value })}
                            />
                        </div>

                        {/* Processed By (Full Width, Required + Red Border) */}
                        <div className="flex flex-col space-y-1.5">
                            <Label className={getErrorClass("processedBy")}>Processed By</Label>
                            <Input
                                placeholder="Name of processor"
                                value={newTicket.processedBy}
                                className={getErrorClass("processedBy")}
                                onChange={(e) => setNewTicket({ ...newTicket, processedBy: e.target.value })}
                            />
                        </div>

                        <DialogFooter className="pt-4">
                            <DialogClose asChild>
                                <Button type="button" variant="outline">
                                    Cancel
                                </Button>
                            </DialogClose>
                            {/* Submission Button */}
                            <Button type="submit">Submit Ticket</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    )
}