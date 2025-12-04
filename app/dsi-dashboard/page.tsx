"use client"

import * as React from "react"
import { AppSidebar, data, type Mail as BaseMail, type NavItem } from "@/app/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { Reply, Trash2, X, ArchiveX, Send } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogFooter } from "@/components/ui/dialog"

// ================================
// Mail Type with concern info
// ================================
export type Mail = BaseMail & { concernNumber?: string; submissionDate?: string };

// ================================
// Mock data for Select fields
// ================================
const departments = ["IT Operations", "Human Resources", "Accounting", "Sales"]
const requestTypes = ["Hardware Request", "Software Issue", "Maintenance", "Access Request"]
const concernTypes = ["Urgent Fix", "System Outage", "General Inquiry", "Enhancement"]
const modes = ["Email", "Call", "Manual", "Chat"]
const sites = ["Manila HQ", "Cebu Branch", "Davao Site"]
const priorities = ["High", "Medium", "Low"]

interface NewConcernForm {
  concernNumber: string
  FullName: string
  department: string
  requestType: string
  type: string
  mode: string
  site: string
  dateSched: string
  priority: string
  remarks: string
}

const initialConcernState: NewConcernForm = {
  concernNumber: "",
  FullName: "",
  department: "",
  requestType: "",
  type: "",
  mode: "",
  site: "",
  dateSched: "",
  priority: "",
  remarks: "",
}

