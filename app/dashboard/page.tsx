"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
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
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  LogOut,
  User,
  Users,
  Ticket as TicketIcon,
  Clock,
  CheckCircle,
  LucideIcon,
  Hash,
  Loader2,
} from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// ----------------------
// Interfaces / Types
// ----------------------
interface CurrentUser {
  _id: string
  Username: string
  Email: string
  Role: string
  Firstname: string
  Lastname: string
  ReferenceID: string
  createdAt: string
}

interface Ticket {
  id: string
  ticketNumber?: string
  Fullname?: string
  employeeName?: string
  department?: string
  type?: string
  remarks?: string
  dateSched?: string
  priority?: string
  status?: "Pending" | "Ongoing" | "Finished" | "Resolved" | "New" | string
  createdAt?: string // ISO string
  processedBy?: string
  group?: string
  technicianname?: string
  requesttype?: string
}

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  colorClass?: string
  link: string
  bgColor?: string
  onClick: (link: string, title: string) => void
  isSelected: boolean
}

// ----------------------
// Small reusable helpers
// ----------------------
const formatDateTime = (iso?: string) => {
  if (!iso) return "N/A"
  try {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })
  } catch {
    return iso
  }
}

const todayISODate = new Date().toISOString().slice(0, 10) // "YYYY-MM-DD"

// ----------------------
// StatCard component
// ----------------------
function StatCard({ title, value, icon: Icon, colorClass = "text-gray-700", link, bgColor = "bg-white", onClick, isSelected }: StatCardProps) {
  const baseClasses = `relative overflow-hidden transition-all duration-300 hover:shadow-xl border-none ${bgColor} group cursor-pointer rounded-lg`
  const selectedClasses = isSelected ? "border-2 border-primary ring-2 ring-primary/50" : ""

  return (
    <Card className={`${baseClasses} ${selectedClasses}`} onClick={() => onClick(link, title)}>
      <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <Icon className="h-24 w-24" />
      </div>

      <CardHeader className="pb-2 z-10">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
          <div className="text-xl font-bold">{value}</div>
        </div>
      </CardHeader>
    </Card>
  )
}

// ----------------------
// DataTable component (Ticket[])
// ----------------------
interface DataTableProps {
  data: Ticket[]
  title: string
}

function DataTable({ data, title }: DataTableProps) {
  return (
    <>
      <CardHeader className="bg-gray-50 border-b flex items-center justify-between">
        <div>
          <CardTitle className="text-2xl font-semibold text-gray-800">{title}</CardTitle>
          <p className="text-sm text-gray-500">{data.length} item(s) found</p>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100">
                  <TableHead className="w-[120px] text-xs font-bold">Ticket #</TableHead>
                  <TableHead className="text-xs font-bold">Employee</TableHead>
                  <TableHead className="text-xs font-bold">Department</TableHead>
                  <TableHead className="text-xs font-bold">Type</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Created</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id || item.ticketNumber || Math.random()} className="hover:bg-gray-50 cursor-pointer">
                    <TableCell className="font-medium text-sm text-primary">{item.ticketNumber ?? item.id}</TableCell>
                    <TableCell className="text-sm">{item.Fullname ?? item.employeeName ?? "—"}</TableCell>
                    <TableCell className="text-sm">{item.department ?? "—"}</TableCell>
                    <TableCell className="text-sm">{item.type ?? item.requesttype ?? "—"}</TableCell>
                    <TableCell className="text-center">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-semibold ${item.status === "Pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : item.status === "Ongoing"
                            ? "bg-indigo-100 text-indigo-700"
                            : item.status === "Finished" || item.status === "Resolved"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                      >
                        {item.status ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-right text-gray-500">{formatDateTime(item.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-12 text-center text-gray-500">
              <Hash className="mx-auto h-8 w-8 mb-2" />
              <p>No items found for this category.</p>
            </div>
          )}
        </div>
      </CardContent>
    </>
  )
}

