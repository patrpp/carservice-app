'use client';

import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
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
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { CreateCustomerForm } from '@/components/CreateCustomerForm';

interface Customer {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  created_at: string;
  vehicle_count: number;
}

interface VehicleCount {
  count: number;
}

interface SupabaseCustomerRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  created_at: string;
  vehicles: VehicleCount[] | null;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'created_at' | 'name'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isNewCustomerOpen, setIsNewCustomerOpen] = useState(false);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, name, email, phone, created_at,
          vehicles:vehicles (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Hiba az ügyfelek betöltésekor:', error);
        setLoading(false);
        return;
      }

      // Típusosan formázás
      const formatted: Customer[] = (data as SupabaseCustomerRow[] ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email ?? undefined,
        phone: item.phone ?? undefined,
        created_at: item.created_at,
        vehicle_count: item.vehicles?.[0]?.count ?? 0,
      }));

      setCustomers(formatted);
      setLoading(false);
    };

    fetchCustomers();
  }, []);

  const filteredCustomers = useMemo((): Customer[] => {
    let result = [...customers];

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter((c) => {
        return (
          c.name.toLowerCase().includes(term) ||
          (c.email?.toLowerCase().includes(term) ?? false) ||
          (c.phone?.toLowerCase().includes(term) ?? false)
        );
      });
    }

    result.sort((a, b) => {
      let valA: string | number;
      let valB: string | number;

      if (sortBy === 'created_at') {
        valA = new Date(a.created_at).getTime();
        valB = new Date(b.created_at).getTime();
      } else {
        valA = a.name.toLowerCase();
        valB = b.name.toLowerCase();
      }

      return sortOrder === 'asc' ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });

    return result;
  }, [customers, searchTerm, sortBy, sortOrder]);

  const handleCustomerCreated = () => {
    setIsNewCustomerOpen(false);

    const fetchAgain = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('customers')
        .select(`
          id, name, email, phone, created_at,
          vehicles:vehicles (count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Frissítés sikertelen:', error);
        return;
      }

      const formatted: Customer[] = (data as SupabaseCustomerRow[] ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        email: item.email ?? undefined,
        phone: item.phone ?? undefined,
        created_at: item.created_at,
        vehicle_count: item.vehicles?.[0]?.count ?? 0,
      }));

      setCustomers(formatted);
    };

    fetchAgain();
  };

  return (
    <div className="p-6 lg:p-8 rounded-xl shadow">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-black dark:text-white">Ügyfelek</h1>
        <div className="flex gap-4">
         <Dialog open={isNewCustomerOpen} onOpenChange={setIsNewCustomerOpen}>
  <DialogTrigger asChild>
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      Új ügyfél
    </Button>
  </DialogTrigger>
  <DialogContent className="sm:max-w-lg">
    <DialogHeader>
      <VisuallyHidden asChild>
        <DialogTitle>Új ügyfél hozzáadása</DialogTitle>
      </VisuallyHidden>
    </DialogHeader>
    <CreateCustomerForm onSuccess={handleCustomerCreated} />
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
            placeholder="Keresés név, email, telefon alapján..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              Rendezés: {sortBy === 'created_at' ? 'Dátum' : 'Név'}
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
            <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('asc'); }}>
              Név (A-Z)
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => { setSortBy('name'); setSortOrder('desc'); }}>
              Név (Z-A)
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
                <TableHead>Név</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Autók száma</TableHead>
                <TableHead>Felvétel dátuma</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCustomers.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-medium">{c.name}</TableCell>
                  <TableCell>{c.email || '-'}</TableCell>
                  <TableCell>{c.phone || '-'}</TableCell>
                  <TableCell>{c.vehicle_count}</TableCell>
                  <TableCell>{new Date(c.created_at).toLocaleDateString('hu-HU')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}