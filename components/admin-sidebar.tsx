"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BookOpen, Users, FileText, Settings, Menu, X, Home, GraduationCap, PlayCircle, Cast, AlignHorizontalDistributeCenter, Bell, Image as ImageIcon, ChevronDown, ChevronRight } from "lucide-react"

interface SidebarItemBase {
  name: string
  icon: any
  items?: SidebarItem[]
}

interface SidebarItemWithHref extends SidebarItemBase {
  href: string
  items?: never
}

interface SidebarItemWithItems extends SidebarItemBase {
  items: SidebarItem[]
  href?: never
}

type SidebarItem = SidebarItemWithHref | SidebarItemWithItems

interface SidebarProps {
  className?: string
}

const navigation: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/admin",
    icon: Home,
  },
  {
    name: "Banner",
    href: "/admin/banner",
    icon: ImageIcon,
  },
  {
    name: "Inventory",
    href: "/admin/inventory",
    icon: AlignHorizontalDistributeCenter,
  },
  {
    name: "Courses",
    href: "/admin/courses",
    icon: BookOpen,
  },
  {
    name: "Test Series",
    icon: FileText,
    items: [
      {
        name: "All Tests",
        href: "/admin/test-series",
        icon: FileText,
      },
      {
        name: "Results",
        href: "/admin/test-series/results",
        icon: FileText,
      },
    ],
  },
  {
    name: "Free Videos",
    href: "/admin/free-videos",
    icon: PlayCircle,
  },
  {
    name: "Live Classes",
    href: "/admin/live-classes",
    icon: Cast,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Notifications",
    href: "/admin/notifications",
    icon: Bell,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
]

const NavItem = ({ item, isCollapsed, level = 0 }: { item: SidebarItem; isCollapsed: boolean; level?: number }) => {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const isNested = level > 0
  const hasItems = item.items && item.items.length > 0
  const isActive = item.href ? pathname === item.href : false
  const isChildActive = hasItems && item.items?.some(child => pathname === child.href)

  const content = (
    <div 
      className={cn(
        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        (isActive || isChildActive) && !isNested ? "bg-primary/10 text-primary" : "hover:bg-accent hover:text-accent-foreground",
        isNested && "pl-8",
        isCollapsed && !isNested && "justify-center px-2"
      )}
    >
      <item.icon className={cn("h-4 w-4 flex-shrink-0", isNested ? "h-3.5 w-3.5" : "")} />
      {!isCollapsed && (
        <>
          <span className="truncate">{item.name}</span>
          {hasItems && (
            <div className="ml-auto">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </div>
          )}
        </>
      )}
    </div>
  )

  if (hasItems) {
    return (
      <div key={item.name}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full text-left"
        >
          {content}
        </button>
        {!isCollapsed && isOpen && (
          <div className="mt-1 space-y-1">
            {item.items?.map((child) => (
              <NavItem 
                key={child.name} 
                item={child} 
                isCollapsed={isCollapsed} 
                level={level + 1} 
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <Link 
      href={item.href || '#'} 
      key={item.name}
      className={cn(
        "block",
        isActive && "font-semibold"
      )}
    >
      {content}
    </Link>
  )
}

export function AdminSidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div
      className={cn(
        "flex flex-col border-r bg-sidebar transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex h-16 items-center justify-between px-4 border-b">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">LMS Admin</span>
          </div>
        )}
        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="h-8 w-8">
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-2">
          {navigation.map((item) => (
              <NavItem 
              key={item.name} 
              item={item} 
              isCollapsed={isCollapsed} 
            />
            )
          )}
        </nav>
      </ScrollArea>
    </div>
  )
}
