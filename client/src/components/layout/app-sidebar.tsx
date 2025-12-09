import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  Bus,
  LayoutDashboard,
  MapPin,
  Truck,
  Users,
  LogOut,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const adminMenuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Gestión de Rutas", href: "/dashboard/routes", icon: MapPin },
  { title: "Gestión de Flota", href: "/dashboard/units", icon: Truck },
  { title: "Usuarios", href: "/dashboard/users", icon: Users },
];

const driverMenuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Mis Rutas", href: "/dashboard/routes", icon: MapPin },
];

const clientMenuItems = [
  { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { title: "Ver Rutas", href: "/dashboard/routes", icon: MapPin },
];

export function AppSidebar() {
  const [location] = useLocation();
  const { user, logout, isAdmin, isDriver } = useAuth();

  const menuItems = isAdmin
    ? adminMenuItems
    : isDriver
    ? driverMenuItems
    : clientMenuItems;

  return (
    <Sidebar>
      <SidebarHeader className="border-b px-6 py-4">
        <Link href="/" className="flex items-center gap-2" data-testid="sidebar-logo">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-heading text-lg font-semibold">
            Rutas Seguras
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-4 text-xs uppercase tracking-wide">
            Navegación
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const isActive = location === item.href;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      data-testid={`sidebar-link-${item.title.toLowerCase().replace(/\s+/g, "-")}`}
                    >
                      <Link href={item.href} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <div className="mb-3 rounded-lg bg-sidebar-accent p-3">
          <p className="text-sm font-medium">{user?.name}</p>
          <p className="text-xs text-muted-foreground">{user?.email}</p>
          <p className="mt-1 text-xs capitalize text-muted-foreground">
            {user?.role}
          </p>
        </div>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={logout}
          data-testid="sidebar-logout"
        >
          <LogOut className="h-4 w-4" />
          Cerrar Sesión
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
