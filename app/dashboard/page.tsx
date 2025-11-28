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
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { LogOut, User, Users, Ticket, Clock, CheckCircle, LucideIcon, ChevronRight, Hash, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// --- INTERFACES ---
interface Concern {
  id: string
  employeeName: string
  department: string
  type: string // e.g., "Hardware", "Software"
  remarks: string
  dateCreated: string // Format: YYYY-MM-DD
  priority: 'Critical' | 'High' | 'Medium' | 'Low'
  status: 'New' | 'Pending' | 'Ongoing' | 'Resolved' | 'Finished' 
}

interface CurrentUser {
  _id: string;
  Username: string;
  Email: string;
  Role: string;
  Firstname: string;
  Lastname: string;
  ReferenceID: string;
  createdAt: string;
}

interface StatCardProps {
  title: string
  value: number | string
  icon: LucideIcon
  colorClass: string
  link: string 
  bgColor?: string
  onClick: (link: string, title: string) => void
  isSelected: boolean
}

// --- STAT CARD COMPONENT (Unchanged) ---
function StatCard({ title, value, icon: Icon, colorClass, link, bgColor, onClick, isSelected }: StatCardProps) {
  const baseClasses = `relative overflow-hidden transition-all duration-300 hover:shadow-xl border-none ${bgColor || "bg-white"} group cursor-pointer`
  const selectedClasses = isSelected ? "border-2 border-primary ring-2 ring-primary/50" : ""

  return (
    <Card
      className={`${baseClasses} ${selectedClasses}`}
      onClick={() => onClick(link, title)}
    >
      <div className="absolute right-0 top-0 opacity-10 group-hover:opacity-20 transition-opacity duration-300">
        <Icon className="h-24 w-24" />
      </div>
      <CardHeader className="flex flex-row items-center justify-between pb-2 z-10">
        <CardTitle className="text-sm font-medium text-gray-700">{title}</CardTitle>
        <div className={`p-2 rounded-full bg-white/70 shadow-inner ${colorClass}`}>
          <Icon className={`h-5 w-5`} />
        </div>
      </CardHeader>
      <CardContent className="z-10">
        <div className="text-4xl font-extrabold text-gray-900 mb-3">{value}</div>
        <span className="flex items-center gap-1 text-sm font-semibold text-primary/80 hover:text-primary transition-colors">
          Show Details <ChevronRight className="h-4 w-4" />
        </span>
      </CardContent>
    </Card>
  )
}

// --- DUMMY DATA & FILTERING (Unchanged) ---
const todayDate = "2025-10-29" // Simulate Today's Date
const allTickets: Concern[] = [
    { id: "IT-0001", employeeName: "Juan Dela Cruz", department: "Human Resources", type: "Hardware", remarks: "Desktop computer not turning on after power outage.", dateCreated: "2025-10-29", priority: "Critical", status: 'New' },
    { id: "IT-0002", employeeName: "Maria Santos", department: "Finance", type: "Software", remarks: "Unable to open the payroll system due to version mismatch.", dateCreated: "2025-10-29", priority: "High", status: 'New' },
    { id: "IT-0006", employeeName: "Pedro Santos", department: "Finance", type: "Hardware", remarks: "Printer not responding after connecting via Wi-Fi.", dateCreated: "2025-10-29", priority: "High", status: 'New' },
    { id: "IT-0007", employeeName: "Sofia Garcia", department: "Admin", type: "Network", remarks: "Cannot access shared drive.", dateCreated: "2025-10-29", priority: "Medium", status: 'New' },
    { id: "IT-0003", employeeName: "Carlos Mendoza", department: "IT Department", type: "Network", remarks: "Slow internet connection in the main office.", dateCreated: "2025-10-29", priority: "Medium", status: 'Ongoing' },
    { id: "IT-0004", employeeName: "Anna Reyes", department: "Customer Support", type: "Account", remarks: "Cannot log into email account after password reset.", dateCreated: "2025-10-28", priority: "Critical", status: 'Pending' },
    { id: "IT-0005", employeeName: "Liza Dizon", department: "Marketing", type: "Software", remarks: "Adobe Photoshop license expired.", dateCreated: "2025-10-27", priority: "Low", status: 'Resolved' },
    { id: "IT-0008", employeeName: "Mark Rivera", department: "Sales", type: "Software", remarks: "CRM dashboard not loading data properly.", dateCreated: "2025-10-26", priority: "High", status: 'Finished' },
]

const getFilteredData = (link: string): Concern[] => {
  switch (link) {
    case '/concerns/today':
      return allTickets.filter(t => t.dateCreated === todayDate && t.status === 'New')
    case '/tickets/today':
      return allTickets.filter(t => t.dateCreated === todayDate)
    case '/tickets/pending':
      return allTickets.filter(t => t.status === 'Pending')
    case '/tickets/ongoing':
      return allTickets.filter(t => t.status === 'Ongoing')
    case '/tickets/finished':
      return allTickets.filter(t => t.status === 'Resolved' || t.status === 'Finished')
    default:
      return []
  }
}

const getStatusClasses = (status: Concern['status']) => {
  switch (status) {
    case 'New': return 'bg-blue-100 text-blue-700'
    case 'Pending': return 'bg-yellow-100 text-yellow-700'
    case 'Ongoing': return 'bg-indigo-100 text-indigo-700'
    case 'Resolved':
    case 'Finished': return 'bg-green-100 text-green-700'
    default: return ''
  }
}

// --- DATA TABLE COMPONENT (Unchanged) ---
interface DataTableProps {
  data: Concern[]
  title: string
}

function DataTable({ data, title }: DataTableProps) {
  return (
    <>
      <CardHeader className="bg-gray-50 border-b">
        <CardTitle className="text-2xl font-semibold text-gray-800">{title}</CardTitle>
        <p className="text-sm text-gray-500">{data.length} item(s) found</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          {data.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow className="bg-gray-100 hover:bg-gray-100">
                  <TableHead className="w-[100px] text-xs font-bold">ID</TableHead>
                  <TableHead className="text-xs font-bold">Employee</TableHead>
                  <TableHead className="text-xs font-bold">Department</TableHead>
                  <TableHead className="text-xs font-bold">Type</TableHead>
                  <TableHead className="text-xs font-bold">Status</TableHead>
                  <TableHead className="text-xs font-bold text-right">Date Created</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.id} className="hover:bg-gray-50 cursor-pointer">
                    <TableCell className="font-medium text-sm text-primary">{item.id}</TableCell>
                    <TableCell className="text-sm">{item.employeeName}</TableCell>
                    <TableCell className="text-sm">{item.department}</TableCell>
                    <TableCell className="text-sm">{item.type}</TableCell>
                    <TableCell className="text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getStatusClasses(item.status)}`}>
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-right text-gray-500">{item.dateCreated}</TableCell> 
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


export default function DashboardPage() {
  const router = useRouter()
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  const [selectedStat, setSelectedStat] = useState<{ link: string, title: string } | null>(null)
  
  // --- STATE FOR PROFILE ---
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);

  // 🧩 FETCH Profile from API (Updated to use Username from localStorage)
  const fetchProfile = async () => {
    setIsProfileLoading(true);
    setProfileError(null);
    try {
      // NOTE: We now assume 'userId' in localStorage stores the Username string
      const username = localStorage.getItem("userId");
      
      if (!username) {
        setProfileError("No login session found. Please log in.");
        setIsProfileLoading(false);
        return;
      }

      // Calls the updated API route: /api/profile/[username]
      const res = await fetch(`/api/profile/${username}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentUser(data.data);
      } else {
        setProfileError(data.message || "Failed to load user profile.");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      setProfileError("Network error while fetching profile.");
    } finally {
      setIsProfileLoading(false);
    }
  };
  
  // Fetch profile on initial load
  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userId") // IMPORTANT: Use 'userId' key
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

  const handleStatClick = (link: string, title: string) => {
    setSelectedStat({ link, title })
  }
  
  // Helper function to format date
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  };

  // Calculate dynamic values based on the new data
  const todayConcernsCount = allTickets.filter(t => t.dateCreated === todayDate && t.status === 'New').length
  const todayTicketsCount = allTickets.filter(t => t.dateCreated === todayDate).length
  const totalPendingCount = allTickets.filter(t => t.status === 'Pending').length
  const ongoingCount = allTickets.filter(t => t.status === 'Ongoing').length
  const finishedCount = allTickets.filter(t => t.status === 'Resolved' || t.status === 'Finished').length


  const allStats = [
    {
      title: "Today's Concerns",
      value: todayConcernsCount,
      icon: Users,
      colorClass: "text-blue-600",
      bgColor: "bg-blue-50",
      link: "/concerns/today",
    },
    {
      title: "Tickets Created Today",
      value: todayTicketsCount,
      icon: Ticket,
      colorClass: "text-green-600",
      bgColor: "bg-green-50",
      link: "/tickets/today",
    },
    {
      title: "Total Pending Tickets",
      value: totalPendingCount,
      icon: Clock,
      colorClass: "text-yellow-600",
      bgColor: "bg-yellow-50",
      link: "/tickets/pending",
    },
    {
      title: "Ongoing Tickets",
      value: ongoingCount,
      icon: Clock,
      colorClass: "text-indigo-600",
      bgColor: "bg-indigo-50",
      link: "/tickets/ongoing",
    },
    {
      title: "Finished Tickets",
      value: finishedCount,
      icon: CheckCircle,
      colorClass: "text-teal-600",
      bgColor: "bg-teal-50",
      link: "/tickets/finished",
    },
  ]

  const tableData = selectedStat ? getFilteredData(selectedStat.link) : []
  const tableTitle = selectedStat ? selectedStat.title : "Select a Card for Details"

  const primaryStats = allStats.slice(0, 3)
  const secondaryStats = allStats.slice(3)

  // Use the fetched user's name or a default placeholder
  const displayName = currentUser ? `${currentUser.Firstname} ${currentUser.Lastname}` : 'IT User';


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

          {/* PROFILE + LOGOUT BUTTONS */}
          <div className="ml-auto flex items-center gap-3">
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
                  {isProfileLoading ? (
                    <div className="text-center p-4 text-gray-500">
                        <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2" />
                        <p>Loading profile data...</p>
                    </div>
                  ) : profileError ? (
                    <div className="text-center p-4 text-red-500 border border-red-200 bg-red-50 rounded">
                        <p>{profileError}</p>
                        <p className="text-xs mt-1">Please check the network or login state.</p>
                    </div>
                  ) : currentUser ? (
                    <>
                      {/* --- Dynamically loaded content from currentUser state --- */}
                      <div><Label>Full Name:</Label><p className="font-medium text-gray-800">{currentUser.Firstname} {currentUser.Lastname}</p></div>
                      <div><Label>Username:</Label><p className="font-medium text-gray-800">{currentUser.Username}</p></div>
                      <div><Label>Email:</Label><p className="font-medium text-gray-800">{currentUser.Email}</p></div>
                      <div><Label>Role:</Label><p className="font-medium text-gray-800">{currentUser.Role}</p></div>
                      <div><Label>Reference ID:</Label><p className="font-medium text-gray-800">{currentUser.ReferenceID}</p></div>
                      <div><Label>Joined:</Label><p className="font-medium text-gray-800">{formatDate(currentUser.createdAt)}</p></div>
                      {/* -------------------------------------------------------- */}
                    </>
                  ) : (
                    <p className="text-gray-500">Profile data unavailable.</p>
                  )}
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

        {/* Main dashboard section */}
        <main className="p-6 bg-gray-50 min-h-[calc(100vh-4rem)]">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome, {displayName.length > 3 ? displayName : 'IT User'}
            </h1>
            <div className="text-sm text-gray-500">
              {new Date().toLocaleDateString('en-US', { dateStyle: 'full' })}
            </div>
          </div>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="flex flex-col gap-6">
              {primaryStats.map((stat) => (
                <StatCard
                  key={stat.link}
                  {...stat}
                  onClick={handleStatClick}
                  isSelected={selectedStat?.link === stat.link}
                />
              ))}
            </div>

            {/* Central Card: Ito ang magpapakita ng filtered table data */}
            <Card className="col-span-1 md:col-span-1 shadow-lg overflow-hidden h-[400px] flex flex-col">
              {selectedStat ? (
                <DataTable data={tableData} title={tableTitle} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-500">
                  <Ticket className="h-12 w-12 mb-4 text-gray-400" />
                  <p className="text-lg font-semibold">Dashboard Overview</p>
                  <p>Click on any **Stat Card** on the left or bottom to view the detailed list in this table.</p>
                </div>
              )}
            </Card>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryStats.map((stat) => (
              <StatCard
                key={stat.link}
                {...stat}
                onClick={handleStatClick}
                isSelected={selectedStat?.link === stat.link}
              />
            ))}
          </section>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}