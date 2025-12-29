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
    DialogTrigger,
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
    const [isMobileDialogOpen, setIsMobileDialogOpen] = React.useState(false);
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
            {/* Floating Hamburger Button */}
            {/* 🔘 Floating Hamburger Button (Mobile Only: md:hidden) */}
            <div className="fixed bottom-10 right-4 z-50 md:hidden">
                <button
                    className="relative bg-blue-600 hover:bg-blue-700 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-transform active:scale-90"
                    onClick={() => setIsMobileDialogOpen(true)}
                >
                    <MessageSquareMore size={28} />
                    {unreadCount > 0 && (
                        <span className="absolute top-0 right-0 h-5 w-5 rounded-full bg-red-500 text-white text-xs font-bold border-2 border-white transform translate-x-1/4 -translate-y-1/4 flex items-center justify-center">
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

{/* --- Desktop Header --- */}
<div className="hidden md:block">
    <SidebarHeader className="border-b p-3 bg-white dark:bg-black border-slate-200 dark:border-zinc-800">
        <div className="flex w-full items-center justify-between mb-2">
            <div className="text-foreground dark:text-zinc-100 text-base font-semibold">
                {activeItem?.title}
            </div>
            <div className="flex items-center">
                <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white font-medium px-3 py-1 transition-colors"
                    onClick={() => {
                        setValidationErrors({});
                        setIsManualAddDialogOpen(true);
                    }}
                >
                    + Ticket
                </Button>
            </div>
        </div>

        <SidebarInput
            placeholder="Search Employee name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500 focus-visible:ring-zinc-700"
        />
    </SidebarHeader>
</div>

{/* --- Mobile Dialog --- */}
<div className="md:hidden">
    <Dialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen}>
        <DialogContent className="max-w-md w-full max-h-[90vh] p-0 rounded-lg overflow-hidden bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            {/* Header */}
            <DialogHeader className="bg-gray-50 dark:bg-slate-800/50 p-4 flex flex-row items-center justify-between border-b dark:border-slate-800">
                {/* Left-aligned Title */}
                <DialogTitle
                    className="text-base font-semibold text-gray-900 dark:text-slate-100 text-xl truncate max-w-[70%]"
                >
                    {activeItem?.title}
                </DialogTitle>

                {/* Right-aligned Button */}
                <Button
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-500 text-white font-medium px-3 py-1 flex-shrink-0"
                    onClick={() => {
                        setValidationErrors({});
                        setIsManualAddDialogOpen(true);
                    }}
                >
                    + Ticket
                </Button>
            </DialogHeader>

            {/* Search Input Area */}
            <div className="p-4 border-b bg-white dark:bg-slate-900 dark:border-slate-800">
                <SidebarInput className="text-xs dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 dark:placeholder:text-slate-500"
                    placeholder="Search Employee name..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

{/* --- Mobile Dialog Example --- */}
<Dialog open={isMobileDialogOpen} onOpenChange={setIsMobileDialogOpen}>
    {/* Idinagdag ang [&>button]:hidden para mawala ang X button */}
<DialogContent className="max-w-md w-full max-h-[90vh] p-0 rounded-lg overflow-hidden bg-white dark:bg-black border-slate-200 dark:border-zinc-800 [&>button]:hidden">
    
    <DialogHeader className="bg-gray-50 dark:bg-zinc-900/50 p-4 flex flex-row items-center justify-between border-b dark:border-zinc-800">
        <DialogTitle className="text-base font-semibold text-gray-900 dark:text-zinc-100 truncate max-w-[70%]">
            {activeItem?.title}
        </DialogTitle>
        <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1 flex-shrink-0"
            onClick={() => setIsManualAddDialogOpen(true)}
        >
            + Ticket
        </Button>
    </DialogHeader>

    {/* Scrollable Mail List */}
    <div className="overflow-y-auto max-h-[calc(90vh-160px)] bg-slate-50 dark:bg-black">
        <SidebarContent className="bg-transparent">
            <SidebarGroup className="px-0">
                <SidebarGroupContent>
                    {filteredMails.length === 0 ? (
                        <div className="p-6 text-center text-sm text-gray-500 dark:text-zinc-500">
                            No concerns found.
                        </div>
                    ) : (
                        filteredMails.map((mail) => (
                            <button
                                key={mail.ConcernNumber || mail.subject + mail.date}
                                onClick={() => openDialog(mail)}
                                className="flex flex-col gap-2 border-b p-4 text-xs text-left w-full last:border-b-0 border-slate-200 dark:border-zinc-800 bg-white dark:bg-black hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors"
                            >
                                {/* Header */}
                                <div className="flex w-full items-center justify-between gap-2">
                                    <span className="font-semibold text-gray-900 dark:text-zinc-100">{mail.name}</span>
                                    <span className="text-[10px] text-gray-500 dark:text-zinc-500">
                                        {new Date(mail.createdAt).toLocaleString("en-US", {
                                            month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: true,
                                        })}
                                    </span>
                                </div>

                                {/* Subject + Priority */}
                                <div className="flex items-center gap-2">
                                    <span className="font-medium text-gray-800 dark:text-zinc-300">{mail.subject}</span>
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityColor(mail.priority)}`}>
                                        {mail.priority}
                                    </span>
                                </div>

                                {/* Teaser */}
                                <span className="line-clamp-2 text-xs text-gray-700 dark:text-zinc-400">
                                    {mail.teaser}
                                </span>
                            </button>
                        ))
                    )}
                </SidebarGroupContent>
            </SidebarGroup>
        </SidebarContent>
    </div>
</DialogContent>
</Dialog>
        </DialogContent>
    </Dialog>
</div>

<SidebarContent className="bg-white dark:bg-black border-r dark:border-zinc-800 transition-colors">
    <SidebarGroup className="px-0">
        <SidebarGroupContent>
            {filteredMails.length === 0 ? (
                /* 🟡 EMPTY STATE */
                <div className="p-6 text-center text-sm text-gray-500 dark:text-slate-400">
                    No concerns found.
                </div>
            ) : (
                filteredMails.map((mail) => (
                   <button
    key={mail.ConcernNumber || mail.subject + mail.date}
    onClick={() => openDialog(mail)}
    className="transition-all flex flex-col gap-2 border-b p-4 text-xs text-left w-full last:border-b-0 border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50"
>
                        {/* Header */}
                        <div className="flex w-full items-center justify-between gap-2">
                            <span className="font-semibold text-gray-900 dark:text-slate-100">
                                {mail.name}
                            </span>
                            <span className="text-[10px] text-gray-500 dark:text-slate-400">
                                {new Date(mail.createdAt).toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                })}
                            </span>
                        </div>

                        {/* Subject + Priority */}
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-800 dark:text-slate-200">
                                {mail.subject}
                            </span>
                            <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityColor(mail.priority)}`}
                            >
                                {mail.priority}
                            </span>
                        </div>

                        {/* Teaser */}
                        <span className="line-clamp-2 text-xs text-gray-700 dark:text-slate-400">
                            {mail.teaser}
                        </span>
                    </button>
                ))
            )}
        </SidebarGroupContent>
    </SidebarGroup>
