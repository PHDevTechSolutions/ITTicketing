"use client"

import { useState } from "react"
// I-assume na ito ang tamang path para sa iyong sidebar
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
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  User,
  LogOut,
  Plus, 
  Edit, 
  Trash2, 
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
  DropdownMenu, 
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react"

// --- Interface para sa Priority ---
interface Priority {
  id: string 
  name: string // Ang pangalan ng Priority Level (e.g., High, Low)
}

// --- Sample Data (Walang laman) ---
const initialPriorities: Priority[] = [
  // Walang default values
]

// --- Main Component ---
export default function PriorityPage() { 
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [profilePic, setProfilePic] = useState<string | null>(null)
  
  // State para sa Priorities
  const [priorities, setPriorities] = useState<Priority[]>(initialPriorities)
  
  // State para sa Add/Edit Dialog
  const [isPriorityDialogOpen, setIsPriorityDialogOpen] = useState(false)
  const [currentPriority, setCurrentPriority] = useState<Priority | null>(null)
  const [newPriorityName, setNewPriorityName] = useState("") 

  const handleLogout = () => {
    alert("Logged out! Redirect logic not implemented.")
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => setProfilePic(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleSavePriority = () => {
    if (!newPriorityName) {
      alert("Please enter the priority name.")
      return
    }

    if (currentPriority) {
      // Edit Priority
      setPriorities(priorities.map(priority => 
        priority.id === currentPriority.id 
          ? { ...priority, name: newPriorityName } 
          : priority
      ))
      alert(`Priority ${currentPriority.id} updated!`)
    } else {
      // Add New Priority
      const newId = `PR-${(priorities.length + 1).toString().padStart(3, '0')}`
      const newPriority: Priority = {
        id: newId,
        name: newPriorityName,
      }
      setPriorities([...priorities, newPriority])
      alert(`Priority ${newId} added!`)
    }

    // Reset and Close
    setIsPriorityDialogOpen(false)
    setCurrentPriority(null)
    setNewPriorityName("")
  }

  const handleEdit = (priority: Priority) => {
    setCurrentPriority(priority)
    setNewPriorityName(priority.name)
    setIsPriorityDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm(`Are you sure you want to delete Priority ${id}?`)) {
      setPriorities(priorities.filter(priority => priority.id !== id))
      alert(`Priority ${id} deleted.`)
    }
  }
  
  const handleOpenAdd = () => {
    setCurrentPriority(null)
    setNewPriorityName("")
    setIsPriorityDialogOpen(true)
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {/* HEADER (Profile Dialog) */}
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-6 shadow-sm">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink href="/dashboard" className="text-gray-700">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                <BreadcrumbItem>
                  <BreadcrumbPage>Priority</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* PROFILE + LOGOUT - Unchanged */}
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
              onClick={handleLogout}
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
            <div className="flex items-center gap-4 mb-3 md:mb-0">
              <h1 className="text-3xl font-extrabold text-gray-700">
                Priority List
              </h1>
            </div>
            
            {/* ADD PRIORITY BUTTON */}
            <Button 
                onClick={handleOpenAdd}
                className="bg-gray-700 hover:bg-gray-800 text-white"
            >
                <Plus className="h-5 w-5 mr-2" />
                Priority
            </Button>
            
          </div>

          {/* PRIORITY TABLE */}
          <div className="bg-white shadow-xl rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-gray-700 text-white font-semibold sticky top-0">
                  {/* Pinasimpleng <tr> at <th> para maiwasan ang whitespace error */}
                  <tr>
                    <th className="p-4">Priority Name</th>
                    <th className="p-4 text-center w-[100px]">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {priorities.length > 0 ? (
                    priorities.map((priority) => (
                      // Pinasimpleng <tr> at <td> para maiwasan ang whitespace error
                      <tr key={priority.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{priority.name}</td>
                        <td className="p-4 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                className="cursor-pointer text-gray-700 hover:bg-gray-100"
                                onClick={() => handleEdit(priority)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="cursor-pointer text-red-600 hover:bg-red-50"
                                onClick={() => handleDelete(priority.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={2} className="p-6 text-center text-gray-500 italic">
                        No priorities found. Click "+ Priority" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
        </main>
        
        {/* ADD/EDIT DIALOG */}
        <Dialog 
            open={isPriorityDialogOpen} 
            onOpenChange={(open) => {
              setIsPriorityDialogOpen(open)
              if (!open) {
                setCurrentPriority(null)
                setNewPriorityName("")
              }
            }}
        >
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-gray-900">
                {currentPriority ? "Edit Priority" : "Add New Priority"}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="priorityName" className="text-right">
                  Name
                </Label>
                <Input
                  id="priorityName"
                  value={newPriorityName}
                  onChange={(e) => setNewPriorityName(e.target.value)}
                  className="col-span-3"
                  placeholder="e.g., High, Urgent"
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleSavePriority} className="bg-gray-700 hover:bg-gray-800">
                {currentPriority ? "Save Changes" : "Create Priority"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

      </SidebarInset>
    </SidebarProvider>
  )
}