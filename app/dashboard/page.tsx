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
import {
  Users,
  Ticket as TicketIcon,
  Clock,
  CheckCircle,
  LucideIcon,
  Hash,
  Loader2,
} from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// --- Interfaces ---
interface CurrentUser {
  _id: string
  Username: string
  Email: string
  Role: string
  Firstname: string
  Lastname: string
  ReferenceID: string
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
  status?: string
  createdAt?: string 
  group?: string
  technicianname?: string
  requesttype?: string
}

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  link: string
  bgColor?: string
  onClick: (link: string, title: string) => void
  isSelected: boolean
}

// --- Reusable Helpers ---
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

// --- Components ---
function StatCard({ title, value, icon: Icon, link, onClick, isSelected }: StatCardProps) {
  const baseClasses = `relative overflow-hidden transition-all duration-300 hover:shadow-xl border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 group cursor-pointer rounded-lg`
  const selectedClasses = isSelected ? "ring-2 ring-blue-500 dark:ring-indigo-500 border-transparent shadow-md" : ""

  return (
    <Card className={`${baseClasses} ${selectedClasses}`} onClick={() => onClick(link, title)}>
      <div className="absolute right-0 top-0 opacity-10 dark:opacity-5 group-hover:opacity-20 transition-opacity duration-300 pointer-events-none">
        <Icon className="h-20 w-20 dark:text-white" />
      </div>
      <CardHeader className="pb-2 z-10">
        <div className="flex flex-col gap-1">
          <CardTitle className="text-sm font-medium text-gray-700 dark:text-zinc-400">{title}</CardTitle>
          <div className="text-2xl font-bold dark:text-zinc-100">{value}</div>
        </div>
      </CardHeader>
    </Card>
  )
}

