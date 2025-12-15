"use client"

import { Calendar as DayPicker } from "@/components/ui/calendar"
import { SidebarGroup, SidebarGroupContent } from "@/components/ui/sidebar"

interface DatePickerProps {
  selectedDate?: Date | null
  onChange?: (date: Date | null) => void
}

export function DatePicker({ selectedDate, onChange }: DatePickerProps) {
  return (
    <SidebarGroup className="px-0">
      <SidebarGroupContent>
       <DayPicker
  mode="single"
  selected={selectedDate ?? undefined}
  onSelect={(date) => onChange?.(date ?? null)}
  className="[&_[role=gridcell].bg-accent]:bg-sidebar-primary [&_[role=gridcell].bg-accent]:text-sidebar-primary-foreground [&_[role=gridcell]]:w-[33px]"
  modifiersClassNames={{
    today: "text-black-500 rounded-full bg-gray-400" // Text grey lang, rounded number
  }}
/>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
