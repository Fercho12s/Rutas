import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/lib/auth-context";
import { useQuery } from "@tanstack/react-query";
import {
  MapPin,
  Truck,
  Users,
  Clock,
  ArrowRight,
  TrendingUp,
  Activity,
} from "lucide-react";
import { Link } from "wouter";
import type { Route, Unit, User } from "@shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
}: {
  title: string;
  value: string | number;
  icon: typeof MapPin;
  trend?: "up" | "down";
  trendValue?: string;
}) {
  return (
    <Card data-testid={`stat-card-${title.toLowerCase().replace(/\s+/g, "-")}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          {trend && trendValue && (
            <Badge variant={trend === "up" ? "default" : "secondary"} className="gap-1">
              <TrendingUp className={`h-3 w-3 ${trend === "down" ? "rotate-180" : ""}`} />
              {trendValue}
            </Badge>
          )}
        </div>
        <div className="mt-4">
          <p className="font-heading text-3xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}

function RecentRouteCard({ route }: { route: Route }) {
  const statusColors = {
    activo: "bg-green-500/10 text-green-600 dark:text-green-400",
    "en curso": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    finalizado: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    inactivo: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  return (
    <div className="flex items-center gap-4 rounded-lg border p-4" data-testid={`route-card-${route.id}`}>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
        <MapPin className="h-5 w-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium truncate">{route.title}</p>
        <p className="text-sm text-muted-foreground truncate">
          {route.origin} - {route.destination}
        </p>
      </div>
      <Badge className={statusColors[route.status as keyof typeof statusColors] || statusColors.activo}>
        {route.status}
      </Badge>
    </div>
  );
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth();

  const { data: routes, isLoading: routesLoading } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  const { data: units, isLoading: unitsLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin,
  });

  const activeRoutes = routes?.filter((r) => r.status === "activo" || r.status === "en curso").length || 0;
  const availableUnits = units?.filter((u) => u.status === "disponible").length || 0;
  const totalUsers = users?.length || 0;
  const recentRoutes = routes?.slice(0, 5) || [];

  return (
    <div className="space-y-6" data-testid="dashboard-content">
      <div>
        <h1 className="font-heading text-3xl font-bold" data-testid="text-dashboard-title">
          ¡Bienvenido, {user?.name}!
        </h1>
        <p className="text-muted-foreground">
          Aquí tienes un resumen de la actividad del sistema
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {routesLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatCard
            title="Rutas Activas"
            value={activeRoutes}
            icon={MapPin}
            trend="up"
            trendValue="+12%"
          />
        )}
        {unitsLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatCard
            title="Unidades Disponibles"
            value={availableUnits}
            icon={Truck}
          />
        )}
        {usersLoading ? (
          <Skeleton className="h-32" />
        ) : (
          <StatCard
            title="Total Usuarios"
            value={totalUsers}
            icon={Users}
            trend="up"
            trendValue="+5%"
          />
        )}
        <StatCard
          title="Viajes Hoy"
          value={Math.floor(Math.random() * 50) + 20}
          icon={Activity}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card data-testid="card-recent-routes">
          <CardHeader className="flex flex-row items-center justify-between gap-4">
            <CardTitle className="font-heading">Rutas Recientes</CardTitle>
            <Link href="/dashboard/routes">
              <Button variant="ghost" size="sm" className="gap-1" data-testid="button-view-all-routes">
                Ver todas
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-4">
            {routesLoading ? (
              <>
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
                <Skeleton className="h-16" />
              </>
            ) : recentRoutes.length > 0 ? (
              recentRoutes.map((route) => (
                <RecentRouteCard key={route.id} route={route} />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <MapPin className="mb-2 h-10 w-10 text-muted-foreground" />
                <p className="text-muted-foreground">No hay rutas disponibles</p>
                {isAdmin && (
                  <Link href="/dashboard/routes">
                    <Button className="mt-4" data-testid="button-create-first-route">
                      Crear Primera Ruta
                    </Button>
                  </Link>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card data-testid="card-quick-actions">
          <CardHeader>
            <CardTitle className="font-heading">Acciones Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href="/dashboard/routes" className="block">
              <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-quick-routes">
                <MapPin className="h-5 w-5" />
                <span>Gestionar Rutas</span>
              </Button>
            </Link>
            {isAdmin && (
              <>
                <Link href="/dashboard/units" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-quick-units">
                    <Truck className="h-5 w-5" />
                    <span>Gestionar Flota</span>
                  </Button>
                </Link>
                <Link href="/dashboard/users" className="block">
                  <Button variant="outline" className="w-full justify-start gap-3" data-testid="button-quick-users">
                    <Users className="h-5 w-5" />
                    <span>Gestionar Usuarios</span>
                  </Button>
                </Link>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2" data-testid="card-schedule">
          <CardHeader>
            <CardTitle className="font-heading">Próximos Horarios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {routes?.slice(0, 6).map((route) => (
                <div
                  key={route.id}
                  className="flex items-center gap-3 rounded-lg border p-3"
                  data-testid={`schedule-item-${route.id}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate text-sm">{route.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {route.schedule && route.schedule.length > 0
                        ? `${route.schedule[0].day} - ${route.schedule[0].time}`
                        : "Sin horario"}
                    </p>
                  </div>
                </div>
              ))}
              {(!routes || routes.length === 0) && (
                <div className="col-span-full flex flex-col items-center justify-center py-8 text-center">
                  <Clock className="mb-2 h-10 w-10 text-muted-foreground" />
                  <p className="text-muted-foreground">No hay horarios programados</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
