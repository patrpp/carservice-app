'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
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
import { ChevronDown, Search, Plus, Pencil, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CreateRepairForm } from '@/components/CreateRepairForm';


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

export default function RepairsPage() {
  const [repairs, setRepairs] = useState<JoinedRepair[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'status' | 'description'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isNewRepairOpen, setIsNewRepairOpen] = useState(false);
  const [editingRepair, setEditingRepair] = useState<JoinedRepair | null>(null);

  useEffect(() => {
    const fetchRepairs = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('repairs')
        .select(`
          id, description, status, created_at,
          vehicle:vehicles!inner (
            id, make, model, license_plate,
            customer:customers!inner (name)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Hiba:', error);
        return;
      }

      console.log("Nyers adatok a Supabase-től:", data);

      const formatted = (data ?? []).map((item) => {
        const vehicle = item.vehicle as unknown as {
          id: string;
          make: string;
          model: string;
          license_plate?: string;
          customer: { name: string } | { name: string }[] | null;
        } | null;

        let customerName = 'Nincs ügyfél';
        if (vehicle?.customer) {
          if (Array.isArray(vehicle.customer)) {
            customerName = vehicle.customer[0]?.name ?? 'Nincs ügyfél';
          } else if (typeof vehicle.customer === 'object' && vehicle.customer !== null) {
            customerName = vehicle.customer.name ?? 'Nincs ügyfél';
          }
        }

        return {
          id: item.id,
          description: item.description,
          status: item.status,
          created_at: item.created_at,
          vehicle: vehicle ? {
            make: vehicle.make,
            model: vehicle.model,
            license_plate: vehicle.license_plate,
            customer: { name: customerName },
          } : null,
        };
      });

      setRepairs(formatted);
      setLoading(false);
    };

    fetchRepairs();
  }, []);

  const filteredRepairs = useMemo(() => {
    let result = [...repairs];
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => {
        return (
          r.description?.toLowerCase().includes(term) ||
          r.vehicle?.make?.toLowerCase().includes(term) ||
          r.vehicle?.model?.toLowerCase().includes(term) ||
          r.vehicle?.customer?.name?.toLowerCase().includes(term)
        );
      });
    }

    result.sort((a, b) => {
      const valA = sortBy === 'created_at' ? new Date(a.created_at).getTime() : 
                 sortBy === 'status' ? a.status : a.description?.toLowerCase() || '';
      const valB = sortBy === 'created_at' ? new Date(b.created_at).getTime() : 
                 sortBy === 'status' ? b.status : b.description?.toLowerCase() || '';
      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return result;
  }, [repairs, searchTerm, sortBy, sortOrder]);

  const handleRepairCreated = () => {
    setIsNewRepairOpen(false);
    setEditingRepair(null);
    fetchRepairs(); // frissítés a lista betöltéséhez
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from('repairs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Törlési hiba:', error);
      alert('Nem sikerült törölni a javítást');
      return;
    }

    // Frissítsd a listát
    setRepairs(prev => prev.filter(r => r.id !== id));
  };

  const fetchRepairs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('repairs')
      .select(`
        id, description, status, created_at,
        vehicle:vehicles!inner (
          id, make, model, license_plate,
          customer:customers!inner (name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Hiba:', error);
      return;
    }

    const formatted = (data ?? []).map((item) => {
      const vehicle = item.vehicle as unknown as {
        id: string;
        make: string;
        model: string;
        license_plate?: string;
        customer: { name: string } | { name: string }[] | null;
      } | null;

      let customerName = 'Nincs ügyfél';
      if (vehicle?.customer) {
        if (Array.isArray(vehicle.customer)) {
          customerName = vehicle.customer[0]?.name ?? 'Nincs ügyfél';
        } else if (typeof vehicle.customer === 'object' && vehicle.customer !== null) {
          customerName = vehicle.customer.name ?? 'Nincs ügyfél';
        }
      }

      return {
        id: item.id,
        description: item.description,
        status: item.status,
        created_at: item.created_at,
        vehicle: vehicle ? {
          make: vehicle.make,
          model: vehicle.model,
          license_plate: vehicle.license_plate,
          customer: { name: customerName },
        } : null,
      };
    });

    setRepairs(formatted);
    setLoading(false);
  };

  return (
    <div className="p-6 lg:p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">Javítások</h1>
        <div className="flex gap-4">
          <Dialog open={isNewRepairOpen} onOpenChange={setIsNewRepairOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Új javítás
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-150">
              <DialogHeader>
                <DialogTitle>{editingRepair ? 'Javítás szerkesztése' : 'Új javítás hozzáadása'}</DialogTitle>
              </DialogHeader>
              <CreateRepairForm 
                onSuccess={handleRepairCreated}
                defaultValues={editingRepair ? {
                  id: editingRepair.id,
                  description: editingRepair.description,
                  status: editingRepair.status,
                  vehicle_id: editingRepair.vehicle ? 'valami_id' : '', // ha van vehicle_id, töltsd be
                } : undefined}
              />
            </DialogContent>
          </Dialog>

          <Link href="/dashboard">
            <Button variant="outline">Vissza a dashboardra</Button>
          </Link>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Keresés leírás, autó, ügyfél alapján..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Rendezés: {sortBy === 'created_at' ? 'Dátum' : sortBy === 'status' ? 'Állapot' : 'Leírás'}
              <ChevronDown className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => { setSortBy('created_at'); setSortOrder('desc'); }}>
              Dátum (legújabb elöl)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('created_at'); setSortOrder('asc'); }}>
              Dátum (legrégebbi elöl)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('status'); setSortOrder('asc'); }}>
              Állapot (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('description'); setSortOrder('asc'); }}>
              Leírás (A-Z)
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <p>Betöltés...</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Autó</TableHead>
                <TableHead>Ügyfél</TableHead>
                <TableHead>Leírás</TableHead>
                <TableHead>Státusz</TableHead>
                <TableHead>Dátum</TableHead>
                <TableHead>Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRepairs.map(r => (
                <TableRow key={r.id}>
                  <TableCell>{r.vehicle ? `${r.vehicle.make} ${r.vehicle.model}` : 'Nincs'}</TableCell>
                  <TableCell>{r.vehicle?.customer?.name ?? 'Nincs ügyfél'}</TableCell>
                  <TableCell>{r.description}</TableCell>
                  <TableCell>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      statusColors[r.status] ? `bg-${statusColors[r.status]}-100 text-${statusColors[r.status]}-800` : 'bg-gray-100 text-gray-800'
                    }`}>
                      {statusLabels[r.status] || r.status}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString('hu-HU')}</TableCell>
                  <TableCell className="flex gap-2">
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
                          <AlertDialogTitle>Biztosan törölni szeretnéd?</AlertDialogTitle>
                          <AlertDialogDescription>
                           A  &apos;{r.description}&apos; javítás véglegesen törlődik.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Mégse</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(r.id)} className="bg-red-600 hover:bg-red-700">
                            Törlés
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
