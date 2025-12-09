import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { insertUnitSchema, type Unit, type InsertUnit } from "@shared/schema";
import { Plus, Pencil, Trash2, Search, Truck, Loader2 } from "lucide-react";
import { z } from "zod";

const unitFormSchema = insertUnitSchema.extend({
  plate: z.string().min(4, "La placa debe tener al menos 4 caracteres"),
  model: z.string().min(2, "El modelo es requerido"),
  brand: z.string().min(2, "La marca es requerida"),
  capacity: z.coerce.number().min(1, "La capacidad debe ser mayor a 0"),
  year: z.coerce.number().min(1990).max(new Date().getFullYear() + 1),
});

type UnitFormData = z.infer<typeof unitFormSchema>;

function UnitForm({
  unit,
  onSuccess,
}: {
  unit?: Unit;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const isEditing = !!unit;

  const form = useForm<UnitFormData>({
    resolver: zodResolver(unitFormSchema),
    defaultValues: {
      plate: unit?.plate || "",
      model: unit?.model || "",
      brand: unit?.brand || "",
      capacity: unit?.capacity || 40,
      year: unit?.year || new Date().getFullYear(),
      status: unit?.status || "disponible",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: UnitFormData) => {
      if (isEditing) {
        return apiRequest("PUT", `/api/units/${unit.id}`, data);
      }
      return apiRequest("POST", "/api/units", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: isEditing ? "Unidad actualizada" : "Unidad creada",
        description: isEditing
          ? "La unidad ha sido actualizada exitosamente"
          : "La unidad ha sido creada exitosamente",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo guardar la unidad",
        variant: "destructive",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="plate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Matrícula</FormLabel>
                <FormControl>
                  <Input placeholder="ABC-123" {...field} data-testid="input-unit-plate" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marca</FormLabel>
                <FormControl>
                  <Input placeholder="Mercedes-Benz" {...field} data-testid="input-unit-brand" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="model"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Modelo</FormLabel>
                <FormControl>
                  <Input placeholder="Sprinter 515" {...field} data-testid="input-unit-model" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="year"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Año</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="2024" {...field} data-testid="input-unit-year" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="capacity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Capacidad (pasajeros)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="40" {...field} data-testid="input-unit-capacity" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger data-testid="select-unit-status">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="disponible">Disponible</SelectItem>
                    <SelectItem value="en ruta">En Ruta</SelectItem>
                    <SelectItem value="mantenimiento">En Mantenimiento</SelectItem>
                    <SelectItem value="inactivo">Inactivo</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-end gap-2 pt-4">
          <Button type="submit" disabled={mutation.isPending} data-testid="button-save-unit">
            {mutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditing ? (
              "Actualizar Unidad"
            ) : (
              "Crear Unidad"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function UnitsPage() {
  const { isAdmin } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState<Unit | undefined>();

  const { data: units, isLoading } = useQuery<Unit[]>({
    queryKey: ["/api/units"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/units/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/units"] });
      toast({
        title: "Unidad eliminada",
        description: "La unidad ha sido eliminada exitosamente",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "No se pudo eliminar la unidad",
        variant: "destructive",
      });
    },
  });

  const filteredUnits = units?.filter((unit) => {
    const matchesSearch =
      unit.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || unit.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusColors = {
    disponible: "bg-green-500/10 text-green-600 dark:text-green-400",
    "en ruta": "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    mantenimiento: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    inactivo: "bg-red-500/10 text-red-600 dark:text-red-400",
  };

  const handleEdit = (unit: Unit) => {
    setEditingUnit(unit);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingUnit(undefined);
  };

  return (
    <div className="space-y-6" data-testid="units-page">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold" data-testid="text-units-title">
            Gestión de Flota
          </h1>
          <p className="text-muted-foreground">
            Administra los vehículos de la flota
          </p>
        </div>
        {isAdmin && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" onClick={() => setEditingUnit(undefined)} data-testid="button-new-unit">
                <Plus className="h-4 w-4" />
                Nueva Unidad
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="font-heading">
                  {editingUnit ? "Editar Unidad" : "Nueva Unidad"}
                </DialogTitle>
              </DialogHeader>
              <UnitForm unit={editingUnit} onSuccess={handleDialogClose} />
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card data-testid="card-units-filters">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar unidades..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search-units"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]" data-testid="select-filter-unit-status">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="disponible">Disponible</SelectItem>
                <SelectItem value="en ruta">En Ruta</SelectItem>
                <SelectItem value="mantenimiento">Mantenimiento</SelectItem>
                <SelectItem value="inactivo">Inactivo</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card data-testid="card-units-table">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-4 p-6">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : filteredUnits && filteredUnits.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Marca / Modelo</TableHead>
                    <TableHead>Año</TableHead>
                    <TableHead>Capacidad</TableHead>
                    <TableHead>Estado</TableHead>
                    {isAdmin && <TableHead className="text-right">Acciones</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUnits.map((unit) => (
                    <TableRow key={unit.id} data-testid={`row-unit-${unit.id}`}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                            <Truck className="h-5 w-5 text-primary" />
                          </div>
                          <span className="font-medium">{unit.plate}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {unit.brand} {unit.model}
                      </TableCell>
                      <TableCell>{unit.year}</TableCell>
                      <TableCell>{unit.capacity} pasajeros</TableCell>
                      <TableCell>
                        <Badge className={statusColors[unit.status as keyof typeof statusColors]}>
                          {unit.status}
                        </Badge>
                      </TableCell>
                      {isAdmin && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(unit)}
                              data-testid={`button-edit-unit-${unit.id}`}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteMutation.mutate(unit.id)}
                              data-testid={`button-delete-unit-${unit.id}`}
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
              <Truck className="mb-4 h-12 w-12 text-muted-foreground" />
              <h3 className="font-heading text-lg font-semibold">No hay unidades</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== "all"
                  ? "No se encontraron unidades con esos filtros"
                  : "Comienza agregando tu primera unidad"}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
