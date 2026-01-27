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
import { ChevronDown, Search, Plus } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateVehicleForm } from '@/components/CreateVehicleForm';

interface JoinedVehicle {
  id: string;
  make: string;
  model: string;
  license_plate?: string;
  year?: number;
  vin?: string;
  mileage?: number;
  created_at: string;
  customer: { name: string } | null;
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<JoinedVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'make' | 'model'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isNewVehicleOpen, setIsNewVehicleOpen] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id, make, model, license_plate, year, vin, mileage, created_at,
          customer:customers!inner (name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Hiba az autók betöltésekor:', error);
        return;
      }

      console.log("Nyers autók adatok a Supabase-től:", data);

      const formatted = (data ?? []).map((item) => {
        // customer tömbként érkezik (Supabase join sajátossága)
        const customerArray = item.customer as Array<{ name: string }> | null;
        const customerName = customerArray?.[0]?.name ?? 'Nincs ügyfél';

        return {
          id: item.id,
          make: item.make,
          model: item.model,
          license_plate: item.license_plate,
          year: item.year,
          vin: item.vin,
          mileage: item.mileage,
          created_at: item.created_at,
          customer: { name: customerName },
        };
      });

      setVehicles(formatted);
      setLoading(false);
    };

    fetchVehicles();
  }, []);

  const filteredVehicles = useMemo(() => {
    let result = [...vehicles];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(r => {
        return (
          r.make?.toLowerCase().includes(term) ||
          r.model?.toLowerCase().includes(term) ||
          r.license_plate?.toLowerCase().includes(term) ||
          r.customer?.name?.toLowerCase().includes(term)
        );
      });
    }

    result.sort((a, b) => {
      let valA: string | number, valB: string | number;
      if (sortBy === 'created_at') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else if (sortBy === 'make') {
        valA = a.make?.toLowerCase() || '';
        valB = b.make?.toLowerCase() || '';
      } else {
        valA = a.model?.toLowerCase() || '';
        valB = b.model?.toLowerCase() || '';
      }

      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return result;
  }, [vehicles, searchTerm, sortBy, sortOrder]);

  const handleVehicleCreated = () => {
    setIsNewVehicleOpen(false);
    const fetchAgain = async () => {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          id, make, model, license_plate, year, vin, mileage, created_at,
          customer:customers!inner (name)
        `)
        .eq('user_id', (await supabase.auth.getUser()).data.user?.id)
        .order('created_at', { ascending: false });

      if (!error) {
        const formatted = (data ?? []).map((item) => {
          const customerArray = item.customer as Array<{ name: string }> | null;
          const customerName = customerArray?.[0]?.name ?? 'Nincs ügyfél';

          return {
            id: item.id,
            make: item.make,
            model: item.model,
            license_plate: item.license_plate,
            year: item.year,
            vin: item.vin,
            mileage: item.mileage,
            created_at: item.created_at,
            customer: { name: customerName },
          };
        });
        setVehicles(formatted);
      }
    };
    fetchAgain();
  };

  return (
    <div className="p-6 lg:p-8  rounded-xl shadow">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black">Autók</h1>
        <div className="flex gap-4">
          <Dialog open={isNewVehicleOpen} onOpenChange={setIsNewVehicleOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Új autó
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-150">
              
              <CreateVehicleForm onSuccess={handleVehicleCreated} />
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
            placeholder="Keresés márka, modell, rendszám, ügyfél alapján..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Rendezés: {sortBy === 'created_at' ? 'Dátum' : sortBy === 'make' ? 'Márka' : 'Modell'}
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
            <DropdownMenuItem onClick={() => { setSortBy('make'); setSortOrder('asc'); }}>
              Márka (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('model'); setSortOrder('asc'); }}>
              Modell (A-Z)
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
                <TableHead>Márka & Modell</TableHead>
                <TableHead>Rendszám</TableHead>
                <TableHead>Évjárat</TableHead>
                <TableHead>Futott km</TableHead>
                <TableHead>Ügyfél</TableHead>
                <TableHead>Felvétel dátuma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredVehicles.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">{r.make} {r.model}</TableCell>
                  <TableCell>{r.license_plate || '-'}</TableCell>
                  <TableCell>{r.year || '-'}</TableCell>
                  <TableCell>{r.mileage ? `${r.mileage} km` : '-'}</TableCell>
                  <TableCell>{r.customer?.name ?? 'Nincs ügyfél'}</TableCell>
                  <TableCell>{new Date(r.created_at).toLocaleDateString('hu-HU')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}