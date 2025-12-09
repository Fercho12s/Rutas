import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { insertRouteSchema, type Route, type InsertRoute, type Unit, type User } from "@shared/schema";
import { Plus, Pencil, Trash2, Search, MapPin, Clock, Loader2 } from "lucide-react";
import { z } from "zod";

const routeFormSchema = insertRouteSchema.extend({
  title: z.string().min(3, "El título debe tener al menos 3 caracteres"),
  origin: z.string().min(2, "El origen es requerido"),
  destination: z.string().min(2, "El destino es requerido"),
  distanceKm: z.coerce.number().min(1, "La distancia debe ser mayor a 0"),
});

type RouteFormData = z.infer<typeof routeFormSchema>;

function RouteForm({
  route,
  units,
  drivers,
  onSuccess,
}: {
  route?: Route;
  units?: Unit[];
  drivers?: User[];
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEditing = !!route;

  const form = useForm<RouteFormData>({
    resolver: zodResolver(routeFormSchema),
    defaultValues: {
      title: route?.title || "",
      origin: route?.origin || "",
      destination: route?.destination || "",
      distanceKm: route?.distanceKm || 0,
      duration: route?.duration || "",
      status: route?.status || "activo",
      assignedUnitId: route?.assignedUnitId || undefined,
      assignedDriverId: route?.assignedDriverId || undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: RouteFormData) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/routes/${route.id}`, data);
      }
      return apiRequest("POST", "/api/routes", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({
        title: isEditing ? "Ruta actualizada" : "Ruta creada",
        description: isEditing
          ? "La ruta ha sido actualizada exitosamente"
          : "La ruta ha sido creada exitosamente",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la ruta",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título de la Ruta</FormLabel>
              <FormControl>
                <Input placeholder="Ruta Centro - Norte" {...field} data-testid="input-route-title" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="origin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Origen</FormLabel>
                <FormControl>
                  <Input placeholder="Terminal Central" {...field} data-testid="input-route-origin" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="destination"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Destino</FormLabel>
                <FormControl>
                  <Input placeholder="Terminal Norte" {...field} data-testid="input-route-destination" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="distanceKm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Distancia (km)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="25" {...field} data-testid="input-route-distance" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="duration"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duración Estimada</FormLabel>
                <FormControl>
                  <Input placeholder="45 min" {...field} value={field.value ?? ""} data-testid="input-route-duration" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-route-status">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="activo">Activo</SelectItem>
                    <SelectItem value="en curso">En Curso</SelectItem>
                    <SelectItem value="finalizado">Finalizado</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="assignedUnitId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidad Asignada</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                  <FormControl>
                    <SelectTrigger data-testid="select-route-unit">
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {units?.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.plate} - {unit.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="assignedDriverId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Conductor Asignado</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value ?? undefined}>
                <FormControl>
                  <SelectTrigger data-testid="select-route-driver">
                    <SelectValue placeholder="Sin asignar" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {drivers?.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-route">
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              "Actualizar Ruta"
            ) : (
              "Crear Ruta"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function RoutesPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | undefined>();

  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ["/api/routes"],
  });

  const { data: units } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const { data: users } = useQuery<User[]>({
    queryKey: ["/api/users"],
    enabled: isAdmin,
  });

  const drivers = users?.filter((u) => u.role === "conductor");

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/routes"] });
      toast({
        title: "Ruta eliminada",
        description: "La ruta ha sido eliminada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la ruta",
        variant: "destructive",
      });
    },
  });

  const filteredRoutes = routes?.filter((route) => {
    const matchesSearch =
      route.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.origin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      route.destination.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || route.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    activo: "bg-green-500/10 text-green-600 dark:text-green-400",
    "en curso": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    finalizado: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
    inactivo: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const handleEdit = (route: Route) => {
    setEditingRoute(route);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingRoute(undefined);
  };

  return (
    <div className="space-y-6" data-testid="routes-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold" data-testid="text-routes-title">
            Gestión de Rutas
          </h1>
          <p className="text-muted-foreground">
            Administra las rutas de transporte disponibles
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setEditingRoute(undefined)} data-testid="button-new-route">
                <Plus className="h-4 w-4" />
                Nueva Ruta
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading">
                  {editingRoute ? "Editar Ruta" : "Nueva Ruta"}
                </DialogTitle>
              </DialogHeader>
              <RouteForm
                route={editingRoute}
                units={units}
                drivers={drivers}
                onSuccess={handleDialogClose}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card data-testid="card-routes-filters">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar rutas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-routes"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-filter-status">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="activo">Activo</SelectItem>
                <SelectItem value="en curso">En Curso</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-routes-table">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : filteredRoutes && filteredRoutes.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Ruta</TableHead>
                    <TableHead>Origen - Destino</TableHead>
                    <TableHead>Distancia</TableHead>
                    <TableHead>Duración</TableHead>
                    <TableHead>Estado</TableHead>
                    {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoutes.map((route) => (
                    <TableRow key={route.id} data-testid={`row-route-${route.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <MapPin className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{route.title}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {route.origin} - {route.destination}
                      </TableCell>
                      <TableCell>{route.distanceKm} km</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {route.duration || "-"}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[route.status as keyof typeof statusColors]}>
                          {route.status}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(route)}
                              data-testid={`button-edit-route-${route.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(route.id)}
                              data-testid={`button-delete-route-${route.id}`}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MapPin className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="font-heading text-lg font-semibold">No hay rutas</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "No se encontraron rutas con esos filtros"
                  : "Comienza creando tu primera ruta"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
