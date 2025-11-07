"use client"

import { useState } from "react"
// Assuming these are correct paths in your Next.js setup
import { AppSidebar } from "../components/sidebar" 
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  User,
  LogOut,
  Download,
  LayoutGrid,
  List,
  Search,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// --- Interface (Unchanged) ---
interface ITConcern {
  id: string
  employeeName: string
  department: string
  type: string
  remarks: string
  dateCreated: string
  status: "Pending" | "Ongoing" | "Finished"
  priority: "Low" | "Medium" | "High" | "Critical"
}

// Function para sa light background color base sa Priority
const getPriorityBg = (priority: ITConcern["priority"]) => {
    switch (priority) {
      case "Critical":
        return "bg-red-50 hover:bg-red-100/70" // Very light red
      case "High":
        return "bg-orange-50 hover:bg-orange-100/70" // Very light orange
      case "Medium":
        return "bg-yellow-50 hover:bg-yellow-100/70" // Very light yellow
      case "Low":
        return "bg-green-50 hover:bg-green-100/70" // Very light green
      default:
        return "bg-white hover:bg-gray-50"
    }
}

// Function para sa Status Badge (light colors)
const getStatusBadgeColors = (status: ITConcern['status']) => {
    switch(status) {
        case 'Finished': return 'bg-emerald-100 text-emerald-700'
        case 'Ongoing': return 'bg-amber-100 text-amber-700'
        case 'Pending': return 'bg-red-100 text-red-700'
        default: return 'bg-gray-100 text-gray-700'
    }
}

