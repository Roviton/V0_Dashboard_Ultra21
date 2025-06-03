import { LayoutDashboard, Settings, User, Bot } from "lucide-react"

import { MainNav } from "@/components/main-nav"
import { SidebarNavItem } from "@/components/sidebar-nav"

interface SidebarProps {
  items: SidebarNavItem[]
}

export function Sidebar({ items }: SidebarProps) {
  return (
    <div className="flex h-full max-w-[280px] flex-col border-r bg-secondary">
      <div className="flex-1 space-y-2 p-6">
        <MainNav className="px-3" />
        <ul className="mt-6 space-y-1">
          {items.map((item) => (
            <li key={item.href}>
              <SidebarNavItem item={item} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const navigationItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "AI Test",
    href: "/dashboard/ai-test",
    icon: Bot,
    roles: ["admin", "manager"], // Only show to admins and managers for testing
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
  {
    title: "Profile",
    href: "/dashboard/profile",
    icon: User,
  },
]

export function DashboardSidebar() {
  return <Sidebar items={navigationItems} />
}
