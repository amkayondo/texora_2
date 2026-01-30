"use client"

import * as React from "react"
import {
  MessageSquare,
  UserCircle,
  Settings,
  LogOut,
  Briefcase,
  Search,
  Coins,
  PieChart,
  TrendingUp,
  Globe,
  Wallet,
  ChevronsUpDown,
  Sun,
  Moon,
  FolderOpen,
  Plus,
} from "lucide-react"

import { useApp } from "@/AppContext"
import { UserRole } from "@/types"
import { useTheme } from "@/hooks/use-theme"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenuBadge,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Avatar,
  AvatarFallback,
} from "@/components/ui/avatar"

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  activeTab: string
  setActiveTab: (tab: string) => void
  onProjectSelect?: (projectId: string) => void
}

export function AppSidebar({ activeTab, setActiveTab, onProjectSelect, ...props }: AppSidebarProps) {
  const { currentUser, logout, projects, getInvestmentsByDonor } = useApp()
  const { theme, setTheme } = useTheme()
  const isCreator = currentUser?.role === UserRole.CREATOR

  // Get user's projects - for creators get their own projects, for donors get invested projects
  const investedProjectIds = !isCreator && currentUser ? getInvestmentsByDonor(currentUser.id).map(inv => inv.projectId) : [];
  const myProjects = projects.filter(p => 
    isCreator ? p.creatorId === currentUser?.id : investedProjectIds.includes(p.id)
  ).slice(0, 5)

  const creatorNavigation = [
    {
      title: "My Campaigns",
      icon: Briefcase,
      id: "dashboard",
    },
    {
      title: "Messages",
      icon: MessageSquare,
      id: "messages",
      badge: "3",
    },
    {
      title: "Treasury",
      icon: Coins,
      id: "wallet",
    },
  ]

  const donorNavigation = [
    {
      title: "Discover",
      icon: Search,
      id: "dashboard",
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

  const navigation = isCreator ? creatorNavigation : donorNavigation

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Header - App Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent">
              <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
                <Globe className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Texora</span>
                <span className="truncate text-xs text-muted-foreground">Web3 Funding</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activeTab === item.id}
                    onClick={() => setActiveTab(item.id)}
                    tooltip={item.title}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* User's Projects */}
        <SidebarGroup>
          <SidebarGroupLabel>
            {isCreator ? "My Projects" : "Invested Projects"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {myProjects.length > 0 ? (
                myProjects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton
                      onClick={() => {
                        setActiveTab('dashboard');
                        onProjectSelect?.(project.id);
                      }}
                      tooltip={project.title}
                    >
                      <FolderOpen className="size-4" />
                      <span className="truncate">{project.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <SidebarMenuItem>
                  <SidebarMenuButton
                    onClick={() => setActiveTab('dashboard')}
                    tooltip={isCreator ? "Create new project" : "Discover projects"}
                  >
                    <Plus className="size-4" />
                    <span>{isCreator ? "Create Project" : "Discover Projects"}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Settings */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupLabel>Account</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === 'profile'}
                  onClick={() => setActiveTab('profile')}
                  tooltip="Profile"
                >
                  <UserCircle />
                  <span>Profile</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={activeTab === 'settings'}
                  onClick={() => setActiveTab('settings')}
                  tooltip="Settings"
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              {/* Theme Toggle */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  tooltip={theme === 'dark' ? 'Light mode' : 'Dark mode'}
                >
                  {theme === 'dark' ? <Sun /> : <Moon />}
                  <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer - User Profile */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                      {currentUser?.name?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{currentUser?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      UGX {currentUser?.balance?.toLocaleString() || '0'}
                    </span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg bg-gradient-to-br from-primary to-primary/60 text-primary-foreground">
                        {currentUser?.name?.charAt(0) || 'U'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{currentUser?.name}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {isCreator ? 'Creator' : 'Investor'}
                      </span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem className="gap-2">
                    <Wallet className="size-4" />
                    <span>Balance</span>
                    <span className="ml-auto font-mono text-xs text-primary">
                      UGX {currentUser?.balance?.toLocaleString() || '0'}
                    </span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem 
                    className="gap-2"
                    onClick={() => setActiveTab('profile')}
                  >
                    <UserCircle className="size-4" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    className="gap-2"
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="size-4" />
                    Settings
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="gap-2"
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                >
                  {theme === 'dark' ? <Sun className="size-4" /> : <Moon className="size-4" />}
                  {theme === 'dark' ? 'Light Mode' : 'Dark Mode'}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="gap-2 text-destructive" onClick={logout}>
                  <LogOut className="size-4" />
                  Disconnect
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
