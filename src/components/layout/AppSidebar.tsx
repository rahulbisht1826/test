import {
  LayoutDashboard,
  UtensilsCrossed,
  Receipt,
  Settings,
  Hotel,
  BookOpen,
  BarChart3,
  LogOut,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Tables", url: "/tables", icon: UtensilsCrossed },
  { title: "Menu", url: "/menu", icon: BookOpen },
  { title: "Orders", url: "/orders", icon: Receipt },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Settings", url: "/settings", icon: Settings },
];

import { usePOS } from "@/context/POSContext";

// ... (keep imports)

export function AppSidebar() {
  const { settings } = usePOS();

  return (
    <Sidebar className="border-r-0">
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          {settings.logo ? (
            <img src={settings.logo} alt="Logo" className="h-10 w-10 rounded-lg object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sidebar-primary">
              <Hotel className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
          )}
          <div>
            <h1
              className="text-lg font-semibold truncate max-w-[150px]"
              title={settings.name}
              style={{ color: settings.nameColor }}
            >
              {settings.name}
            </h1>
            <p className="text-xs text-sidebar-foreground/60">Billing System</p>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent className="px-3">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="h-11">
                    <NavLink
                      to={item.url}
                      end={item.url === "/"}
                      className="group flex items-center gap-3 rounded-lg px-3 py-2 text-sidebar-foreground/70 transition-all duration-200 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-foreground hover:translate-x-1"
                      activeClassName="bg-primary text-secondary-foreground font-medium shadow-md hover:bg-primary/90 hover:translate-x-1"
                    >
                      <item.icon className="h-5 w-5 transition-transform duration-200 group-hover:scale-110" />
                      <span className="font-medium">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
