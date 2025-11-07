"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ConcernSidebar } from "../components/app-concern-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription, // <-- ADD THIS LINE
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import {
  User,
  LogOut,
  LayoutGrid,
  List,
  Download,
  Search,
} from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Textarea } from "@/components/ui/textarea" // Added Textarea for completeness in case it's used elsewhere

interface ITConcern {
  id: string
  employeeName: string
  department: string
  type: string
  remarks: string
  dateCreated: string
  priority: "Low" | "Medium" | "High" | "Critical"
  status: "Pending" | "Ongoing" | "Finished"
}

// Interface for new ticket (assuming you need to create one, even if not shown in this file)
// Note: I'm defining a basic structure here for good practice, although the component focuses on viewing concerns
interface NewTicket {
    ticketNumber: string;
    Fullname: string;
    department: string;
    dateSched: string;
    remarks: string;
    processedBy: string;
    requesttype: string;
    type: string;
    mode: string;
    group: string;
    technicianname: string;
    site: string;
    priority: string;
}

export default function Page() {
  const router = useRouter()

  const [isRowView, setIsRowView] = useState(false)
  const [selectedConcern, setSelectedConcern] = useState<ITConcern | null>(null)
  const [status, setStatus] = useState<ITConcern["status"]>("Pending")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [filterBy, setFilterBy] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)

  // Dummy state variables for Create Ticket form (if needed, adjust names as per your actual implementation)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false) 
  const [ticketForm, setTicketForm] = useState<any>({
      ticketNumber: "TEMP-001",
      Fullname: "Super Admin",
      department: "IT Department",
      dateSched: "",
      remarks: "",
      processedBy: "",
  });
  const [newTicket, setNewTicket] = useState<NewTicket>({
      ticketNumber: "",
      Fullname: "",
      department: "",
      dateSched: "",
      remarks: "",
      processedBy: "",
      requesttype: "Incident",
      type: "Hardware",
      mode: "Chat",
      group: "Service Desk Services",
      technicianname: "ASD",
      site: "Disruptive Solution, Primex",
      priority: "Incident-P1",
  });
  const handleSubmit = () => {
    // Dummy submit handler
    alert("Ticket created successfully!");
    setIsAddDialogOpen(false);
  };
    // Dummy state for manual Add Ticket dialog (if used)
  const [isAddTicketDialogOpen, setIsAddTicketDialogOpen] = useState(false);
  const [manualNewTicket, setManualNewTicket] = useState<NewTicket>({
      ticketNumber: "", Fullname: "", department: "", dateSched: "", remarks: "", processedBy: "",
      requesttype: "Incident", type: "Hardware", mode: "Chat", group: "Service Desk Services", technicianname: "ASD", site: "Disruptive Solution, Primex", priority: "Incident-P1",
  });


  const concerns: ITConcern[] = [
    {
      id: "IT-0001",
      employeeName: "Juan Dela Cruz",
      department: "Human Resources",
      type: "Hardware",
      remarks: "Desktop computer not turning on after power outage.",
      dateCreated: "2025-10-10",
      priority: "Critical",
      status: "Pending",
    },
    {
      id: "IT-0002",
      employeeName: "Maria Santos",
      department: "Finance",
      type: "Software",
      remarks: "Unable to open the payroll system due to version mismatch.",
      dateCreated: "2025-10-12",
      priority: "High",
      status: "Ongoing",
    },
  ]

  // 🛠️ MODIFIED: The function now returns the background color class.
  const getRowBg = (priority: string, isRowView: boolean) => {
    if (isRowView) {
        // Light background with hover for Table (Row) View
        switch (priority) {
            case "Critical": return "bg-red-50 hover:bg-red-100";
            case "High": return "bg-orange-50 hover:bg-orange-100";
            case "Medium": return "bg-yellow-50 hover:bg-yellow-100";
            case "Low": return "bg-green-50 hover:bg-green-100";
            default: return "bg-gray-50 hover:bg-gray-100";
        }
    } else {
        // Brighter, non-hover background for Card (Grid) View
        switch (priority) {
            case "Critical": return "bg-red-200 hover:bg-red-300";
            case "High": return "bg-orange-200 hover:bg-orange-300";
            case "Medium": return "bg-yellow-200 hover:bg-yellow-300";
            case "Low": return "bg-green-200 hover:bg-green-300";
            default: return "bg-gray-200 hover:bg-gray-300";
        }
    }
  }

  const getStatusBadgeColors = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-700"
      case "Ongoing":
        return "bg-blue-100 text-blue-700"
      case "Finished":
        return "bg-green-100 text-green-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }
  
  // 🛠️ NEW: Function to get text color based on card background (for better contrast)
  const getCardTextColors = (priority: string) => {
    switch (priority) {
        case "Critical":
        case "High":
        case "Medium":
        case "Low":
            return "text-gray-800"; // Use dark text for colored backgrounds
        default:
            return "text-gray-700";
    }
  }

  const openDialog = (concern: ITConcern) => {
    setSelectedConcern(concern)
    setStatus(concern.status)
  }

  const handleUpdate = () => {
    alert(`✅ Ticket ${selectedConcern?.id} updated to "${status}"`)
    setSelectedConcern(null)
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
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

  const totalConcerns = concerns.length
  const itemsPerPage = 6
  const totalPages = Math.ceil(totalConcerns / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentItems = concerns.slice(startIndex, startIndex + itemsPerPage)

  return (
    <SidebarProvider>
      <ConcernSidebar />
      <SidebarInset>
        {/* HEADER */}
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

          {/* PROFILE + LOGOUT */}
          <div className="flex items-center gap-3">
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" title="Profile">
                  <User className="h-5 w-5 text-gray-600" />
                </Button>
              </DialogTrigger>

              <DialogContent className="sm:max-w-[400px] bg-white rounded-xl">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-center">
                    Profile Information
                  </DialogTitle>
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
                      className="absolute bottom-0 right-0 bg-primary text-white text-xs px-2 py-1 rounded-md cursor-pointer hover:bg-primary/80"
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
                  <div>
                    <Label>Full Name:</Label>
                    <p className="font-medium text-gray-800">Super Admin</p>
                  </div>
                  <div>
                    <Label>Email:</Label>
                    <p className="font-medium text-gray-800">
                      admin@example.com
                    </p>
                  </div>
                  <div>
                    <Label>Role:</Label>
                    <p className="font-medium text-gray-800">Administrator</p>
                  </div>
                  <div>
                    <Label>Joined:</Label>
                    <p className="font-medium text-gray-800">October 15, 2024</p>
                  </div>
                </div>

                <DialogFooter className="flex justify-center">
                  <DialogClose asChild>
                    <Button variant="outline">Close</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              onClick={handleLogout}
              variant="secondary"
              size="icon"
              className="bg-red-50 hover:bg-red-100 text-red-600"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
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
              <Button variant="outline" className="bg-white hover:bg-gray-100">
                <Download className="h-5 w-5 text-gray-600" /> Download
              </Button>
              <div className="relative w-64">
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
                    {/* Updated filter options for clarity */}
                    <SelectItem value="id">Ticket ID</SelectItem>
                    <SelectItem value="employee">Employee Name</SelectItem>
                    <SelectItem value="department">Department</SelectItem>
                    <SelectItem value="type">Concern Type</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                    <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* LIST or GRID */}
          {isRowView ? (
            <div className="w-full bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden transition-all duration-500">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-700 text-white font-semibold">
                    <tr>
                      <th className="p-3">ID</th>
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
                        <td className="p-3 font-bold text-gray-700">{c.id}</td>
                        <td className="p-3 font-medium">{c.employeeName}</td>
                        <td className="p-3 text-gray-600">{c.department}</td>
                        <td className="p-3">{c.type}</td>
                        <td className="p-3 italic text-gray-500 truncate max-w-[250px]">
                          {c.remarks}
                        </td>
                        <td className="p-3 text-xs text-gray-500">
                          {c.dateCreated}
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
          ) : (
            // 🛠️ GRID VIEW MODIFIED
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 transition-all duration-500">
              {currentItems.map((c) => (
                <div
                  key={c.id}
                  onClick={() => openDialog(c)}
                  className={`rounded-lg border p-5 shadow hover:shadow-xl transition duration-300 cursor-pointer 
                    ${getRowBg(c.priority, false)} 
                    ${getCardTextColors(c.priority)}`} // Apply color as background and adjust text color
                >
                  <div className="flex justify-between items-start mb-2">
                      <h2 className="text-xl font-extrabold">
                          {c.id}
                      </h2>
                      {/* 🛠️ ADDED: Priority Badge */}
                      <span className={`text-xs font-bold uppercase px-3 py-1 rounded-full border border-current 
                          ${c.priority === "Critical" ? 'text-red-800 border-red-800' : 
                            c.priority === "High" ? 'text-orange-800 border-orange-800' : 
                            c.priority === "Medium" ? 'text-yellow-800 border-yellow-800' : 
                            'text-green-800 border-green-800'}`}
                      >
                          {c.priority}
                      </span>
                  </div>
                  
                  <h3 className="text-lg font-semibold mb-1">
                    {c.employeeName}
                  </h3>
                  <p className="text-sm opacity-80 mb-2">{c.department}</p>
                  <p className="text-sm italic line-clamp-2 mb-3 opacity-90">
                    {c.remarks}
                  </p>
                  <div className="flex justify-between items-center text-xs pt-3 border-t">
                    <span className="opacity-70">{c.dateCreated}</span>
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
          )}

          {/* DIALOG */}
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
                        {selectedConcern.employeeName}
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
                      <Label className="font-semibold text-gray-600">Type:</Label>
                      <p className="font-medium text-gray-900">
                        {selectedConcern.type}
                      </p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-600">
                        Priority:
                      </Label>
                      <p
                        className={`font-bold ${
                          selectedConcern.priority === "Critical"
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

                  <div className="pt-2">
                    <Label className="font-semibold text-gray-600">
                      Status
                    </Label>
                    <Select
                      value={status}
                      onValueChange={(v: ITConcern["status"]) => setStatus(v)}
                    >
                      <SelectTrigger className="w-full mt-1 bg-white border-gray-300">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pending">Pending</SelectItem>
                        <SelectItem value="Ongoing">Ongoing</SelectItem>
                        <SelectItem value="Finished">Finished</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              <DialogFooter className="mt-4">
                <Button
                  onClick={handleUpdate}
                  className="bg-gray-700 hover:bg-gray-800 text-white font-semibold"
                >
                  Update Status
                </Button>
                <DialogClose asChild>
                  <Button variant="outline">Close</Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
            
        {/* ADD TICKET DIALOG (Included the 3-column layout here for completeness based on previous requests, though not used in the original component logic) */}
        <Dialog open={isAddTicketDialogOpen} onOpenChange={setIsAddTicketDialogOpen}>
            <DialogContent className="sm:max-w-3xl"> 
                <DialogHeader>
                    <DialogTitle>Add New Ticket</DialogTitle>
                    <DialogDescription>Fill out all fields to add a new ticket manually.</DialogDescription>
                </DialogHeader>

                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        console.log("🆕 New Ticket Added:", manualNewTicket)
                        alert("New ticket added successfully!")
                        setIsAddTicketDialogOpen(false)
                    }}
                    className="space-y-4 mt-4 text-sm"
                >
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> 
                        <div className="flex flex-col space-y-1.5"><Label>Full Name</Label><Input placeholder="Enter full name" value={manualNewTicket.Fullname} onChange={(e) => setManualNewTicket({ ...manualNewTicket, Fullname: e.target.value })}/></div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Request Type</Label>
                            <Select value={manualNewTicket.requesttype} onValueChange={(value) => setManualNewTicket({ ...manualNewTicket, requesttype: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select request" /></SelectTrigger>
                                <SelectContent><SelectItem value="Incident">Incident</SelectItem><SelectItem value="Request">Request</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Type of Concern</Label>
                            <Select value={manualNewTicket.type} onValueChange={(value) => setManualNewTicket({ ...manualNewTicket, type: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select concern type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hardware">3rd Party Support</SelectItem><SelectItem value="Advisory(CRITICAL)">Advisory(CRITICAL)</SelectItem>
                                    <SelectItem value="Advisory(NON-CRITICAL)">Advisory(NON-CRITICAL)</SelectItem><SelectItem value="PC/Software">PC/Software</SelectItem><SelectItem value="Forticlient">Forticlient</SelectItem>
                                    <SelectItem value="General Inquiry">General Inquiry</SelectItem><SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="O365 Services">O365 Services</SelectItem>
                                    <SelectItem value="Network">Network</SelectItem><SelectItem value="SN0C">SN0C</SelectItem><SelectItem value="System">System</SelectItem>
                                    <SelectItem value="SOC">SOC</SelectItem><SelectItem value="Other VPN">Other VPN</SelectItem><SelectItem value="Others">Others</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Mode</Label>
                            <Select value={manualNewTicket.mode} onValueChange={(value) => setManualNewTicket({ ...manualNewTicket, mode: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select Mode" /></SelectTrigger>
                                <SelectContent><SelectItem value="Chat">Chat</SelectItem><SelectItem value="E-Email">E-Email</SelectItem><SelectItem value="Phone Call">Phone Call</SelectItem><SelectItem value="SD Portal">SD Portal</SelectItem><SelectItem value="Walk in">Walk in</SelectItem><SelectItem value="Web Form">Web Form</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Group</Label>
                            <Select value={manualNewTicket.group} onValueChange={(value) => setManualNewTicket({ ...manualNewTicket, group: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select Group" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Service Desk Services">Service Desk Services</SelectItem><SelectItem value="IT Asset Management Services">IT Asset Management Services</SelectItem>
                                    <SelectItem value="IT Governance Services">IT Governance Services</SelectItem><SelectItem value="Network Services">Network Services</SelectItem>
                                    <SelectItem value="System & Network Operations Center">System & Network Operations Center</SelectItem><SelectItem value="Systems Services">Systems Services</SelectItem>
                                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Technician Name</Label>
                            <Select value={manualNewTicket.technicianname} onValueChange={(value) => setManualNewTicket({ ...manualNewTicket, technicianname: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select Tecnician" /></SelectTrigger>
                                <SelectContent><SelectItem value="Disruptive Solution, Primex">ASD</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Site</Label>
                            <Select value={manualNewTicket.site} onValueChange={(value) => setManualNewTicket({ ...manualNewTicket, site: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select site" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Disruptive Solution, Primex">Disruptive Solution, Primex</SelectItem><SelectItem value="Disruptive Solution, J&L">Disruptive Solution, J&L</SelectItem>
                                    <SelectItem value="Disruptive Solution, Pasig Warehouse">Disruptive Solution, Pasig Warehouse</SelectItem><SelectItem value="Disruptive Solution, Grand Valle">Disruptive Solution, Grande Valle</SelectItem>
                                    <SelectItem value="Disruptive Solution, Cebu">Disruptive Solution, Cebu</SelectItem><SelectItem value="Disruptive Solution, Davao">Disruptive Solution, Davao</SelectItem>
                                    <SelectItem value="Disruptive Solution, CDO">Disruptive Solution, CDO</SelectItem><SelectItem value="Carmona Buildchem">Carmona Buildchem</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Department</Label>
                            <Select value={manualNewTicket.department} onValueChange={(value) => setManualNewTicket({ ...manualNewTicket, department: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IT Department">IT Department</SelectItem><SelectItem value="HR Department">HR Department</SelectItem>
                                    <SelectItem value="Accounting">Accounting</SelectItem><SelectItem value="Operations">Operations</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Date Sched (optional)</Label>
                            <Input type="date" value={manualNewTicket.dateSched} onChange={(e) => setManualNewTicket({ ...manualNewTicket, dateSched: e.target.value })}/>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Priority</Label>
                            <Select value={manualNewTicket.priority} onValueChange={(value) => setManualNewTicket({ ...manualNewTicket, priority: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select priority" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Incident-P1">Incident-P1</SelectItem><SelectItem value="Request-P1">Request-P1</SelectItem>
                                    <SelectItem value="Incident-P2">Incident-P2</SelectItem><SelectItem value="Request-P2">Request-P2</SelectItem>
                                    <SelectItem value="Incident-P3">Incident-P3</SelectItem><SelectItem value="Request-P3">Request-P3</SelectItem>
                                    <SelectItem value="Incident-P4">Incident-P4</SelectItem><SelectItem value="Request-P4">Request-P4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-1.5"><Label>Remarks</Label><Textarea className="w-full min-h-[100px]" placeholder="Enter remarks or description..." value={manualNewTicket.remarks} onChange={(e) => setManualNewTicket({ ...manualNewTicket, remarks: e.target.value })}/></div>
                    <div className="flex flex-col space-y-1.5"><Label>Processed By</Label><Input placeholder="Name of processor" value={manualNewTicket.processedBy} onChange={(e) => setManualNewTicket({ ...manualNewTicket, processedBy: e.target.value })}/></div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddTicketDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Add Ticket</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
        
        {/* CREATE TICKET DIALOG (Included the 3-column layout here for completeness based on previous requests) */}
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogContent className="sm:max-w-3xl">
                <DialogHeader>
                    <DialogTitle>Create New Ticket</DialogTitle>
                    <DialogDescription>Fill out all fields to create a new ticket.</DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> 
                        {/* Row 1 */}
                        <div><Label>Ticket Number</Label><Input value={ticketForm.ticketNumber} readOnly /></div>
                        <div><Label>Full Name</Label><Input value={ticketForm.Fullname} readOnly /></div>
                        <div><Label>Department</Label>
                            <Select value={ticketForm.department} onValueChange={(value) => setTicketForm({ ...ticketForm, department: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select department" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="IT Department">IT Department</SelectItem><SelectItem value="HR Department">HR Department</SelectItem>
                                    <SelectItem value="Accounting">Accounting</SelectItem><SelectItem value="Operations">Operations</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Row 2 */}
                        <div className="flex flex-col space-y-1.5">
                            <Label>Request Type</Label>
                            <Select value={newTicket.requesttype} onValueChange={(value) => setNewTicket({ ...newTicket, requesttype: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select request type" /></SelectTrigger>
                                <SelectContent><SelectItem value="Incident">Incident</SelectItem><SelectItem value="Request">Request</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Type of Concern</Label>
                            <Select value={newTicket.type} onValueChange={(value) => setNewTicket({ ...newTicket, type: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select concern type" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Hardware">3rd Party Support</SelectItem><SelectItem value="Advisory(CRITICAL)">Advisory(CRITICAL)</SelectItem>
                                    <SelectItem value="Advisory(NON-CRITICAL)">Advisory(NON-CRITICAL)</SelectItem><SelectItem value="PC/Software">PC/Software</SelectItem>
                                    <SelectItem value="Forticlient">Forticlient</SelectItem><SelectItem value="General Inquiry">General Inquiry</SelectItem>
                                    <SelectItem value="Maintenance">Maintenance</SelectItem><SelectItem value="O365 Services">O365 Services</SelectItem>
                                    <SelectItem value="Network">Network</SelectItem><SelectItem value="SN0C">SN0C</SelectItem><SelectItem value="System">System</SelectItem>
                                    <SelectItem value="SOC">SOC</SelectItem><SelectItem value="Other VPN">Other VPN</SelectItem><SelectItem value="Others">Others</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Mode</Label>
                            <Select value={newTicket.mode} onValueChange={(value) => setNewTicket({ ...newTicket, mode: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select Mode" /></SelectTrigger>
                                <SelectContent><SelectItem value="Chat">Chat</SelectItem><SelectItem value="E-Email">E-Email</SelectItem><SelectItem value="Phone Call">Phone Call</SelectItem><SelectItem value="SD Portal">SD Portal</SelectItem><SelectItem value="Walk in">Walk in</SelectItem><SelectItem value="Web Form">Web Form</SelectItem></SelectContent>
                            </Select>
                        </div>
                        {/* Row 3 */}
                        <div className="flex flex-col space-y-1.5">
                            <Label>Group</Label>
                            <Select value={newTicket.group} onValueChange={(value) => setNewTicket({ ...newTicket, group: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select Group" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Service Desk Services">Service Desk Services</SelectItem><SelectItem value="IT Asset Management Services">IT Asset Management Services</SelectItem>
                                    <SelectItem value="IT Governance Services">IT Governance Services</SelectItem><SelectItem value="Network Services">Network Services</SelectItem>
                                    <SelectItem value="System & Network Operations Center">System & Network Operations Center</SelectItem><SelectItem value="Systems Services">Systems Services</SelectItem>
                                    <SelectItem value="Human Resources">Human Resources</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Technician Name</Label>
                            <Select value={newTicket.technicianname} onValueChange={(value) => setNewTicket({ ...newTicket, technicianname: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select Tecnician" /></SelectTrigger>
                                <SelectContent><SelectItem value="Disruptive Solution, Primex">ASD</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Site</Label>
                            <Select value={newTicket.site} onValueChange={(value) => setNewTicket({ ...newTicket, site: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select site" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Disruptive Solution, Primex">Disruptive Solution, Primex</SelectItem><SelectItem value="Disruptive Solution, J&L">Disruptive Solution, J&L</SelectItem>
                                    <SelectItem value="Disruptive Solution, Pasig Warehouse">Disruptive Solution, Pasig Warehouse</SelectItem><SelectItem value="Disruptive Solution, Grand Valle">Disruptive Solution, Grande Valle</SelectItem>
                                    <SelectItem value="Disruptive Solution, Cebu">Disruptive Solution, Cebu</SelectItem><SelectItem value="Disruptive Solution, Davao">Disruptive Solution, Davao</SelectItem>
                                    <SelectItem value="Disruptive Solution, CDO">Disruptive Solution, CDO</SelectItem><SelectItem value="Carmona Buildchem">Carmona Buildchem</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {/* Row 4 */}
                        <div>
                            <Label>Date Sched (optional)</Label>
                            <Input type="date" value={ticketForm.dateSched} onChange={(e) => setTicketForm({ ...ticketForm, dateSched: e.target.value })}/>
                        </div>
                        <div className="flex flex-col space-y-1.5">
                            <Label>Priority</Label>
                            <Select value={newTicket.priority} onValueChange={(value) => setNewTicket({ ...newTicket, priority: value })}>
                                <SelectTrigger className="w-full"><SelectValue placeholder="Select priority" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Incident-P1">Incident-P1</SelectItem><SelectItem value="Request-P1">Request-P1</SelectItem>
                                    <SelectItem value="Incident-P2">Incident-P2</SelectItem><SelectItem value="Request-P2">Request-P2</SelectItem>
                                    <SelectItem value="Incident-P3">Incident-P3</SelectItem><SelectItem value="Request-P3">Request-P3</SelectItem>
                                    <SelectItem value="Incident-P4">Incident-P4</SelectItem><SelectItem value="Request-P4">Request-P4</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div>
                        <Label>Remarks</Label>
                        <Textarea placeholder="Enter remarks or description..." value={ticketForm.remarks} onChange={(e) => setTicketForm({ ...ticketForm, remarks: e.target.value })}/>
                    </div>
                    <div>
                        <Label>Processed By</Label>
                        <Input placeholder="Name of processor" value={ticketForm.processedBy} onChange={(e) => setTicketForm({ ...ticketForm, processedBy: e.target.value })}/>
                    </div>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                        <Button type="submit">Submit Ticket</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>


          {/* PAGINATION */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-8 pt-4 border-t text-sm text-gray-600">
            <span>Total Tickets: {totalConcerns}</span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                {[...Array(totalPages)].map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      onClick={() => setCurrentPage(i + 1)}
                      isActive={currentPage === i + 1}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}