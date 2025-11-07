"use client"

import * as React from "react"
import { ArchiveX, File, Inbox, Send, Trash2 } from "lucide-react"
import { AppSidebar } from "../components/sidebar"
import { Label } from "@/components/ui/label"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInput,
  useSidebar,
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
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"

// 🧩 Sample data
const data = {
  navMain: [
    { title: "Inbox", url: "#", icon: Inbox, isActive: true },
    { title: "Drafts", url: "#", icon: File, isActive: false },
    { title: "Sent", url: "#", icon: Send, isActive: false },
    { title: "Junk", url: "#", icon: ArchiveX, isActive: false },
    { title: "Trash", url: "#", icon: Trash2, isActive: false },
  ],
  mails: [
    {
      name: "Carlos Mendoza",
      email: "carlos.mendoza@example.com",
      subject: "Network Issue (IT-0003)",
      date: "2025-10-14",
      teaser:
        "Slow internet connection in the main office. Department: IT Department.",
      priority: "Normal",
    },
    {
      name: "Anna Reyes",
      email: "anna.reyes@example.com",
      subject: "Account Issue (IT-0004)",
      date: "2025-10-15",
      teaser:
        "Cannot log into email account after password reset. Department: Customer Support.",
      priority: "Critical",
    },
  ],
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
      return "bg-red-50 hover:bg-red-100"
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

export function ConcernSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const [activeItem] = React.useState(data.navMain[0])
  const [mails] = React.useState(data.mails)
  const { setOpen } = useSidebar()

  // 🟢 Dialog states
  const [selectedMail, setSelectedMail] = React.useState<any>(null)
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)

  const [ticketForm, setTicketForm] = React.useState({
    ticketNumber: "",
    Fullname: "",
    department: "",
    dateSched: "",
    type: "",
    status: "Pending",
    remarks: "",
    processedBy: "",

  })

  const openDialog = (mail: any) => {
    setSelectedMail(mail)
    setIsDialogOpen(true)
  }
  // 🆕 Add Ticket dialog states
  const [isAddTicketDialogOpen, setIsAddTicketDialogOpen] = React.useState(false)
  const [newTicket, setNewTicket] = React.useState({
    ticketNumber: "",
    Fullname: "",
    department: "",
    dateSched: "",
    type: "",
    status: "Pending",
    remarks: "",
    processedBy: "",
    priority: "", // ✅ Added new field
    requesttype: "",
    mode:"",
    site: "",
    group:"",
    technicianname:"",
  })

  const openAddDialog = () => {
    if (selectedMail) {
      const [Fullname] = selectedMail.name.split(" ")
      setTicketForm({
        ticketNumber: selectedMail.subject.match(/\((.*?)\)/)?.[1] || "",
        Fullname: "",
        department: selectedMail.teaser.match(/Department:\s(.*)\./)?.[1] || "",
        dateSched: "",
        type: selectedMail.subject.split(" ")[0] || "",
        status: "Pending",
        remarks: selectedMail.teaser,
        processedBy: "",
      })
    }
    setIsDialogOpen(false)
    setIsAddDialogOpen(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("🧾 Ticket submitted:", ticketForm)
    alert("Ticket submitted successfully!")
    setIsAddDialogOpen(false)
  }

  return (
    <>
      <AppSidebar />
      <Sidebar
        collapsible="none"
        className="overflow-y-auto h-screen md:flex w-[22%] bg-white border-r"
      >
        {/* 🧭 Header */}
        <SidebarHeader className="gap-3.5 border-b p-4 bg-gray-50">
          <div className="flex w-full items-center justify-between">
            <div className="text-foreground text-base font-semibold">
              {activeItem?.title}
            </div>
            <div className="flex items-center gap-3">
              <Label className="flex items-center gap-2 text-sm">
                <span>Unreads</span>
                <Switch className="shadow-none" />
              </Label>
              {/* ➕ Add Ticket button */}
              <Button
                size="sm"
                className="bg-green-600 hover:bg-green-700 text-white font-medium px-3 py-1"
                onClick={() => setIsAddTicketDialogOpen(true)}
              >
                + Ticket
              </Button>
            </div>
          </div>

          <SidebarInput placeholder="Search concerns..." />
        </SidebarHeader>


        {/* 📨 List of Concerns */}
        <SidebarContent>
          <SidebarGroup className="px-0">
            <SidebarGroupContent>
              {mails.map((mail, index) => (
                <button
                  key={index}
                  onClick={() => openDialog(mail)}
                  className={`transition-all flex flex-col gap-2 border-b p-4 text-sm text-left w-full last:border-b-0 ${getBgColor(
                    mail.priority
                  )}`}
                >
                  <div className="flex w-full items-center gap-2">
                    <span className="font-semibold text-gray-900">{mail.name}</span>
                    <span className="ml-auto text-xs text-gray-500">{mail.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-800">{mail.subject}</span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getPriorityColor(
                        mail.priority
                      )}`}
                    >
                      {mail.priority}
                    </span>
                  </div>

                  <span className="line-clamp-2 text-xs text-gray-700">
                    {mail.teaser}
                  </span>
                </button>
              ))}
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
      </Sidebar>

      {/* 🪟 Concern Details Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          {selectedMail && (
            <>
              <DialogHeader>
                <DialogTitle>{selectedMail.subject}</DialogTitle>
                <DialogDescription>
                  Concern details from {selectedMail.name}
                </DialogDescription>
              </DialogHeader>

              <div className="mt-4 space-y-3 text-sm">
                <div>
                  <strong>Name:</strong> {selectedMail.name}
                </div>
                <div>
                  <strong>Email:</strong> {selectedMail.email}
                </div>
                <div>
                  <strong>Date:</strong> {selectedMail.date}
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
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Close
                </Button>
                <Button onClick={openAddDialog}>Create Ticket</Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

 {/* 🎫 Create Ticket Dialog */}
<Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
    <DialogContent className="sm:max-w-3xl"> {/* 🛠️ UPDATED: Wider dialog */}
        <DialogHeader>
            <DialogTitle>Create New Ticket</DialogTitle>
            <DialogDescription>Fill out all fields to create a new ticket.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3 mt-4 text-sm">
            {/* 🛠️ UPDATED: Changed from grid-cols-2 to grid-cols-3 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> 
                
                {/* Row 1, Column 1: Ticket Number (Read Only) */}
                <div>
                    <Label>Ticket Number</Label>
                    <Input value={ticketForm.ticketNumber} readOnly />
                </div>

                {/* Row 1, Column 2: Full Name (Read Only) */}
                <div>
                    <Label>Full Name</Label>
                    <Input value={ticketForm.Fullname} readOnly />
                </div>
                
                {/* Row 1, Column 3: Department */}
                <div>
                    <Label>Department</Label>
                    <Select
                        value={ticketForm.department}
                        onValueChange={(value) =>
                            setTicketForm({ ...ticketForm, department: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IT Department">IT Department</SelectItem>
                            <SelectItem value="HR Department">HR Department</SelectItem>
                            <SelectItem value="Accounting">Accounting</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* --- Start of Request Details --- */}
                
                {/* Row 2, Column 1: Request Type */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Request Type</Label>
                    <Select
                        value={newTicket.requesttype} // Assuming this uses newTicket state
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, requesttype: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select request type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Incident">Incident</SelectItem>
                            <SelectItem value="Request">Request</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Row 2, Column 2: Type of Concern */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Type of Concern</Label>
                    <Select
                        value={newTicket.type} // Assuming this uses newTicket state
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, type: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select concern type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hardware">3rd Party Support</SelectItem>
                            <SelectItem value="Advisory(CRITICAL)">Advisory(CRITICAL)</SelectItem>
                            <SelectItem value="Advisory(NON-CRITICAL)">Advisory(NON-CRITICAL)</SelectItem>
                            <SelectItem value="PC/Software">PC/Software</SelectItem>
                            <SelectItem value="Forticlient">Forticlient</SelectItem>
                            <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="O365 Services">O365 Services</SelectItem>
                            <SelectItem value="Network">Network</SelectItem>
                            <SelectItem value="SN0C">SN0C</SelectItem>
                            <SelectItem value="System">System</SelectItem>
                            <SelectItem value="SOC">SOC</SelectItem>
                            <SelectItem value="Other VPN">Other VPN</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Row 2, Column 3: Mode (ADDED from previous form) */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Mode</Label>
                    <Select
                        value={newTicket.mode} // Assuming this uses newTicket state
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, mode: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Chat">Chat</SelectItem>
                            <SelectItem value="E-Email">E-Email</SelectItem>
                            <SelectItem value="Phone Call">Phone Call</SelectItem>
                            <SelectItem value="SD Portal">SD Portal</SelectItem>
                            <SelectItem value="Walk in">Walk in</SelectItem>
                            <SelectItem value="Web Form">Web Form</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Row 3, Column 1: Group (ADDED from previous form) */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Group</Label>
                    <Select
                        value={newTicket.group} // Assuming this uses newTicket state
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, group: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Service Desk Services">Service Desk Services</SelectItem>
                            <SelectItem value="IT Asset Management Services">IT Asset Management Services</SelectItem>
                            <SelectItem value="IT Governance Services">IT Governance Services</SelectItem>
                            <SelectItem value="Network Services">Network Services</SelectItem>
                            <SelectItem value="System & Network Operations Center">System & Network Operations Center</SelectItem>
                            <SelectItem value="Systems Services">Systems Services</SelectItem>
                            <SelectItem value="Human Resources">Human Resources</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 3, Column 2: Technician Name (ADDED from previous form) */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Technician Name</Label>
                    <Select
                        value={newTicket.technicianname} // Assuming this uses newTicket state
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, technicianname: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Tecnician" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Disruptive Solution, Primex">
                                ASD
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 3, Column 3: Site (Updated options) */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Site</Label>
                    <Select
                        value={newTicket.site} // Assuming this uses newTicket state
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, site: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Disruptive Solution, Primex">Disruptive Solution, Primex</SelectItem>
                            <SelectItem value="Disruptive Solution, J&L">Disruptive Solution, J&L</SelectItem>
                            <SelectItem value="Disruptive Solution, Pasig Warehouse">Disruptive Solution, Pasig Warehouse</SelectItem>
                            <SelectItem value="Disruptive Solution, Grand Valle">Disruptive Solution, Grande Valle</SelectItem>
                            <SelectItem value="Disruptive Solution, Cebu">Disruptive Solution, Cebu</SelectItem>
                            <SelectItem value="Disruptive Solution, Davao">Disruptive Solution, Davao</SelectItem>
                            <SelectItem value="Disruptive Solution, CDO">Disruptive Solution, CDO</SelectItem>
                            <SelectItem value="Carmona Buildchem">Carmona Buildchem</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Row 4, Column 1: Date Schedule */}
                <div>
                    <Label>Date Sched (optional)</Label>
                    <Input
                        type="date"
                        value={ticketForm.dateSched}
                        onChange={(e) =>
                            setTicketForm({ ...ticketForm, dateSched: e.target.value })
                        }
                    />
                </div>

                {/* Row 4, Column 2: Priority (Updated options) */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Priority</Label>
                    <Select
                        value={newTicket.priority} // Assuming this uses newTicket state
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, priority: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Incident-P1">Incident-P1</SelectItem>
                            <SelectItem value="Request-P1">Request-P1</SelectItem>
                            <SelectItem value="Incident-P2">Incident-P2</SelectItem>
                            <SelectItem value="Request-P2">Request-P2</SelectItem>
                            <SelectItem value="Incident-P3">Incident-P3</SelectItem>
                            <SelectItem value="Request-P3">Request-P3</SelectItem>
                            <SelectItem value="Incident-P4">Incident-P4</SelectItem>
                            <SelectItem value="Request-P4">Request-P4</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                {/* Row 4, Column 3 is empty */}

            </div>

            {/* Remarks (Full Width) */}
            <div>
                <Label>Remarks</Label>
                <Textarea
                    placeholder="Enter remarks or description..."
                    value={ticketForm.remarks}
                    onChange={(e) =>
                        setTicketForm({ ...ticketForm, remarks: e.target.value })
                    }
                />
            </div>

            {/* Processed By (Full Width) */}
            <div>
                <Label>Processed By</Label>
                <Input
                    placeholder="Name of processor"
                    value={ticketForm.processedBy}
                    onChange={(e) =>
                        setTicketForm({ ...ticketForm, processedBy: e.target.value })
                    }
                />
            </div>

            <DialogFooter className="pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                >
                    Cancel
                </Button>
                <Button type="submit">Submit Ticket</Button>
            </DialogFooter>
        </form>


    </DialogContent>
</Dialog>

      {/* ➕ Add Ticket Dialog (Manual Entry) */}


      <Dialog open={isAddTicketDialogOpen} onOpenChange={setIsAddTicketDialogOpen}>
    <DialogContent className="sm:max-w-3xl"> 
        <DialogHeader>
            <DialogTitle>Add New Ticket</DialogTitle>
            <DialogDescription>Fill out all fields to add a new ticket manually.</DialogDescription>
        </DialogHeader>

        <form
            onSubmit={(e) => {
                e.preventDefault()
                console.log("🆕 New Ticket Added:", newTicket)
                alert("New ticket added successfully!")
                setIsAddTicketDialogOpen(false)
            }}
            className="space-y-4 mt-4 text-sm"
        >
            {/* 🛠️ MODIFIED: Changed from sm:grid-cols-2 to sm:grid-cols-3 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4"> 
                
                {/* Row 1, Column 1 */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Full Name</Label>
                    <Input
                        className="w-full"
                        placeholder="Enter full name"
                        value={newTicket.Fullname}
                        onChange={(e) =>
                            setNewTicket({ ...newTicket, Fullname: e.target.value })
                        }
                    />
                </div>
                
                {/* Row 1, Column 2 */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Request Type</Label>
                    <Select
                        value={newTicket.requesttype}
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, requesttype: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select request" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Incident">Incident</SelectItem>
                            <SelectItem value="Request">Request</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Row 1, Column 3 */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Type of Concern</Label>
                    <Select
                        value={newTicket.type}
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, type: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select concern type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Hardware">3rd Party Support</SelectItem>
                            <SelectItem value="Advisory(CRITICAL)">Advisory(CRITICAL)</SelectItem>
                            <SelectItem value="Advisory(NON-CRITICAL)">Advisory(NON-CRITICAL)</SelectItem>
                            <SelectItem value="PC/Software">PC/Software</SelectItem>
                            <SelectItem value="Forticlient">Forticlient</SelectItem>
                            <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                            <SelectItem value="Maintenance">Maintenance</SelectItem>
                            <SelectItem value="O365 Services">O365 Services</SelectItem>
                            <SelectItem value="Network">Network</SelectItem>
                            <SelectItem value="SN0C">SN0C</SelectItem>
                            <SelectItem value="System">System</SelectItem>
                            <SelectItem value="SOC">SOC</SelectItem>
                            <SelectItem value="Other VPN">Other VPN</SelectItem>
                            <SelectItem value="Others">Others</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 2, Column 1 */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Mode</Label>
                    <Select
                        value={newTicket.mode}
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, mode: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Mode" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Chat">Chat</SelectItem>
                            <SelectItem value="E-Email">E-Email</SelectItem>
                            <SelectItem value="Phone Call">Phone Call</SelectItem>
                            <SelectItem value="SD Portal">SD Portal</SelectItem>
                            <SelectItem value="Walk in">Walk in</SelectItem>
                            <SelectItem value="Web Form">Web Form</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                
                {/* Row 2, Column 2 */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Group</Label>
                    <Select
                        value={newTicket.group}
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, group: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Group" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Service Desk Services">Service Desk Services</SelectItem>
                            <SelectItem value="IT Asset Management Services">IT Asset Management Services</SelectItem>
                            <SelectItem value="IT Governance Services">IT Governance Services</SelectItem>
                            <SelectItem value="Network Services">Network Services</SelectItem>
                            <SelectItem value="System & Network Operations Center">System & Network Operations Center</SelectItem>
                            <SelectItem value="Systems Services">Systems Services</SelectItem>
                            <SelectItem value="Human Resources">Human Resources</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 2, Column 3 */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Technician Name</Label>
                    <Select
                        value={newTicket.technicianname}
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, technicianname: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select Tecnician" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Disruptive Solution, Primex">
                                ASD
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 3, Column 1 */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Site</Label>
                    <Select
                        value={newTicket.site}
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, site: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select site" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Disruptive Solution, Primex">
                                Disruptive Solution, Primex
                            </SelectItem>
                            <SelectItem value="Disruptive Solution, J&L">
                                Disruptive Solution, J&L
                            </SelectItem>
                            <SelectItem value="Disruptive Solution, Pasig Warehouse">
                                Disruptive Solution, Pasig Warehouse
                            </SelectItem>
                            <SelectItem value="Disruptive Solution, Grand Valle">
                                Disruptive Solution, Grande Valle
                            </SelectItem>
                            <SelectItem value="Disruptive Solution, Cebu">
                                Disruptive Solution, Cebu
                            </SelectItem>
                            <SelectItem value="Disruptive Solution, Davao">
                                Disruptive Solution, Davao
                            </SelectItem>
                            <SelectItem value="Disruptive Solution, CDO">
                                Disruptive Solution, CDO
                            </SelectItem>
                            <SelectItem value="Carmona Buildchem">
                                Carmona Buildchem
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 3, Column 2 */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Department</Label>
                    <Select
                        value={newTicket.department}
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, department: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="IT Department">IT Department</SelectItem>
                            <SelectItem value="HR Department">HR Department</SelectItem>
                            <SelectItem value="Accounting">Accounting</SelectItem>
                            <SelectItem value="Operations">Operations</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Row 3, Column 3 */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Date Sched (optional)</Label>
                    <Input
                        className="w-full"
                        type="date"
                        value={newTicket.dateSched}
                        onChange={(e) =>
                            setNewTicket({ ...newTicket, dateSched: e.target.value })
                        }
                    />
                </div>

                {/* Row 4, Column 1 */}
                <div className="flex flex-col space-y-1.5">
                    <Label>Priority</Label>
                    <Select
                        value={newTicket.priority}
                        onValueChange={(value) =>
                            setNewTicket({ ...newTicket, priority: value })
                        }
                    >
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Incident-P1">Incident-P1</SelectItem>
                            <SelectItem value="Request-P1">Request-P1</SelectItem>
                            <SelectItem value="Incident-P2">Incident-P2</SelectItem>
                            <SelectItem value="Request-P2">Request-P2</SelectItem>
                            <SelectItem value="Incident-P3">Incident-P3</SelectItem>
                            <SelectItem value="Request-P3">Request-P3</SelectItem>
                            <SelectItem value="Incident-P4">Incident-P4</SelectItem>
                            <SelectItem value="Request-P4">Request-P4</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            
            {/* The Priority field is the only one in the 4th row (Column 1) */}
            </div>

            {/* The Remarks and Processed By fields remain full width below the grid */}
            <div className="flex flex-col space-y-1.5">
                <Label>Remarks</Label>
                <Textarea
                    className="w-full min-h-[100px]"
                    placeholder="Enter remarks or description..."
                    value={newTicket.remarks}
                    onChange={(e) =>
                        setNewTicket({ ...newTicket, remarks: e.target.value })
                    }
                />
            </div>

            <div className="flex flex-col space-y-1.5">
                <Label>Processed By</Label>
                <Input
                    className="w-full"
                    placeholder="Name of processor"
                    value={newTicket.processedBy}
                    onChange={(e) =>
                        setNewTicket({ ...newTicket, processedBy: e.target.value })
                    }
                />
            </div>

            <DialogFooter className="pt-4">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddTicketDialogOpen(false)}
                >
                    Cancel
                </Button>
                <Button type="submit">Add Ticket</Button>
            </DialogFooter>
        </form>


    </DialogContent>
</Dialog>
    </>
  )
}
