"use client"

import * as React from "react"
import { ArchiveX, Command, File, Inbox, Trash2 } from "lucide-react"

import { NavUser } from "@/app/components/nav-user"
import { Label } from "@/components/ui/label"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarHeader,
    SidebarInput,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    useSidebar,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"

export const data = {

    navMain: [
        { title: "Inbox", url: "#", icon: Inbox },
        { title: "Create Concern", url: "#", icon: Command },
        { title: "Open Tickets", url: "#", icon: File },
        { title: "Pending Tickets", url: "#", icon: File },
        { title: "Closed Tickets", url: "#", icon: ArchiveX },
    ],

    navBottom: [
        { title: "Trash", url: "#", icon: Trash2 },
    ],

    mails: [], // Inbox empty by default
}

// Mail type with ticket info
export type Mail = {
  name: string
  email: string
  subject: string
  date: string
  teaser: string
  ticketNumber?: string
  priority?: "High" | "Medium" | "Low"
  department?: string
  type?: string
  remarks?: string
}

export type NavItem = typeof data.navMain[0] | typeof data.navBottom[0]

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    activeItem: NavItem
    setActiveItem: React.Dispatch<React.SetStateAction<NavItem>>
    selectedMail: Mail | null
    setSelectedMail: React.Dispatch<React.SetStateAction<Mail | null>>
    sentConcerns: Mail[]
    setSentConcerns: React.Dispatch<React.SetStateAction<Mail[]>>
}

export function AppSidebar({
    activeItem,
    setActiveItem,
    selectedMail,
    setSelectedMail,
    sentConcerns,
    setSentConcerns,
    ...props
}: AppSidebarProps) {
    const { setOpen } = useSidebar()
    const [mails, setMails] = React.useState<Mail[]>(data.mails)

    const isCreateConcern = activeItem.title === "Create Concern"
    const showSecondSidebar = activeItem.title === "Inbox" // only Inbox shows second sidebar

    const handleNavClick = (item: NavItem) => {
        setActiveItem(item)
        setSelectedMail(null)

        if (item.title === "Inbox") {
            setMails(data.mails)
        } else {
            setMails([])
        }

        setOpen(true)
    }

    const handleMailClick = (mail: Mail) => {
        setSelectedMail(mail)
    }

    return (
        <Sidebar
            className="overflow-hidden *:data-[sidebar=sidebar]:flex-row"
            {...props}
        >
            {/* Primary Sidebar */}
            <Sidebar collapsible="none" className="w-[var(--sidebar-width)] border-r">
                <SidebarHeader className="gap-3.5 border-b p-4">
                    <SidebarMenu>
                        <SidebarMenuItem>
                            <SidebarMenuButton size="lg" asChild>
                                <a href="#">
                                    <img
                                        src="https://disruptivesolutionsinc.com/wp-content/uploads/2025/08/DISRUPTIVE-LOGO-red-scaled.png"
                                        alt="Company Logo"
                                        className="w-full h-full object-cover"
                                    />
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    </SidebarMenu>
                </SidebarHeader>

                <SidebarContent>
                    <SidebarGroup>
                        <SidebarGroupContent className="px-3">
                            <SidebarMenu>
                                {data.navMain.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            onClick={() => handleNavClick(item)}
                                            isActive={activeItem?.title === item.title}
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>

                    <div className="border-t my-2"></div>

                    <SidebarGroup>
                        <SidebarGroupContent className="px-3">
                            <SidebarMenu>
                                {data.navBottom.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        <SidebarMenuButton
                                            onClick={() => handleNavClick(item)}
                                            isActive={activeItem?.title === item.title}
                                        >
                                            <item.icon />
                                            <span>{item.title}</span>
                                        </SidebarMenuButton>
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                </SidebarContent>
            </Sidebar>

            {/* Second Sidebar: ONLY shows for Inbox */}
            {showSecondSidebar && (
                <Sidebar collapsible="none" className="w-[400px] border-r">
                    <SidebarHeader className="gap-3.5 border-b p-4">
                        <div className="flex w-full items-center justify-between">
                            <div className="text-foreground text-base font-medium">{activeItem?.title}</div>
                            <Label className="flex items-center gap-2 text-sm">
                                <span>Unreads</span>
                                <Switch className="shadow-none" />
                            </Label>
                        </div>
                        <SidebarInput placeholder="Type to search..." />
                    </SidebarHeader>

                    <SidebarContent>
                        <SidebarGroup className="px-0">
                            <SidebarGroupContent>
                                {mails.length === 0 && (
                                    <p className="text-sm text-gray-500 p-4">No items found.</p>
                                )}
                                {mails.map((mail, index) => (
                                    <a
                                        href="#"
                                        key={mail.ticketNumber || `${mail.email}-${mail.date}-${index}`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            handleMailClick(mail)
                                        }}
                                        className={`hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex flex-col items-start gap-2 border-b p-4 text-sm leading-tight whitespace-nowrap last:border-b-0
                                        ${selectedMail?.ticketNumber === mail.ticketNumber ? 'bg-accent font-semibold text-accent-foreground' : ''}`}
                                    >
                                        <div className="flex w-full items-center justify-between">
                                            <span className="font-semibold">{mail.name}</span>
                                            {mail.priority && (
                                                <span
                                                    className={`text-xs px-2 py-0.5 rounded-full 
                                                    ${mail.priority === 'High' ? 'bg-red-100 text-red-600' : ''}
                                                    ${mail.priority === 'Medium' ? 'bg-yellow-100 text-yellow-600' : ''}
                                                    ${mail.priority === 'Low' ? 'bg-green-100 text-green-600' : ''}`}
                                                >
                                                    {mail.priority}
                                                </span>
                                            )}
                                        </div>

                                        <p className="text-xs text-muted-foreground">{mail.email}</p>
                                        <p className="text-sm font-medium">{mail.subject}</p>
                                        <p className="text-xs text-muted-foreground line-clamp-2">{mail.teaser}</p>

                                        <div className="flex justify-between w-full mt-1">
                                            {mail.ticketNumber && (
                                                <span className="text-xs text-gray-400">{mail.ticketNumber}</span>
                                            )}
                                            <span className="text-xs text-gray-500">{mail.date}</span>
                                        </div>
                                    </a>
                                ))}
                            </SidebarGroupContent>
                        </SidebarGroup>
                    </SidebarContent>
                </Sidebar>
            )}
        </Sidebar>
    )
}
