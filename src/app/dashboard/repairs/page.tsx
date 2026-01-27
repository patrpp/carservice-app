'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import {VisuallyHidden} from '@radix-ui/react-visually-hidden';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  ChevronDown,
  Search,
  Plus,
  Pencil,
  Trash2,
  Car,
  User,
  Wrench,
  Clock,
  Package,
  CheckCircle2,
  Receipt,
} from 'lucide-react';
import { CreateRepairForm } from '@/components/CreateRepairForm';

interface Customer {
  name: string;
}

interface JoinedRepair {
  id: string;
  description: string;
  status: string;
  created_at: string;
  vehicle: {
    make: string;
    model: string;
    license_plate?: string;
    customer: { name: string } | null;
  } | null;
}

const statusLabels: Record<string, string> = {
  pending: 'Függőben',
  in_progress: 'Folyamatban',
  diagnosed: 'Diagnosztizálva',
  waiting_parts: 'Alkatrészre vár',
  completed: 'Kész',
  invoiced: 'Számlázva',
};

const statusColors: Record<string, string> = {
  pending: 'yellow',
  in_progress: 'blue',
  diagnosed: 'purple',
  waiting_parts: 'orange',
  completed: 'green',
  invoiced: 'indigo',
};

const statusIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  pending: Clock,
  in_progress: Wrench,
  diagnosed: Search,
  waiting_parts: Package,
  completed: CheckCircle2,
  invoiced: Receipt,
};

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<JoinedRepair[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'created_at' | 'status'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isNewRepairOpen, setIsNewRepairOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<JoinedRepair | null>(null);

  const fetchRepairs = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data, error } = await supabase
    .from('repairs')
    .select(`
      id, description, status, created_at,
      vehicle:vehicles!inner (
        make, model, license_plate,
        customer:customers!inner (name)
      )
    `)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Javítások betöltése sikertelen:', error);
    return;
  }

  if (!data) {
    setRepairs([]);
    setLoading(false);
    return;
  }

  const transformedData: JoinedRepair[] = data.map((repair) => {
    // A vehicle objektum, NEM tömb (1:1 kapcsolat)
    const vehicleData = Array.isArray(repair.vehicle)
      ? repair.vehicle[0]
      : repair.vehicle;

    return {
      id: repair.id,
      description: repair.description || '',
      status: repair.status,
      created_at: repair.created_at,
      vehicle: vehicleData
        ? {
            make: vehicleData.make || '',
            model: vehicleData.model || '',
            license_plate: vehicleData.license_plate || undefined,
            customer: vehicleData.customer
              ? Array.isArray(vehicleData.customer)
                ? { name: vehicleData.customer[0]?.name || '' }
                : { name: (vehicleData.customer as Customer).name || '' }
              : null,
          }
        : null,
    };
  });

  setRepairs(transformedData);
  setLoading(false);
};

  useEffect(() => {
    fetchRepairs();
  }, []);

  const filteredRepairs = useMemo(() => {
    let result = [...repairs];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r =>
        r.description.toLowerCase().includes(term) ||
        r.vehicle?.make.toLowerCase().includes(term) ||
        r.vehicle?.model.toLowerCase().includes(term) ||
        r.vehicle?.customer?.name?.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      result = result.filter(r => r.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal =
        sortBy === 'created_at'
          ? new Date(a.created_at).getTime()
          : a.status;
      const bVal =
        sortBy === 'created_at'
          ? new Date(b.created_at).getTime()
          : b.status;

      return sortOrder === 'asc'
        ? aVal > bVal ? 1 : -1
        : aVal < bVal ? 1 : -1;
    });

    return result;
  }, [repairs, searchTerm, statusFilter, sortBy, sortOrder]);

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('repairs').delete().eq('id', id);
    if (!error) {
      setRepairs(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleStatusChange = async (repairId: string, newStatus: string) => {
    const originalRepair = repairs.find(r => r.id === repairId);
    if (!originalRepair) return;

    // Optimistic update
    setRepairs(prev =>
      prev.map(r =>
        r.id === repairId ? { ...r, status: newStatus } : r
      )
    );

    try {
      const { error } = await supabase
        .from('repairs')
        .update({
          status: newStatus,
          completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        })
        .eq('id', repairId);

      if (error) throw error;
    } catch (err) {
      console.error('Státusz frissítési hiba:', err);
      alert('Nem sikerült frissíteni az állapotot.');

      // Rollback
      setRepairs(prev =>
        prev.map(r =>
          r.id === repairId ? { ...r, status: originalRepair.status } : r
        )
      );
    }
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Javítások</h1>

        <Dialog open={isNewRepairOpen} onOpenChange={setIsNewRepairOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Új javítás
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
         <VisuallyHidden asChild>
      <DialogTitle>Új javítás hozzáadása</DialogTitle>
    </VisuallyHidden>
            </DialogHeader>
            <CreateRepairForm
              onSuccess={() => {
                setIsNewRepairOpen(false);
                setEditingRepair(null);
                fetchRepairs();
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Szűrők */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Keresés leírás, autó, ügyfél alapján..."
            className="pl-10"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full sm:w-auto">
              {statusFilter === 'all' ? 'Minden állapot' : statusLabels[statusFilter] || 'Összes'}
              <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              Összes
            </DropdownMenuItem>
            {Object.entries(statusLabels).map(([key, label]) => (
              <DropdownMenuItem key={key} onClick={() => setStatusFilter(key)}>
                {label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Táblázat */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Javítás</TableHead>
              <TableHead>Állapot</TableHead>
              <TableHead>Dátum</TableHead>
              <TableHead className="text-right">Műveletek</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {filteredRepairs.map(r => {
              const StatusIcon = statusIcons[r.status] || Clock;
              const color = statusColors[r.status] || 'gray';

              return (
                <TableRow key={r.id}>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 font-medium">
                        <Car className="h-4 w-4 text-muted-foreground" />
                        {r.vehicle?.make} {r.vehicle?.model}
                        {r.vehicle?.license_plate && (
                          <span className="text-xs text-muted-foreground">
                            • {r.vehicle.license_plate}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <User className="h-4 w-4" />
                        {r.vehicle?.customer?.name || 'Nincs ügyfél'}
                      </div>
                      <div className="text-sm text-muted-foreground italic">
                        {r.description || 'Nincs leírás'}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 px-3 gap-2 font-medium transition-colors",
                            `bg-${color}-100 hover:bg-${color}-200 text-${color}-800`
                          )}
                        >
                          <StatusIcon className="h-4 w-4" />
                          <span className="hidden sm:inline">{statusLabels[r.status] || r.status}</span>
                          <ChevronDown className="h-3.5 w-3.5 opacity-70" />
                        </Button>
                      </DropdownMenuTrigger>

                      <DropdownMenuContent align="start" className="w-56">
                        {Object.entries(statusLabels).map(([value, label]) => {
                          const Icon = statusIcons[value] || Clock;
                          const itemColor = statusColors[value] || 'gray';

                          return (
                            <DropdownMenuItem
                              key={value}
                              className={cn(
                                "flex items-center gap-2 cursor-pointer",
                                r.status === value && "bg-accent font-medium"
                              )}
                              onSelect={() => handleStatusChange(r.id, value)}
                            >
                              <Icon className={`h-4 w-4 text-${itemColor}-600`} />
                              {label}
                            </DropdownMenuItem>
                          );
                        })}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {new Date(r.created_at).toLocaleDateString('hu-HU', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </TableCell>

                  <TableCell className="text-right flex gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingRepair(r);
                        setIsNewRepairOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Biztosan törlöd?</AlertDialogTitle>
                          <AlertDialogDescription>
                            A javítás {r.description ? `"${r.description}"` : ''} véglegesen törlődik.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Mégse</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(r.id)}
                            className="bg-red-600 hover:bg-red-700"
                          >
                            Törlés
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {loading && (
        <div className="mt-8 text-center text-muted-foreground">
          Betöltés...
        </div>
      )}

      {filteredRepairs.length === 0 && !loading && (
        <div className="mt-8 text-center text-muted-foreground">
          Nincs találat a keresési feltételekre.
        </div>
      )}
    </div>
  );
}