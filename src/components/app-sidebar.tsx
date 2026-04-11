"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Activity,
  FileText,
  BookOpen,
  FolderKanban,
  Tag,
  Link2,
  BarChart3,
  CalendarClock,
  Newspaper,
  Shield,
  Home,
  CheckCircle2,
  TrendingUp,
  Wallet,
  Calendar,
  Clock,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { TokenUsageIndicator } from "@/components/token-usage-indicator";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavGroup = {
  label: string;
  items: NavItem[];
};

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Workspace",
    items: [
      { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { title: "Calendar", href: "/calendar", icon: Calendar },
      { title: "Deadlines", href: "/deadlines", icon: Clock },
    ],
  },
  {
    label: "Knowledge",
    items: [
      { title: "Notes", href: "/notes", icon: FileText },
      { title: "Papers", href: "/papers", icon: BookOpen },
      { title: "Projects", href: "/projects", icon: FolderKanban },
      { title: "Tags", href: "/tags", icon: Tag },
      { title: "Links", href: "/links", icon: Link2 },
      { title: "Blog", href: "/blog", icon: Newspaper },
    ],
  },
  {
    label: "Insights",
    items: [
      { title: "Trends", href: "/trends", icon: TrendingUp },
      { title: "Finance", href: "/finance", icon: Wallet },
      { title: "Statistics", href: "/statistics", icon: BarChart3 },
    ],
  },
  {
    label: "System",
    items: [
      { title: "Command", href: "/command", icon: Activity },
      { title: "Review", href: "/review", icon: CheckCircle2 },
      { title: "Admin", href: "/admin", icon: Shield },
    ],
  },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

export function AppSidebar() {
  const pathname = usePathname() ?? "/";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link
          href="/"
          aria-label="Go to home"
          className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-sidebar-accent transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-accent text-sidebar-primary-foreground font-bold shadow-sm shadow-primary/30">
            M
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-bold leading-tight">Minhan Bae</span>
            <span className="text-xs text-sidebar-foreground/60 leading-tight">
              Workspace
            </span>
          </div>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {NAV_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(pathname, item.href);
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        render={<Link href={item.href} />}
                        isActive={active}
                        tooltip={item.title}
                      >
                        <Icon className="size-4" />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center justify-between gap-2 px-2 py-1.5 group-data-[collapsible=icon]:hidden">
          <ThemeSwitcher />
          <TokenUsageIndicator />
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
