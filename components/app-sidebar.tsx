import * as React from "react"
import {
  LayoutDashboard,
  MessageSquare,
  Wallet,
  UserCircle,
  Settings,
  LogOut,
  Briefcase,
  Search,
  Coins,
  PieChart,
  Users,
  TrendingUp,
  Globe,
} from "lucide-react"

import { useApp } from "@/AppContext"
import { UserRole } from "@/types"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function AppSidebar({ activeTab, setActiveTab, ...props }: AppSidebarProps) {
  const { currentUser, logout } = useApp()
  const isCreator = currentUser?.role === UserRole.CREATOR

  const creatorNavigation = [
    {
      title: "My Campaigns",
      icon: Briefcase,
      id: "dashboard",
    },
    {
      title: "Donor Inbox",
      icon: MessageSquare,
      id: "messages",
      badge: "3",
    },
    {
      title: "Treasury & Tokens",
      icon: Coins,
      id: "wallet",
    },
  ]

  const donorNavigation = [
    {
      title: "Discover Projects",
      icon: Search,
      id: "dashboard",
    },
    {
      title: "My Investments",
      icon: TrendingUp,
      id: "investments",
    },
    {
      title: "Messages",
      icon: MessageSquare,
      id: "messages",
      badge: "1",
    },
    {
      title: "Portfolio",
      icon: PieChart,
      id: "wallet",
    },
  ]

  const identityNav = [
    {
      title: isCreator ? "Creator Profile" : "Investor Profile",
      icon: UserCircle,
      id: "profile",
    },
    {
      title: "Settings",
      icon: Settings,
      id: "settings",
    },
  ]

  const navigation = isCreator ? creatorNavigation : donorNavigation

  return (
    <Sidebar className="border-r border-zinc-800 bg-zinc-950/80 backdrop-blur-xl" {...props}>
      <SidebarHeader className="border-b border-zinc-800 p-4">
        <div className="flex items-center gap-2 px-2 py-3 rounded-lg bg-zinc-900 border border-zinc-800">
          <div className="h-8 w-8 rounded bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/10">
            <Globe size={16} />
          </div>
          <div className="flex flex-col text-left">
            <span className="text-sm font-semibold text-white">Texora</span>
            <span className="text-xs text-zinc-500">Web3 Funding</span>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4">
        {/* Main Navigation */}
        <div className="mb-6">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            {isCreator ? 'Management' : 'Marketplace'}
          </h3>
          <SidebarMenu>
            {navigation.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => setActiveTab(item.id)}
                  isActive={activeTab === item.id}
                  className={`
                    group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all
                    ${activeTab === item.id
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }
                  `}
                >
                  <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                  <span className="flex-1 text-left">{item.title}</span>
                  {item.badge && (
                    <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-[10px] text-white">
                      {item.badge}
                    </span>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        <SidebarSeparator className="bg-zinc-800" />

        {/* Identity Navigation */}
        <div className="mt-6">
          <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
            Identity
          </h3>
          <SidebarMenu>
            {identityNav.map((item) => (
              <SidebarMenuItem key={item.id}>
                <SidebarMenuButton
                  onClick={() => setActiveTab(item.id)}
                  isActive={activeTab === item.id}
                  className={`
                    group flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all
                    ${activeTab === item.id
                      ? 'bg-zinc-800 text-white shadow-sm'
                      : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200'
                    }
                  `}
                >
                  <item.icon className={`h-4 w-4 ${activeTab === item.id ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-400'}`} />
                  <span className="flex-1 text-left">{item.title}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>

      <SidebarFooter className="border-t border-zinc-800 p-4">
        {/* User Profile */}
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-900 transition-colors">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-600 to-purple-600 flex items-center justify-center text-white font-bold shadow-lg">
            {currentUser?.name.charAt(0)}
          </div>
          <div className="flex flex-col overflow-hidden flex-1">
            <span className="truncate text-sm font-medium text-white">{currentUser?.name}</span>
            <span className="truncate text-xs text-zinc-500">
              {currentUser?.role === UserRole.CREATOR ? 'Creator' : 'Investor'} • UGX {currentUser?.balance.toLocaleString()}
            </span>
          </div>
          <button
            onClick={logout}
            className="text-zinc-500 hover:text-red-400 transition-colors p-1.5 rounded-md hover:bg-zinc-800"
            title="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}