// ================================
// Page Component
// ================================
export default function Page() {
  const [activeItem, setActiveItem] = React.useState<NavItem>(data.navMain[0])
  const [selectedMail, setSelectedMail] = React.useState<Mail | null>(null)
  const [sentConcerns, setSentConcerns] = React.useState<Mail[]>([])

  React.useEffect(() => setSelectedMail(null), [activeItem])

  const isCreateConcern = activeItem.title === "Create Concern"
  const primarySidebarWidth = isCreateConcern ? "190px" : "490px"
  const secondarySidebarWidth = "350px"

  return (
    <SidebarProvider
      style={{
        "--sidebar-width": primarySidebarWidth,
        "--sidebar-width-second": secondarySidebarWidth,
      } as React.CSSProperties}
    >
      <AppSidebar
        activeItem={activeItem}
        setActiveItem={setActiveItem}
        selectedMail={selectedMail}
        setSelectedMail={setSelectedMail}
        sentConcerns={sentConcerns}
        setSentConcerns={setSentConcerns}
      />

      <SidebarInset>
        <header className="bg-background sticky top-0 flex shrink-0 items-center gap-2 border-b p-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 data-[orientation=vertical]:h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="#">All Inboxes</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{selectedMail ? selectedMail.subject : activeItem.title}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </header>

        <div className="p-8 h-full overflow-y-auto">
          {selectedMail ? (
            <MailDetail mail={selectedMail} setSelectedMail={setSelectedMail} />
          ) : (
            <CategorySummary
              activeItem={activeItem}
              sentConcerns={sentConcerns}
              setSentConcerns={setSentConcerns}
            />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

// ================================
// Mail Detail Component
// ================================
const MailDetail = ({
  mail,
  setSelectedMail,
}: {
  mail: Mail
  setSelectedMail: React.Dispatch<React.SetStateAction<Mail | null>>
}) => (
 <div className="space-y-6 p-6 bg-white rounded-xl border shadow-sm">
  {/* Header */}
  <div className="flex items-center justify-between pb-4 border-b">
    <h1 className="text-2xl font-bold">Edit Concern</h1>
    <div className="space-x-2 flex">
      <Button variant="outline" size="sm" onClick={() => setSelectedMail(null)}>
        <X className="size-4 mr-2" /> Close
      </Button>
      <Button size="sm">
        Save Changes
      </Button>
    </div>
  </div>

  {/* Form Fields */}
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div className="space-y-1">
      <Label>Subject</Label>
      <Input defaultValue={mail.subject} />
    </div>

    <div className="space-y-1">
      <Label>Concern Number</Label>
      <Input defaultValue={mail.concernNumber || ""} />
    </div>

    <div className="space-y-1">
      <Label>Name</Label>
      <Input defaultValue={mail.name} />
    </div>

    <div className="space-y-1">
      <Label>Email</Label>
      <Input defaultValue={mail.email} />
    </div>
  </div>

  {/* Date */}
  <div className="space-y-1">
    <Label>Date</Label>
    <Input defaultValue={mail.date} disabled />
  </div>

  {/* Body */}
  <div className="space-y-1">
    <Label>Message Content</Label>
    <Textarea
      className="min-h-[200px]"
      defaultValue={mail.teaser.replace(/\\n/g, "\n\n")}
    />
  </div>
</div>
)

// ================================
// Category Summary / Create Concern Form
// ================================
const CategorySummary = ({
  activeItem,
  sentConcerns,
  setSentConcerns,
}: {
  activeItem: NavItem
  sentConcerns: Mail[]
  setSentConcerns: React.Dispatch<React.SetStateAction<Mail[]>>
}) => {
  // Pinalitan ang variable name sa 'newConcern' at 'initialConcernState'
  const [newConcern, setNewConcern] = React.useState<NewConcernForm>(initialConcernState)
  const [validationErrors, setValidationErrors] = React.useState<Partial<NewConcernForm>>({})
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitMessage, setSubmitMessage] = React.useState<{ type: "success" | "error"; message: string } | null>(null)

  const requiredFields: (keyof NewConcernForm)[] = ["FullName", "department", "requestType", "type", "mode", "site", "priority", "remarks"]
  const getErrorClass = (field: keyof NewConcernForm) => (validationErrors[field] ? "border-red-500 focus-visible:ring-red-500" : "")

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitMessage(null)
    setIsSubmitting(true)

    let errors: Partial<NewConcernForm> = {}
    let isValid = true
    requiredFields.forEach((field) => {
      if (!newConcern[field] || (typeof newConcern[field] === "string" && newConcern[field].trim() === "")) {
        errors[field] = "Required"
        isValid = false
      }
    })
    setValidationErrors(errors)
    if (!isValid) {
      setSubmitMessage({ type: "error", message: "Please fill in all required fields marked with *." })
      setIsSubmitting(false)
      return
    }

    try {
      // Try API submission
      const payload = {
        Fullname: newConcern.FullName,
        department: newConcern.department,
        requesttype: newConcern.requestType,
        type: newConcern.type,
        mode: newConcern.mode,
        site: newConcern.site,
        dateSched: newConcern.dateSched,
        priority: newConcern.priority,
        remarks: newConcern.remarks,
      }

      // Ginawa ring 'euconcern' ang endpoint
      const response = await fetch('/api/euconcern', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const newMail: Mail = {
          subject: `Concern for ${newConcern.FullName}`, // Pinalitan ang 'concern' sa 'Concern'
          name: newConcern.FullName,
          email: "",
          date: new Date().toLocaleDateString(),
          teaser: newConcern.remarks,
          concernNumber: data.ConcernNumber,
          submissionDate: new Date().toISOString()
        }
        setSentConcerns([newMail, ...sentConcerns])
        setSubmitMessage({ type: 'success', message: `Concern ${data.ConcernNumber} successfully created!` })
        setNewConcern(initialConcernState)
        setValidationErrors({})
      } else {
        throw new Error(data.message || "Failed to create concern.")
      }
    } catch {
      // Fallback mock concern
      const mockConcern: Mail = {
        subject: `Concern for ${newConcern.FullName}`, // Pinalitan ang 'concern' sa 'Concern'
        name: newConcern.FullName,
        email: "",
        date: new Date().toLocaleDateString(),
        teaser: newConcern.remarks,
        concernNumber: `C-${Math.floor(Math.random() * 9000) + 1000}`, // Ginawa ring 'C-' ang prefix
        submissionDate: new Date().toISOString()
      }
      setSentConcerns([mockConcern, ...sentConcerns])
      setSubmitMessage({ type: "success", message: `Concern ${mockConcern.concernNumber} created (mock fallback)!` })
      setNewConcern(initialConcernState)
      setValidationErrors({})
    } finally {
      setIsSubmitting(false)
    }
  }

  if (activeItem.title !== "Create Concern") {
    return (
      <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
        <ArchiveX className="size-16 mb-4 text-gray-300" />
        {/* In-update ang text dito */}
        <h1 className="text-2xl font-bold mb-2 text-foreground">{activeItem.title}</h1>
        <p className="max-w-md">No email or concern selected. Choose an item from the middle list to see details here.</p>
        <p className="mt-2 text-sm italic">To create a new concern, select "Create Concern" in the left sidebar.</p>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-xl shadow-2xl border border-gray-100">
      <div className="flex items-center space-x-3 pb-4 border-b">
        <Send className="size-6 text-primary" />
        {/* In-update ang heading dito */}
        <h2 className="text-2xl font-bold text-gray-800">New Concern / Concern Entry</h2>
      </div>

      {submitMessage && (
        <div className={`mt-4 p-4 rounded-lg text-sm font-semibold transition-all duration-300 ${
          submitMessage.type === "success"
            ? "bg-green-50 text-green-700 border border-green-300"
            : "bg-red-50 text-red-700 border border-red-300"
        }`}>
          {submitMessage.message}
        </div>
      )}

      <form onSubmit={handleManualSubmit} className="space-y-6 mt-4 text-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-4">
          {/* Full Name */}
          <div className="flex flex-col space-y-1.5">
            <Label className={validationErrors.FullName ? "text-red-600" : ""}>Full Name *</Label>
            <Input
              placeholder="Requester's Full Name"
              value={newConcern.FullName}
              className={getErrorClass("FullName")}
              onChange={(e) => setNewConcern({ ...newConcern, FullName: e.target.value })}
            />
          </div>
          {/* Department */}
          <div className="flex flex-col space-y-1.5">
            <Label className={validationErrors.department ? "text-red-600" : ""}>Department *</Label>
            <Select value={newConcern.department} onValueChange={(val) => setNewConcern({ ...newConcern, department: val })}>
              <SelectTrigger className={`w-full ${getErrorClass("department")}`}><SelectValue placeholder="Select department" /></SelectTrigger>
              <SelectContent>{departments.map(dep => <SelectItem key={dep} value={dep}>{dep}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {/* Request Type */}
          <div className="flex flex-col space-y-1.5">
            <Label className={validationErrors.requestType ? "text-red-600" : ""}>Request Type *</Label>
            <Select value={newConcern.requestType} onValueChange={(val) => setNewConcern({ ...newConcern, requestType: val })}>
              <SelectTrigger className={`w-full ${getErrorClass("requestType")}`}><SelectValue placeholder="Select request type" /></SelectTrigger>
              <SelectContent>{requestTypes.map(rt => <SelectItem key={rt} value={rt}>{rt}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {/* Type */}
          <div className="flex flex-col space-y-1.5">
            <Label className={validationErrors.type ? "text-red-600" : ""}>Type of Concern *</Label>
            <Select value={newConcern.type} onValueChange={(val) => setNewConcern({ ...newConcern, type: val })}>
              <SelectTrigger className={`w-full ${getErrorClass("type")}`}><SelectValue placeholder="Select concern type" /></SelectTrigger>
              <SelectContent>{concernTypes.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {/* Mode */}
          <div className="flex flex-col space-y-1.5">
            <Label className={validationErrors.mode ? "text-red-600" : ""}>Mode *</Label>
            <Select value={newConcern.mode} onValueChange={(val) => setNewConcern({ ...newConcern, mode: val })}>
              <SelectTrigger className={`w-full ${getErrorClass("mode")}`}><SelectValue placeholder="Select mode" /></SelectTrigger>
              <SelectContent>{modes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {/* Site */}
          <div className="flex flex-col space-y-1.5">
            <Label className={validationErrors.site ? "text-red-600" : ""}>Site *</Label>
            <Select value={newConcern.site} onValueChange={(val) => setNewConcern({ ...newConcern, site: val })}>
              <SelectTrigger className={`w-full ${getErrorClass("site")}`}><SelectValue placeholder="Select site" /></SelectTrigger>
              <SelectContent>{sites.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {/* Date Sched */}
          <div className="flex flex-col space-y-1.5">
            <Label>Date Sched (optional)</Label>
            <Input type="date" value={newConcern.dateSched} onChange={(e) => setNewConcern({ ...newConcern, dateSched: e.target.value })}/>
          </div>
          *//{/* Priority */}
          <div className="flex flex-col space-y-1.5">
            <Label className={validationErrors.priority ? "text-red-600" : ""}>Priority *</Label>
            <Select value={newConcern.priority} onValueChange={(val) => setNewConcern({ ...newConcern, priority: val })}>
              <SelectTrigger className={`w-full ${getErrorClass("priority")}`}><SelectValue placeholder="Select priority" /></SelectTrigger>
              <SelectContent>{priorities.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
            </Select>
          </div>//*
        </div>

        {/* Remarks */}
        <div className="flex flex-col space-y-1.5">
          <Label className={validationErrors.remarks ? "text-red-600" : ""}>Remarks *</Label>
          <Textarea
            placeholder="Enter remarks..."
            value={newConcern.remarks}
            className={getErrorClass("remarks")}
            onChange={(e) => setNewConcern({ ...newConcern, remarks: e.target.value })}
          />
        </div>

        {/* Form Footer */}
        <DialogFooter className="pt-4 flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={() => { setNewConcern(initialConcernState); setValidationErrors({}); setSubmitMessage(null) }}>
            <X className="size-4 mr-2" /> Clear Form
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {/* In-update ang button label dito */}
            {isSubmitting ? "Submitting..." : (<><Send className="size-4 mr-2" /> Submit Concern</>)}
          </Button>
        </DialogFooter>
      </form>
    </div>
  )
}