</SidebarContent>

            </Sidebar>


{/* 🪟 Concern Details Dialog */}
<Dialog open={isDialogOpen}>
    <DialogContent
        className="sm:max-w-md [&>button]:hidden bg-white dark:bg-black border-slate-200 dark:border-zinc-800"
        // ❌ bawal magsara pag click sa labas
        onInteractOutside={(e) => e.preventDefault()}
        // ❌ bawal magsara pag ESC
        onEscapeKeyDown={(e) => e.preventDefault()}
    >
        {selectedMail && (
            <>
                <DialogHeader>
                    <DialogTitle className="text-slate-900 dark:text-zinc-100">
                        {selectedMail.subject}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-zinc-400">
                        Concern details from <strong className="text-slate-700 dark:text-zinc-200">{selectedMail.name}</strong>
                    </DialogDescription>
                </DialogHeader>

                <div className="mt-4 space-y-3 text-xs text-slate-700 dark:text-zinc-300">
                    <div>
                        <strong className="text-slate-900 dark:text-zinc-100 font-semibold">Name:</strong> {selectedMail.name}
                    </div>

                    <div>
                        <strong className="text-slate-900 dark:text-zinc-100 font-semibold">Email:</strong> {selectedMail.Email}
                    </div>

                    <div>
                        <strong className="text-slate-900 dark:text-zinc-100 font-semibold">Request Type:</strong> {selectedMail.requesttype1}
                    </div>

                    <div>
                        <strong className="text-slate-900 dark:text-zinc-100 font-semibold">Concern Number:</strong> {selectedMail.ConcernNumber}
                    </div>

                    <div>
                        <strong className="text-slate-900 dark:text-zinc-100 font-semibold">Date Created:</strong>{" "}
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
                        <strong className="text-slate-900 dark:text-zinc-100 font-semibold">Site:</strong> {selectedMail.site}
                    </div>

                    {/* hidden readstatus */}
                    <div className="hidden">
                        <input
                            type="text"
                            value={selectedMail.readstatus || ""}
                            onChange={(e) =>
                                setSelectedMail({
                                    ...selectedMail,
                                    readstatus: e.target.value,
                                })
                            }
                        />
                    </div>

                    <div>
                        <strong className="text-slate-900 dark:text-zinc-100 font-semibold">Priority:</strong>{" "}
                        <Badge className={getPriorityColor(selectedMail.priority)}>
                            {selectedMail.priority}
                        </Badge>
                    </div>

                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 mt-2">
                        <strong className="text-slate-900 dark:text-zinc-100 font-semibold">Remarks:</strong>
                        <p className="mt-1 text-slate-600 dark:text-zinc-400 leading-relaxed">{selectedMail.teaser}</p>
                    </div>
                </div>

                <div className="mt-6 flex justify-end gap-2">
                    <Button
                        variant="outline"
                        className="dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-300"
                        onClick={() => {
                            handleUpdate(); 
                            setIsDialogOpen(false);
                        }}
                    >
                        Close
                    </Button>

                    <Button 
                        onClick={openAddDialog}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm"
                    >
                        Create Ticket
                    </Button>
                </div>
            </>
        )}
    </DialogContent>