function DataTable({ data, title }: { data: Ticket[]; title: string }) {
  return (
    <>
      <CardHeader className="bg-gray-50 dark:bg-zinc-900/40 border-b dark:border-zinc-800 flex items-center justify-between py-4">
        <div>
          <CardTitle className="text-xl font-semibold text-gray-800 dark:text-zinc-100">{title}</CardTitle>
          <p className="text-xs text-gray-500 dark:text-zinc-400 font-medium uppercase tracking-wider">{data.length} item(s) found</p>
        </div>
      </CardHeader>
      <CardContent className="p-0 bg-white dark:bg-black">
        <div className="overflow-x-auto">
          {data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 dark:bg-zinc-900/60 border-none">
                  <TableHead className="text-xs font-bold dark:text-zinc-300">Ticket #</TableHead>
                  <TableHead className="text-xs font-bold dark:text-zinc-300">Employee</TableHead>
                  <TableHead className="text-xs font-bold dark:text-zinc-300">Type</TableHead>
                  <TableHead className="text-xs font-bold dark:text-zinc-300">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right dark:text-zinc-300">Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, idx) => (
                  <TableRow key={item.id || item.ticketNumber || idx} className="hover:bg-gray-50 dark:hover:bg-zinc-900/40 border-gray-100 dark:border-zinc-800">
                    <TableCell className="font-mono text-xs text-indigo-600 dark:text-indigo-400">{item.ticketNumber ?? item.id}</TableCell>
                    <TableCell className="text-sm dark:text-zinc-300 font-medium">{item.Fullname ?? item.employeeName ?? "—"}</TableCell>
                    <TableCell className="text-xs dark:text-zinc-400">{item.type ?? item.requesttype ?? "—"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        item.status === "Pending" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-500" :
                        item.status === "Ongoing" ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400" :
                        item.status === "Finished" || item.status === "Resolved" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        "bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-zinc-400"
                      }`}>
                        {item.status ?? "—"}
                      </span>
                    </TableCell>
                    <TableCell className="text-[11px] text-right text-gray-500 dark:text-zinc-500">{formatDateTime(item.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-16 text-center text-gray-400 dark:text-zinc-600">
              <Hash className="mx-auto h-10 w-10 mb-2 opacity-20" />
              <p className="text-sm font-medium italic">Empty category</p>
            </div>
          )}
        </div>
      </CardContent>
    </>
  )
}

// --- Main Page ---
export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [loadingTickets, setLoadingTickets] = useState(true)
  const [concerns, setConcerns] = useState<Ticket[]>([])
  const [selectedStat, setSelectedStat] = useState<{ link: string; title: string } | null>(null)

  const today = new Date().toISOString().slice(0, 10)

  // 1. Initial hydration fix and auth check
  useEffect(() => {
    setMounted(true)
    const user = localStorage.getItem("currentUser")
    if (!user) {
      router.push("/login")
    } else {
      fetchProfile()
      fetchTickets()
      fetchConcerns()
    }
  }, [])

  const fetchConcerns = async () => {
    try {
      const res = await fetch("/api/euconcern")
      const json = await res.json()
      if (res.ok && json.success) {
        setConcerns(json.data.map((c: any) => ({
          id: c._id,
          ticketNumber: c.ConcernNumber,
          Fullname: c.employeeName,
          createdAt: c.createdAt,
          status: "New",
          requesttype: c.requesttype,
          type: c.type
        })))
      }
    } catch (err) { console.error(err) }
  }

  const fetchProfile = async () => {
    try {
      const username = localStorage.getItem("userId")
      if (!username) return
      const res = await fetch(`/api/profile/${username}`)
      const data = await res.json()
      if (res.ok && data.success) setCurrentUser(data.data)
    } catch (err) { console.error(err) }
  }

  const fetchTickets = async () => {
    setLoadingTickets(true)
    try {
      const res = await fetch("/api/tickets")
      const json = await res.json()
      if (res.ok && json.success) {
        setTickets(json.data.map((t: any) => ({
          id: t._id,
          ticketNumber: t.ticketNumber,
          Fullname: t.employeeName || t.Fullname,
          department: t.department,
          status: t.status,
          createdAt: t.createdAt,
          type: t.type,
          requesttype: t.requesttype
        })))
      }
    } catch (err) { console.error(err) }
    finally { setLoadingTickets(false) }
  }

  const stats = [
    { title: "Today's Concerns", value: concerns.filter(c => c.createdAt?.slice(0, 10) === today).length, icon: Users, link: "/concerns/today" },
    { title: "Tickets Today", value: tickets.filter(t => t.createdAt?.slice(0, 10) === today).length, icon: TicketIcon, link: "/tickets/today" },
    { title: "Pending", value: tickets.filter(t => t.status?.toLowerCase() === "pending").length, icon: Clock, link: "/tickets/pending" },
    { title: "Ongoing", value: tickets.filter(t => t.status?.toLowerCase() === "ongoing").length, icon: Clock, link: "/tickets/ongoing" },
    { title: "Finished", value: tickets.filter(t => ["finished", "resolved"].includes(t.status?.toLowerCase() || "")).length, icon: CheckCircle, link: "/tickets/finished" },
  ]

  const handleStatClick = (link: string, title: string) => setSelectedStat({ link, title })

  const tableData = selectedStat ? (
    selectedStat.link === "/concerns/today" 
      ? concerns.filter(c => c.createdAt?.slice(0, 10) === today)
      : tickets.filter(t => {
          if (selectedStat.link === "/tickets/today") return t.createdAt?.slice(0, 10) === today
          if (selectedStat.link === "/tickets/pending") return t.status?.toLowerCase() === "pending"
          if (selectedStat.link === "/tickets/ongoing") return t.status?.toLowerCase() === "ongoing"
          if (selectedStat.link === "/tickets/finished") return ["finished", "resolved"].includes(t.status?.toLowerCase() || "")
          return false
        })
  ) : []

  // Proteksyon sa hydration mismatch
  if (!mounted) return null

  const displayName = currentUser ? `${currentUser.Firstname} ${currentUser.Lastname}` : "IT User"

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-white dark:bg-black">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md px-6 transition-colors">
          <div className="flex items-center gap-4">
            <SidebarTrigger className="dark:text-zinc-400 dark:hover:bg-zinc-900" />
            <Separator orientation="vertical" className="h-6 dark:bg-zinc-800" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard" className="dark:text-zinc-500">Dashboard</BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block dark:text-zinc-800" />
                <BreadcrumbItem>
                  <BreadcrumbPage className="dark:text-zinc-100">Home</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>

        <main className="p-4 md:p-8 bg-gray-50 dark:bg-black min-h-[calc(100vh-4rem)] transition-colors">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
              Welcome, <span className="text-blue-600 dark:text-indigo-400">{displayName}</span>
            </h1>
            <div className="px-3 py-1 bg-white dark:bg-zinc-900 border dark:border-zinc-800 rounded-full text-[10px] font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-[0.2em]">
              {new Date().toLocaleDateString("en-US", { dateStyle: "full" })}
            </div>
          </div>

          <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 flex flex-col gap-4">
              <div className="grid grid-cols-1 gap-4">
                {stats.slice(0, 3).map((stat) => (
                  <StatCard key={stat.link} {...stat} onClick={handleStatClick} isSelected={selectedStat?.link === stat.link} />
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {stats.slice(3).map((stat) => (
                  <StatCard key={stat.link} {...stat} onClick={handleStatClick} isSelected={selectedStat?.link === stat.link} />
                ))}
              </div>
            </div>

            <Card className="lg:col-span-8 shadow-xl overflow-hidden h-[540px] flex flex-col border-gray-200 dark:border-zinc-800 dark:bg-black">
              {selectedStat ? (
                loadingTickets ? (
                  <div className="flex flex-col items-center justify-center h-full gap-3">
                    <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
                    <p className="text-sm font-medium text-gray-400 dark:text-zinc-500">Fetching records...</p>
                  </div>
                ) : (
                  <DataTable data={tableData} title={selectedStat.title} />
                )
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 dark:text-zinc-600 p-8">
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 dark:bg-zinc-900/50 flex items-center justify-center mb-6 border dark:border-zinc-800/50">
                    <TicketIcon className="w-10 h-10 opacity-30" />
                  </div>
                  <h2 className="text-lg font-bold dark:text-zinc-300">No Analytics Selected</h2>
                  <p className="text-sm text-center mt-2 max-w-[280px] leading-relaxed opacity-70">
                    Click on one of the cards to the left to see detailed ticket logs and status updates.
                  </p>
                </div>
              )}
            </Card>
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}