import { Link, useRouterState } from '@tanstack/react-router'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from '#/components/ui/sidebar'
import { LayoutDashboard, ClipboardList, Users, ScrollText, Inbox } from 'lucide-react'

const navItems = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/roster', icon: ClipboardList, label: 'Roster' },
  { to: '/admin/sessions', icon: Users, label: 'Sessions' },
  { to: '/admin/audit', icon: ScrollText, label: 'Audit' },
]

export function AppSidebar() {
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-3">
          <Inbox className="w-6 h-6 text-primary-600 shrink-0" />
          <span className="font-semibold text-lg group-data-[collapsible=icon]:hidden whitespace-nowrap">
            InOut Admin
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={
                      item.to === '/admin'
                        ? currentPath === '/admin'
                        : currentPath.startsWith(item.to)
                    }
                    tooltip={item.label}
                  >
                    <Link to={item.to}>
                      <item.icon />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-2 text-xs text-neutral-400 group-data-[collapsible=icon]:hidden">
          InOut v1.0
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
