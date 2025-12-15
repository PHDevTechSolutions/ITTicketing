"use client"

import * as React from "react"
import { Check, ChevronRight } from "lucide-react"

import { DatePicker } from "../components/date-picker"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface SidebarRightProps extends React.ComponentProps<typeof Sidebar> {
  selectedDate: Date | null
  onDateChange: (date: Date | null) => void
}

const calendarData = [
  {
    name: "",
    items: [""],
  },
]

export function SidebarRight({ selectedDate, onDateChange, ...props }: SidebarRightProps) {
  return (
    <Sidebar
      collapsible="none"
      className="sticky top-0 hidden h-svh border-l lg:flex"
      {...props}
    >
      <SidebarContent>
        {/* DatePicker */}
        <DatePicker
          selectedDate={selectedDate}
          onChange={onDateChange}
        />

        <SidebarSeparator className="mx-0" />

        {/* Calendars / Menu items */}
        {calendarData.map((calendar, index) => (
          <React.Fragment key={calendar.name}>
            <SidebarGroup className="py-0">
              <Collapsible defaultOpen={index === 0} className="group/collapsible">
                <SidebarGroupLabel
                  asChild
                  className="group/label text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground w-full text-sm"
                >
                  <CollapsibleTrigger>
                    {calendar.name}
                
                  </CollapsibleTrigger>
                </SidebarGroupLabel>

                <CollapsibleContent>
                  <SidebarGroupContent>
                    
                  </SidebarGroupContent>
                </CollapsibleContent>
              </Collapsible>
            </SidebarGroup>
          </React.Fragment>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