// ----------------------
// DashboardPage (main)
// ----------------------
export default function DashboardPage() {
  const router = useRouter()

  // profile related
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isProfileLoading, setIsProfileLoading] = useState(true)
  const [profileError, setProfileError] = useState<string | null>(null)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [openLogout, setOpenLogout] = useState(false)

  // tickets and UI
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [closedTickets, setClosedTickets] = useState<Ticket[]>([])
  const [selectedStat, setSelectedStat] = useState<{ link: string; title: string } | null>(null)

  // concern and UI
  const [concerns, setConcerns] = useState<Ticket[]>([])

  const fetchConcerns = async () => {
    try {
      const res = await fetch("/api/euconcern")
      const json = await res.json()

      if (!res.ok || !json.success) {
        console.error("Concerns API Error:", json)
        setConcerns([])
        return
      }

      const formatted = json.data.map((c: any) => ({
        id: c.ConcernNumber || c._id || String(Math.random()),
        ticketNumber: c.ConcernNumber,
        Fullname: c.employeeName,
        department: c.department,
        type: c.type,
        remarks: c.remarks,
        createdAt: c.createdAt,
        priority: c.priority,
        status: "New",
        requesttype: c.requesttype,
      }));


      setConcerns(formatted)

    } catch (err) {
      console.error("Failed to load concerns:", err)
      setConcerns([])
    }
  }

  // --- Fetch profile (keeps same behavior) ---
  const fetchProfile = async () => {
    setIsProfileLoading(true)
    setProfileError(null)
    try {
      const username = typeof window !== "undefined" ? localStorage.getItem("userId") : null
      if (!username) {
        setProfileError("No login session found. Please log in.")
        setIsProfileLoading(false)
        return
      }
      const res = await fetch(`/api/profile/${username}`)
      const data = await res.json()
      if (res.ok && data.success) {
        setCurrentUser(data.data)
      } else {
        setProfileError(data.message || "Failed to load user profile.")
      }
    } catch (error) {
      console.error("Error fetching profile:", error)
      setProfileError("Network error while fetching profile.")
    } finally {
      setIsProfileLoading(false)
    }
  }

  // --- Fetch tickets from API and populate state ---
  const fetchTickets = async () => {
    setLoadingTickets(true)
    try {
      const res = await fetch("/api/tickets")
      const json = await res.json()
      if (!res.ok || !json.success) {
        console.error("Tickets API error:", json)
        setTickets([])
        setClosedTickets([])
        return
      }

      // Expect json.data to be array of ticket objects
      const fetched: Ticket[] = (json.data ?? []).map((t: any) => ({
        id: t.id ?? t._id ?? t.ticketNumber ?? String(Math.random()),
        ticketNumber: t.ticketNumber ?? t.TicketNumber ?? undefined,
        Fullname: t.Fullname ?? t.employeeName ?? t.name ?? undefined,
        employeeName: t.employeeName ?? t.Fullname ?? undefined,
        department: t.department ?? t.dept ?? undefined,
        type: t.type ?? t.requesttype ?? undefined,
        remarks: t.remarks ?? undefined,
        dateSched: t.dateSched ?? undefined,
        priority: t.priority ?? undefined,
        status: t.status ?? (t.State ?? undefined),
        createdAt: t.createdAt ?? t.dateCreated ?? t.createdAtString ?? undefined,
        processedBy: t.processedBy ?? undefined,
        group: t.group ?? undefined,
        technicianname: t.technicianname ?? t.technician ?? undefined,
        requesttype: t.requesttype ?? undefined,
      }))

      setTickets(fetched)

      // closed tickets derived
      const closed = fetched.filter((x) => x.status === "Finished" || x.status === "Resolved")
      setClosedTickets(closed)
    } catch (error) {
      console.error("Failed to load tickets:", error)
      setTickets([])
      setClosedTickets([])
    } finally {
      setLoadingTickets(false)
    }
  }

  // --- Hooks: load profile and tickets on mount ---
  useEffect(() => {
    fetchProfile()
    fetchTickets()
    fetchConcerns()
  }, [])

  // --- Derived stats (computed from tickets state) ---
  const todayConcernsCount = concerns.filter((c) => (c.createdAt ?? "").slice(0, 10) === todayISODate).length
  const todayTicketsCount = tickets.filter((t) => (t.createdAt ?? "").slice(0, 10) === todayISODate).length
  const totalPendingCount = tickets.filter((t) => (t.status ?? "").toLowerCase() === "pending").length
  const ongoingCount = tickets.filter((t) => (t.status ?? "").toLowerCase() === "ongoing").length
  const finishedCount = tickets.filter((t) => {
    const s = (t.status ?? "").toLowerCase()
    return s === "finished" || s === "resolved"
  }).length

  // Stats config
  const allStats = [
    { title: "Today's Concerns", value: todayConcernsCount, icon: Users, colorClass: "text-blue-700", bgColor: "bg-blue-100", link: "/concerns/today" },
    { title: "Tickets Created Today", value: todayTicketsCount, icon: TicketIcon, colorClass: "text-green-700", bgColor: "bg-green-100", link: "/tickets/today" },
    { title: "Total Pending Tickets", value: totalPendingCount, icon: Clock, colorClass: "text-yellow-700", bgColor: "bg-yellow-100", link: "/tickets/pending" },
    { title: "Ongoing Tickets", value: ongoingCount, icon: Clock, colorClass: "text-indigo-700", bgColor: "bg-indigo-100", link: "/tickets/ongoing" },
    { title: "Finished Tickets", value: finishedCount, icon: CheckCircle, colorClass: "text-teal-700", bgColor: "bg-teal-100", link: "/tickets/finished" },
  ]

  // --- getFilteredData now uses tickets state ---
  const getFilteredData = (link: string): Ticket[] => {
    switch (link) {
      case "/concerns/today":
        return concerns.filter(
          (c) => (c.createdAt ?? "").slice(0, 10) === todayISODate
        )
      case "/tickets/today":
        return tickets.filter((t) => (t.createdAt ?? "").slice(0, 10) === todayISODate)
      case "/tickets/pending":
        return tickets.filter((t) => (t.status ?? "").toLowerCase() === "pending")
      case "/tickets/ongoing":
        return tickets.filter((t) => (t.status ?? "").toLowerCase() === "ongoing")
      case "/tickets/finished":
        return tickets.filter((t) => {
          const s = (t.status ?? "").toLowerCase()
          return s === "finished" || s === "resolved"
        })
      default:
        return []
    }
  }

  const tableData = selectedStat ? getFilteredData(selectedStat.link) : []
  const tableTitle = selectedStat ? selectedStat.title : "Select a Card for Details"

  const primaryStats = allStats.slice(0, 3)
  const secondaryStats = allStats.slice(3)

  const displayName = currentUser ? `${currentUser.Firstname} ${currentUser.Lastname}` : "IT User"

  // handlers
  const handleStatClick = (link: string, title: string) => {
    setSelectedStat({ link, title })
  }

  const handleLogout = () => {
    localStorage.removeItem("userId")
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

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* Header */}
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
                  <BreadcrumbPage>Overview</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="p-6 bg-gray-50 min-h-[calc(100vh-4rem)]">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Welcome, {displayName.length > 3 ? displayName : "IT User"}</h1>
            {/* Ipinapakita ang buong petsa at araw */}
            <div className="text-sm text-gray-500">{new Date().toLocaleDateString("en-US", { dateStyle: "full" })}</div>
          </div>

          {/* SECTION GRID: 3 columns sa medium screens para lumaki ang table */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

            {/* Stats Column (1/3 width sa medium screens) */}
            {/* Inalis ang fixed h-[600px] para hayaang mag-stack ang StatCards */}
            <div className="flex flex-col gap-4 md:col-span-1">

              {/* Primary Stats - Nakasalansan (stack) */}
              <div className="flex flex-col gap-4">
                {primaryStats.map((stat) => (
                  <StatCard key={stat.link} {...stat} onClick={handleStatClick} isSelected={selectedStat?.link === stat.link} />
                ))}
              </div>

              {/* Secondary Stats - Magkatabi (grid) sa small screens pataas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {secondaryStats.map((stat) => (
                  <StatCard key={stat.link} {...stat} onClick={handleStatClick} isSelected={selectedStat?.link === stat.link} />
                ))}
              </div>
            </div>

            {/* Center: Table or default (2/3 width sa medium screens) */}
            <Card className="shadow-lg overflow-hidden h-[510px] flex flex-col md:col-span-2">
              {selectedStat ? (
                loadingTickets ? (
                  <div className="p-8 text-center">
                    <Loader2 className="mx-auto h-8 w-8 animate-spin text-gray-500" />
                    <p className="mt-2 text-gray-600">Loading tickets...</p>
                  </div>
                ) : (
                  <DataTable data={tableData} title={tableTitle} />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 py-20">
                  <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h2 className="text-xl font-semibold">No Data Selected</h2>
                  <p className="text-sm">Click any card on the left to view detailed analytics.</p>
                </div>
              )}
            </Card>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
