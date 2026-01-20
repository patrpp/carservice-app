'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { CreateRepairForm } from '@/components/CreateRepairForm';
import { CreateVehicleForm } from '@/components/CreateVehicleForm';
import { CreateCustomerForm } from '@/components/CreateCustomerForm';
import { RepairCard } from '@/components/RepairCard';
import Link from 'next/link';
import { JoinedRepair } from '@/types';


export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [repairs, setRepairs] = useState<JoinedRepair[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        console.log("Bejelentkezett user ID:", user.id);
        const { data, error } = await supabase
          .from('repairs')
          .select(`
            id, description, status, created_at, vehicle_id, user_id,
            vehicle:vehicles!inner (
              id, make, model, license_plate,
              customer:customers!inner (name)
            )
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Javítások betöltése sikertelen:', error);
          setError('Nem sikerült betölteni a javításokat - részletek a konzolon');
          return;
        }

        console.log("Nyers javítás adatok (Supabase-től):", data);
        const formattedRepairs: JoinedRepair[] = (data ?? []).map((item) => {
  const vehicle = item.vehicle as unknown as {
    id: string;          
    make: string;
    model: string;
    license_plate?: string;
    customer: { name: string } | null;
  } | null;

  return {
    id: item.id,
    description: item.description,
    status: item.status,
    created_at: item.created_at,
    vehicle_id: item.vehicle_id,   
    user_id: item.user_id,        
    vehicle: vehicle ? {
      id: vehicle.id,              
      make: vehicle.make,
      model: vehicle.model,
      license_plate: vehicle.license_plate,
      customer: vehicle.customer ? { name: vehicle.customer.name } : null,
    } : null,
  };
});

        console.log("Formázott repairs lista:", formattedRepairs);
        setRepairs(formattedRepairs);
      }
      setLoading(false);
    };

    fetchData();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const refreshRepairs = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from('repairs')
      .select(`
        id, description, status, created_at, vehicle_id, user_id,
        vehicle:vehicles!inner (
          id, make, model, license_plate,
          customer:customers!inner (name)
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Frissítés sikertelen:', error);
      return;
    }

    console.log("Frissített nyers adatok:", data);

 const formattedRepairs: JoinedRepair[] = (data ?? []).map((item) => {
  const vehicle = item.vehicle as unknown as {
    id: string;           
    make: string;
    model: string;
    license_plate?: string;
    customer: { name: string } | null;
  } | null;

  return {
    id: item.id,
    description: item.description,
    status: item.status,
    created_at: item.created_at,
    vehicle_id: item.vehicle_id,   
    user_id: item.user_id,         
    vehicle: vehicle ? {
      id: vehicle.id,              
      make: vehicle.make,
      model: vehicle.model,
      license_plate: vehicle.license_plate,
      customer: vehicle.customer ? { name: vehicle.customer.name } : null,
    } : null,
  };
});

    setRepairs(formattedRepairs);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Betöltés...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8">
        <p>Nincs bejelentkezve felhasználó.</p>
        <Link href="/" className="px-6 py-3 bg-blue-600 text-white rounded-lg">
          Vissza a bejelentkezéshez
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-6xl mx-auto p-8">

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-center">
          {error}
        </div>
      )}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
  {repairs.map((repair) => (
   <RepairCard
  key={repair.id}
  repair={repair}
  onStatusChange={(newStatus) => {
    // 1. Lokális frissítés 
    setRepairs((prev) =>
      prev.map((r) =>
        r.id === repair.id
          ? { ...r, status: newStatus as JoinedRepair['status'] }  
          : { ...r }                    
      )
    );

    // 2. Supabase update háttérben
    (async () => {
      try {
        const { error } = await supabase
          .from('repairs')
          .update({
            status: newStatus as JoinedRepair['status'],
            completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
          })
          .eq('id', repair.id);

        if (error) throw error;
      } catch (err) {
        console.error("Státusz hiba:", err);
        alert("Nem sikerült frissíteni az állapotot");

      
        setRepairs((prev) =>
          prev.map((r) =>
            r.id === repair.id
              ? { ...r, status: repair.status } 
              : { ...r }
          )
        );
      }
    })();
  }}
/>
  ))}
</div>

        {/* Új űrlapok */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold mb-4"></h3>
            <CreateRepairForm onSuccess={refreshRepairs} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4"></h3>
            <CreateCustomerForm onSuccess={refreshRepairs} />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-4"></h3>
            <CreateVehicleForm onSuccess={refreshRepairs} />
          </div>
        </div>
      </div>
    </div>
  );
}