</Dialog>
<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
    {/* Idinagdag ang [&>button]:hidden para sa X button at dark mode colors */}
    <DialogContent className="sm:max-w-3xl max-h-[95vh] flex flex-col p-0 bg-white dark:bg-black border-slate-200 dark:border-zinc-800 [&>button]:hidden transition-colors">
        
        <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-slate-900 dark:text-zinc-100">Create New Ticket</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-zinc-400">
                Review and finalize the ticket details based on the end user concern.
                Required fields are marked with a <span className="text-red-500 font-bold underline">RED BORDER</span> if left empty.
            </DialogDescription>
        </DialogHeader>

        {/* --- Scrollable Area Start --- */}
        <div className="flex-1 overflow-y-auto px-6 py-2 dark:bg-black">
            <form id="ticket-form" onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-slate-900 dark:text-zinc-100">

                    {/* Ticket Number (Hidden) */}
                    <div className="hidden">
                        <Label>Ticket Number</Label>
                        <Input value={ticketForm.ticketNumber} readOnly />
                    </div>

                    {/* Full Name */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("Fullname")} dark:text-zinc-400`}>Full Name</Label>
                        <Input 
                            value={ticketForm.Fullname} 
                            readOnly 
                            className={`${getErrorClass("Fullname")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`} 
                        />
                    </div>

                    {/* Email */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("Email")} dark:text-zinc-400`}>Email</Label>
                        <Input 
                            value={ticketForm.Email} 
                            readOnly 
                            className={`${getErrorClass("Email")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`} 
                        />
                    </div>

                    {/* Department */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("department")} dark:text-zinc-400`}>Department</Label>
                        <Input 
                            value={ticketForm.department} 
                            readOnly 
                            className={`${getErrorClass("department")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`} 
                        />
                    </div>

                    {/* Request Type */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("requesttype")} dark:text-zinc-400`}>Request Type</Label>
                        <Input
                            value={selectedMail?.requesttype1 ?? ""}
                            readOnly
                            className={`${getErrorClass("requesttype")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}
                        />
                    </div>

                    {/* Type Of Concern */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("type")} dark:text-zinc-400`}>Type Of Concern</Label>
                        <Input
                            value={selectedMail?.subject ?? ""}
                            readOnly
                            className={`${getErrorClass("type")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}
                        />
                    </div>

                    {/* Mode */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className="dark:text-zinc-400">Mode</Label>
                        <div className="w-full rounded-md border border-input bg-white dark:bg-zinc-900 px-3 py-2 text-xs text-foreground dark:text-zinc-100 cursor-default dark:border-zinc-800">
                            Web Form
                        </div>
                    </div>

                    {/* Group */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("group")} dark:text-zinc-400`}>Group</Label>
                        <Select
                            value={ticketForm.group}
                            onValueChange={(value) => setTicketForm({ ...ticketForm, group: value })}
                        >
                            <SelectTrigger className={`w-full dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 ${getErrorClass("group")}`}>
                                <SelectValue placeholder="Select Group" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {groups.map((group) => (
                                    <SelectItem key={group.name} value={group.name} className="dark:focus:bg-zinc-900">{group.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Technician Name */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("technicianname")} dark:text-zinc-400`}>Technician Name</Label>
                        <Select
                            value={ticketForm.technicianname}
                            onValueChange={(value) => setTicketForm({ ...ticketForm, technicianname: value })}
                        >
                            <SelectTrigger className={`w-full dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 ${getErrorClass("technicianname")}`}>
                                <SelectValue placeholder="Select name" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {technicians.map((technician) => (
                                    <SelectItem key={technician.name} value={technician.name} className="dark:focus:bg-zinc-900">{technician.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Site */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("site")} dark:text-zinc-400`}>Site</Label>
                        <Select
                            value={ticketForm.site}
                            onValueChange={(value) => setTicketForm({ ...ticketForm, site: value })}
                        >
                            <SelectTrigger className={`w-full dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 ${getErrorClass("site")}`}>
                                <SelectValue placeholder="Select site" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {sites.map(site => <SelectItem key={site.name} value={site.name} className="dark:focus:bg-zinc-900">{site.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Scheduled */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className="dark:text-zinc-400">Date Scheduled (Required)</Label>
                        <Input
                            type="date"
                            value={ticketForm.dateSched}
                            min={new Date().toISOString().split("T")[0]}
                            onChange={(e) => setTicketForm({ ...ticketForm, dateSched: e.target.value })}
                            className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 [color-scheme:dark]"
                        />
                    </div>

                    {/* Priority */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("priority")} dark:text-zinc-400`}>Priority</Label>
                        <Select
                            value={ticketForm.priority}
                            onValueChange={(value) => setTicketForm({ ...ticketForm, priority: value })}
                        >
                            <SelectTrigger className={`w-full dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 ${getErrorClass("priority")}`}>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {priorities.map(prio => <SelectItem key={prio.name} value={prio.name} className="dark:focus:bg-zinc-900">{prio.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("status")} dark:text-zinc-400`}>Status</Label>
                        <Select
                            value={ticketForm.status}
                            onValueChange={(value) => setTicketForm({ ...ticketForm, status: value })}
                        >
                            <SelectTrigger className={`w-full dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 ${getErrorClass("status")}`}>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {status.map(Stat => <SelectItem key={Stat.name} value={Stat.name} className="dark:focus:bg-zinc-900">{Stat.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Remarks */}
                <div className="flex flex-col space-y-1.5 mt-2">
                    <Label className={`${getErrorClass("remarks")} dark:text-zinc-400`}>Remarks</Label>
                    <Textarea
                        placeholder="Enter remarks..."
                        value={ticketForm.remarks}
                        className={`min-h-[100px] dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 ${getErrorClass("remarks")}`}
                        onChange={(e) => setTicketForm({ ...ticketForm, remarks: e.target.value })}
                    />
                </div>

                {/* Processed By */}
                <div className="flex flex-col space-y-1.5 pb-4">
                    <Label className={`${getErrorClass("processedBy")} dark:text-zinc-400`}>Processed By</Label>
                    <Input
                        placeholder="Name of processor"
                        value={ticketForm.processedBy}
                        className={`${getErrorClass("processedBy")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}
                        onChange={(e) => setTicketForm({ ...ticketForm, processedBy: e.target.value })}
                    />
                </div>
            </form>
        </div>
        {/* --- Scrollable Area End --- */}

        <DialogFooter className="p-6 pt-4 border-t bg-gray-50/50 dark:bg-zinc-900/30 dark:border-zinc-800">
            <DialogClose asChild>
                <Button type="button" variant="outline" className="dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900">
                    Cancel
                </Button>
            </DialogClose>
            <Button type="submit" form="ticket-form" className="bg-blue-600 hover:bg-blue-700 text-white font-medium">
                Submit Ticket
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
            {/* ➕ Add New Ticket Dialog (Manual Entry) */}
<Dialog open={isManualAddDialogOpen} onOpenChange={setIsManualAddDialogOpen}>
    <DialogContent className="sm:max-w-3xl max-h-[95vh] flex flex-col p-0 bg-white dark:bg-black border-slate-200 dark:border-zinc-800 transition-colors">
        {/* Header - Fixed at the top */}
        <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-slate-900 dark:text-zinc-100">Add New Ticket Manually</DialogTitle>
            <DialogDescription className="text-slate-500 dark:text-zinc-400">
                Enter the details for a new support ticket. Required fields are marked with a <span className="text-red-500 font-bold underline">RED BORDER</span> if left empty.
            </DialogDescription>
        </DialogHeader>

        {/* --- Scrollable Area Start --- */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
            <form id="manual-ticket-form" onSubmit={handleManualSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

                    {/* Manual Ticket Number Input (Hidden) */}
                    <div className="hidden">
                        <Label>Ticket Number</Label>
                        <Input
                            placeholder="e.g. 1"
                            value={newTicket.ticketNumber}
                            onChange={(e) => setNewTicket({ ...newTicket, ticketNumber: e.target.value })}
                        />
                    </div>

                    {/* Full Name Input */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("Fullname")} dark:text-zinc-400 font-medium`}>Full Name</Label>
                        <Input
                            placeholder="Requester's Full Name"
                            value={newTicket.Fullname}
                            className={`${getErrorClass("Fullname")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500`}
                            onChange={(e) => setNewTicket({ ...newTicket, Fullname: e.target.value })}
                        />
                    </div>

                    {/* Department Select */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("department")} dark:text-zinc-400 font-medium`}>Department</Label>
                        <Select
                            value={newTicket.department}
                            onValueChange={(value) => setNewTicket({ ...newTicket, department: value })}
                        >
                            <SelectTrigger className={`w-full ${getErrorClass("department")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}>
                                <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {departments.map((dept) => (
                                    <SelectItem key={dept.name} value={dept.name} className="dark:focus:bg-zinc-900">{dept.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Request Type Select */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("requesttype")} dark:text-zinc-400 font-medium`}>Request Type</Label>
                        <Select
                            value={newTicket.requesttype}
                            onValueChange={(value) => setNewTicket({ ...newTicket, requesttype: value })}
                        >
                            <SelectTrigger className={`w-full ${getErrorClass("requesttype")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}>
                                <SelectValue placeholder="Select request type" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {requestTypes.map(type => (
                                    <SelectItem key={type.name} value={type.name} className="dark:focus:bg-zinc-900">{type.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Type of Concern Select */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("type")} dark:text-zinc-400 font-medium`}>Type of Concern</Label>
                        <Select
                            value={newTicket.type}
                            onValueChange={(value) => setNewTicket({ ...newTicket, type: value })}
                        >
                            <SelectTrigger className={`w-full ${getErrorClass("type")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}>
                                <SelectValue placeholder="Select concern type" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {concernTypes.map(concern => (
                                    <SelectItem key={concern.name} value={concern.name} className="dark:focus:bg-zinc-900">{concern.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Mode Select */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("mode")} dark:text-zinc-400 font-medium`}>Mode</Label>
                        <Select
                            value={newTicket.mode}
                            onValueChange={(value) => setNewTicket({ ...newTicket, mode: value })}
                        >
                            <SelectTrigger className={`w-full ${getErrorClass("mode")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}>
                                <SelectValue placeholder="Select Mode" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {modes.map((mode) => (
                                    <SelectItem key={mode.name} value={mode.name} className="dark:focus:bg-zinc-900">{mode.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Group Select */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("group")} dark:text-zinc-400 font-medium`}>Group</Label>
                        <Select
                            value={newTicket.group}
                            onValueChange={(value) => setNewTicket({ ...newTicket, group: value })}
                        >
                            <SelectTrigger className={`w-full ${getErrorClass("group")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}>
                                <SelectValue placeholder="Select Group" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {groups.map((group) => (
                                    <SelectItem key={group.name} value={group.name} className="dark:focus:bg-zinc-900">{group.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Technician Name */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("technicianname")} dark:text-zinc-400 font-medium`}>Technician Name</Label>
                        <Select
                            value={newTicket.technicianname}
                            onValueChange={(value) => setNewTicket({ ...newTicket, technicianname: value })}
                        >
                            <SelectTrigger className={`w-full ${getErrorClass("technicianname")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}>
                                <SelectValue placeholder="Select name" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {technicians.map((technician) => (
                                    <SelectItem key={technician.name} value={technician.name} className="dark:focus:bg-zinc-900">{technician.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Site Select */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("site")} dark:text-zinc-400 font-medium`}>Site</Label>
                        <Select
                            value={newTicket.site}
                            onValueChange={(value) => setNewTicket({ ...newTicket, site: value })}
                        >
                            <SelectTrigger className={`w-full ${getErrorClass("site")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}>
                                <SelectValue placeholder="Select site" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {sites.map(site => (
                                    <SelectItem key={site.name} value={site.name} className="dark:focus:bg-zinc-900">{site.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Date Sched Input */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className="dark:text-zinc-400 font-medium">Date Scheduled (Required)</Label>
                        <Input
                            type="date"
                            value={newTicket.dateSched}
                            className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 [color-scheme:dark]"
                            onChange={(e) => setNewTicket({ ...newTicket, dateSched: e.target.value })}
                            min={new Date().toISOString().split("T")[0]}
                        />
                    </div>

                    {/* Priority Select */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("priority")} dark:text-zinc-400 font-medium`}>Priority</Label>
                        <Select
                            value={newTicket.priority}
                            onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}
                        >
                            <SelectTrigger className={`w-full ${getErrorClass("priority")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}>
                                <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {priorities.map(prio => (
                                    <SelectItem key={prio.name} value={prio.name} className="dark:focus:bg-zinc-900">{prio.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Status Select */}
                    <div className="flex flex-col space-y-1.5">
                        <Label className={`${getErrorClass("status")} dark:text-zinc-400 font-medium`}>Status</Label>
                        <Select
                            value={newTicket.status}
                            onValueChange={(value) => setNewTicket({ ...newTicket, status: value })}
                        >
                            <SelectTrigger className={`w-full ${getErrorClass("status")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100`}>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent className="dark:bg-zinc-950 dark:border-zinc-800">
                                {status.map(Stat => (
                                    <SelectItem key={Stat.name} value={Stat.name} className="dark:focus:bg-zinc-900">{Stat.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Remarks (Full Width) */}
                <div className="flex flex-col space-y-1.5 mt-2">
                    <Label className={`${getErrorClass("remarks")} dark:text-zinc-400 font-medium`}>Remarks</Label>
                    <Textarea
                        placeholder="Enter remarks or description..."
                        value={newTicket.remarks}
                        className={`min-h-[100px] ${getErrorClass("remarks")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500`}
                        onChange={(e) => setNewTicket({ ...newTicket, remarks: e.target.value })}
                    />
                </div>

                {/* Processed By (Full Width) */}
                <div className="flex flex-col space-y-1.5 pb-4">
                    <Label className={`${getErrorClass("processedBy")} dark:text-zinc-400 font-medium`}>Processed By</Label>
                    <Input
                        placeholder="Name of processor"
                        value={newTicket.processedBy}
                        className={`${getErrorClass("processedBy")} dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-100 dark:placeholder:text-zinc-500`}
                        onChange={(e) => setNewTicket({ ...newTicket, processedBy: e.target.value })}
                    />
                </div>
            </form>
        </div>
        {/* --- Scrollable Area End --- */}

        {/* Footer - Fixed at the bottom */}
        <DialogFooter className="p-6 pt-4 border-t bg-gray-50/50 dark:bg-zinc-900/30 dark:border-zinc-800">
            <DialogClose asChild>
                <Button type="button" variant="outline" className="dark:border-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-900">
                    Cancel
                </Button>
            </DialogClose>
            <Button type="submit" form="manual-ticket-form" className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-500 text-white shadow-sm font-medium">
                Submit Ticket
            </Button>
        </DialogFooter>
    </DialogContent>
</Dialog>
        </>
    )
}