// --- ConcernCard Component (Unchanged, uses soft BG) ---
function ConcernCard({ concern, onClick }: { concern: ITConcern, onClick: (c: ITConcern) => void }) {
  
  const cardBg = getPriorityBg(concern.priority)
  const statusBadgeColor = getStatusBadgeColors(concern.status)
  
  // Text color for Priority label for contrast
  const priorityTextColor = 
    concern.priority === "Critical" ? "text-red-600" :
    concern.priority === "High" ? "text-orange-600" :
    concern.priority === "Medium" ? "text-yellow-600" :
    "text-green-600";

  return (
    <Card
      className={`w-full h-full transition cursor-pointer ${cardBg} shadow-md border border-gray-200`}
      onClick={() => onClick(concern)}
    >
      <CardHeader className="p-4 pb-1">
        <div className="flex justify-between items-start mb-1">
            <CardTitle className="text-lg font-bold text-gray-900 leading-snug">
                {concern.type}
            </CardTitle>
            <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded-full ${priorityTextColor} bg-gray-100 border border-gray-200`}>
                {concern.priority}
            </span>
        </div>
        <p className="text-xs text-gray-500">
            **ID:** {concern.id} | **Date:** {concern.dateCreated}
        </p>
      </CardHeader>
      <CardContent className="text-sm text-gray-700 p-4 pt-2">
        <div className="space-y-1 mb-3">
            <p>
                **Employee:** <span className="font-semibold">{concern.employeeName}</span>
            </p>
            <p>
                **Department:** <span className="font-medium">{concern.department}</span>
            </p>
        </div>
        <p className="line-clamp-2 italic text-gray-600 mb-4">
            **Remarks:** {concern.remarks}
        </p>
        <div className="flex justify-end">
          <span
            className={`text-xs font-bold px-3 py-1 rounded-full uppercase ${statusBadgeColor}`}
          >
            {concern.status}
          </span>
        </div>
      </CardContent>
    </Card>
  )
}

// --- Main Component ---
export default function ITConcernsPage() {
  const [isRowView, setIsRowView] = useState(true)
  const [selectedConcern, setSelectedConcern] = useState<ITConcern | null>(null)
  const [status, setStatus] = useState<ITConcern["status"]>("Pending")
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [filterBy, setFilterBy] = useState("")
  const [searchTerm, setSearchTerm] = useState("") 

  const concerns: ITConcern[] = [
    {
      id: "IT-0001",
      employeeName: "Juan Dela Cruz",
      department: "Human Resources",
      type: "Hardware Issue",
      remarks: "Desktop computer not turning on after power outage.",
      dateCreated: "2025-10-10",
      status: "Pending",
      priority: "High",
    },
    {
      id: "IT-0002",
      employeeName: "Maria Santos",
      department: "Finance",
      type: "System Access",
      remarks: "Unable to open the payroll system due to version mismatch. Critical for month-end.",
      dateCreated: "2025-10-12",
      status: "Ongoing",
      priority: "Medium",
    },
    {
      id: "IT-0003",
      employeeName: "Carlos Mendoza",
      department: "IT Department",
      type: "Network Downtime",
      remarks: "Slow internet connection in the main office. Already assigned to a technician.",
      dateCreated: "2025-10-14",
      status: "Finished",
      priority: "Low",
    },
    {
      id: "IT-0004",
      employeeName: "Anna Cruz",
      department: "Operations",
      type: "Security Breach",
      remarks: "Server vulnerability detected. Immediate fix required. All systems are at risk.",
      dateCreated: "2025-10-18",
      status: "Ongoing",
      priority: "Critical",
    },
    {
        id: "IT-0005",
        employeeName: "Ramon Reyes",
        department: "Sales",
        type: "Software Glitch",
        remarks: "CRM dashboard not loading client data. Affecting new sales pipeline.",
        dateCreated: "2025-10-19",
        status: "Pending",
        priority: "High",
      },
      {
        id: "IT-0006",
        employeeName: "Liza Dizon",
        department: "Marketing",
        type: "Printer Setup",
        remarks: "New printer needs to be connected to the Marketing LAN. Low priority request.",
        dateCreated: "2025-10-20",
        status: "Pending",
        priority: "Low",
      },
  ]

  const totalConcerns = concerns.length
  const currentPage = 1

  const openDialog = (concern: ITConcern) => {
    setSelectedConcern(concern)
    setStatus(concern.status)
  }

  const handleUpdate = () => {
    alert(`Status for ${selectedConcern?.id} updated to ${status}`)
    setSelectedConcern(null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfilePic(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  // Row background color based on Priority (Same soft colors as cards)
  const getRowBg = getPriorityBg

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="text-gray-700">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Tickets</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* PROFILE + LOGOUT (Unchanged) */}
          <div className="flex items-center gap-3">
            <Dialog open={isProfileOpen} onOpenChange={setIsProfileOpen}>
                <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" title="Profile">
                        <User className="h-5 w-5 text-gray-600" />
                    </Button>
                </DialogTrigger>
                {/* ... Dialog Content (Profile) ... */}
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
                            <p className="font-medium text-gray-800">
                                October 15, 2024
                            </p>
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
              variant="secondary"
              size="icon"
              className="bg-red-50 text-red-600 hover:bg-red-100"
              title="Logout"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="p-6 bg-[#f7f8fa] min-h-[calc(100vh-4rem)]">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 pb-4 border-b border-gray-200">
            
            {/* UPDATED TITLE AND VIEW TOGGLE */}
            <div className="flex items-center gap-4 mb-3 md:mb-0">
              <h1 className="text-3xl font-extrabold text-gray-700">IT Support Tickets</h1>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsRowView(!isRowView)}
                className="bg-white hover:bg-gray-100"
                title={isRowView ? "Switch to Grid View" : "Switch to List View"}
              >
                {isRowView ? (
                  <LayoutGrid className="h-5 w-5 text-gray-700" />
                ) : (
                  <List className="h-5 w-5 text-gray-700" />
                )}
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" className="flex items-center gap-2 bg-white hover:bg-gray-100 border-gray-300">
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

              <Select value={filterBy} onValueChange={setFilterBy}>
                <SelectTrigger className="w-[140px] h-10 bg-white border-gray-300 focus:ring-gray-500">
                  <SelectValue placeholder="Filter by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="id">ID</SelectItem>
                  <SelectItem value="employee">Employee</SelectItem>
                  <SelectItem value="department">Department</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="priority">Priority</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* TABLE or GRID CONTAINER */}
          {isRowView ? (
            // LIST/TABLE VIEW
            <div className="w-full bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-gray-700 text-white font-semibold">
                    <tr>
                      <th className="p-3 w-[80px]">ID</th>
                      <th className="p-3 w-[150px]">Employee</th>
                      <th className="p-3 w-[150px]">Department</th>
                      <th className="p-3 w-[120px]">Type</th>
                      <th className="p-3">Remarks</th>
                      <th className="p-3 w-[100px]">Date</th>
                      <th className="p-3 w-[100px]">Priority</th>
                      <th className="p-3 text-center w-[120px]">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {concerns.map((c) => (
                      <tr
                        key={c.id}
                        className={`border-b border-gray-100 transition cursor-pointer ${getRowBg(c.priority)}`}
                        onClick={() => openDialog(c)}
                      >
                        <td className="p-3 font-bold text-gray-700">{c.id}</td>
                        <td className="p-3 font-medium">{c.employeeName}</td>
                        <td className="p-3 text-gray-600">{c.department}</td>
                        <td className="p-3 text-gray-700">{c.type}</td>
                        <td className="p-3 max-w-[300px] truncate italic text-gray-500">
                          {c.remarks}
                        </td>
                        <td className="p-3 text-xs text-gray-500">{c.dateCreated}</td>
                        <td className="p-3 font-semibold text-gray-800">
                          {c.priority}
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getStatusBadgeColors(c.status)}`}
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
            // CARD/GRID VIEW 
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"> 
              {concerns.map((concern) => (
                <ConcernCard
                    key={concern.id}
                    concern={concern}
                    onClick={openDialog}
                />
              ))}
            </div>
          )}

          {/* DIALOG (FIXED SYNTAX ERROR HERE) */}
          <Dialog open={!!selectedConcern} onOpenChange={() => setSelectedConcern(null)}>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold text-gray-900">Ticket #{selectedConcern?.id} Details</DialogTitle>
              </DialogHeader>

              {selectedConcern && (
                <div className="space-y-4 text-sm p-2 border rounded-lg bg-gray-50">
                  <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                    <div>
                      <Label className="font-semibold text-gray-600">Employee:</Label>
                      <p className="font-medium text-gray-900">{selectedConcern.employeeName}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-600">Department:</Label>
                      <p className="font-medium text-gray-900">{selectedConcern.department}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-600">Type:</Label>
                      <p className="font-medium text-gray-900">{selectedConcern.type}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-600">Priority:</Label>
                      <p className={`font-bold ${
                          // 🚨🚨 Ito ang inayos na bahagi para mawala ang error 1005 at 1381 🚨🚨
                          selectedConcern.priority === 'Critical' ? 'text-red-600' :
                          selectedConcern.priority === 'High' ? 'text-orange-600' :
                          'text-green-600' 
                        }`}>
                        {selectedConcern.priority}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                      <Label className="font-semibold text-gray-600">Remarks:</Label>
                      <p className="italic text-gray-700">{selectedConcern.remarks}</p>
                  </div>

                  <div className="pt-2">
                    <Label className="font-semibold text-gray-600">Status</Label>
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

          {/* FIXED FOOTER PAGINATION */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 mt-8 pt-4 border-t text-sm text-gray-600">
            <span>Total Tickets: **{totalConcerns}**</span>
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#" isActive className="bg-white text-white hover:bg-gray-100">
                    {currentPage}
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">2</PaginationLink>
                </PaginationItem>
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