'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import { CreateRepairForm } from '@/components/CreateRepairForm';
import { CreateVehicleForm } from '@/components/CreateVehicleForm';
import { CreateCustomerForm } from '@/components/CreateCustomerForm';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

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
            id, description, status, created_at,
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
  // A vehicle most objektum (nem tömb), mert 1:1 join
  const vehicle = item.vehicle as unknown as {
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
    vehicle: vehicle ? {
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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  const refreshRepairs = async () => {
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
      console.error('Frissítés sikertelen:', error);
      return;
    }

    console.log("Frissített nyers adatok:", data);

    const formattedRepairs: JoinedRepair[] = (data ?? []).map((item) => {
      const vehicleArray = item.vehicle as Array<{
        id: string;
        make: string;
        model: string;
        license_plate?: string;
        customer: Array<{ name: string }> | null;
      }> | null;

      const vehicleItem = vehicleArray && vehicleArray.length > 0 ? vehicleArray[0] : null;

      const customerArray = vehicleItem?.customer as Array<{ name: string }> | null;
      const customer = customerArray && customerArray.length > 0 ? customerArray[0] : null;

      return {
        id: item.id,
        description: item.description,
        status: item.status,
        created_at: item.created_at,
        vehicle: vehicleItem
          ? {
              make: vehicleItem.make,
              model: vehicleItem.model,
              license_plate: vehicleItem.license_plate,
              customer: customer ? { name: customer.name } : null,
            }
          : null,
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        {/* Fejléc */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-black">Műhely Dashboard</h1>
          <div className="flex items-center gap-6">
            <span className="text-lg text-black">
              Bejelentkezve: <strong>{user.email}</strong>
            </span>
            <Button variant="destructive" onClick={handleSignOut}>
              Kijelentkezés
            </Button>
          </div>
        </div>
  <nav className="flex gap-8 mb-12 text-lg font-medium">
          <Link href="/dashboard/repairs" className="text-black hover:underline">Javítások</Link>
          <Link href="/dashboard/customers" className="text-black hover:underline">Ügyfelek</Link>
          <Link href="/dashboard/vehicles" className="text-black hover:underline">Autók</Link>
        </nav>

        {/* Javítások listája */}
        <div>
          <h2 className="text-2xl font-bold text-black mb-6">Javítási feladatok</h2>

          {error && (
            <div className="p-4 mb-6 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          {repairs.length === 0 ? (
            <div className="bg-white rounded-xl shadow p-12 text-center">
              <p className="text-xl text-gray-600">
                Még nincs javítási feladat.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {repairs.map((repair) => (
                <div
                  key={repair.id}
                  className="bg-white rounded-xl shadow p-6 hover:shadow-md transition"
                >
                  <h3 className="text-xl font-semibold text-black mb-2">
                    <p className="text-black mb-4">{repair.description}</p>
                    {repair.vehicle ? (
                      <>
                        {repair.vehicle.make} {repair.vehicle.model}
                        {repair.vehicle.license_plate && ` - ${repair.vehicle.license_plate}`}
                      </>
                    ) : (
                      'Nincs hozzárendelt autó'
                    )}
                  </h3>
                  <p className="text-sm text-black mb-3">
                    Ügyfél: <strong>{repair.vehicle?.customer?.name ?? 'Nincs ügyfél'}</strong>
                  </p>
                  

                  {/* Státusz badge */}
                  <div className="hidden">
  bg-yellow-100 text-yellow-800 border-yellow-400 hover:bg-yellow-50 hover:border-yellow-300
  bg-blue-100 text-blue-800 border-blue-400 hover:bg-blue-50 hover:border-blue-300
  bg-purple-100 text-purple-800 border-purple-400 hover:bg-purple-50 hover:border-purple-300
  bg-orange-100 text-orange-800 border-orange-400 hover:bg-orange-50 hover:border-orange-300
  bg-green-100 text-green-800 border-green-400 hover:bg-green-50 hover:border-green-300
  bg-indigo-100 text-indigo-800 border-indigo-400 hover:bg-indigo-50 hover:border-indigo-300
</div>
<div className="flex flex-wrap gap-2 mt-4">
  {[
    { value: 'pending', label: 'Függőben', icon: '⏳', color: 'yellow' },
    { value: 'in_progress', label: 'Folyamatban', icon: '⚙️', color: 'blue' },
    { value: 'diagnosed', label: 'Diagnosztizálva', icon: '🔍', color: 'purple' },
    { value: 'waiting_parts', label: 'Alkatrészre vár', icon: '📦', color: 'orange' },
    { value: 'completed', label: 'Kész', icon: '✅', color: 'green' },
    { value: 'invoiced', label: 'Számlázva', icon: '💳', color: 'indigo' },
  ].map((s) => (
    <button
      key={s.value}
      onClick={() => {
        // Lokális frissítés (azonnal látható)
        setRepairs((prev) =>
          prev.map((r) =>
            r.id === repair.id ? { ...r, status: s.value } : r
          )
        );

        // Supabase update háttérben
        (async () => {
          try {
            const { error } = await supabase
              .from('repairs')
              .update({ 
                status: s.value,
                completed_at: s.value === 'completed' ? new Date().toISOString() : null
              })
              .eq('id', repair.id);

            if (error) throw error;
          } catch (err) {
            console.error("Státusz hiba:", err);
            alert("Nem sikerült frissíteni az állapotot");

            // Visszaállítás hibánál
            setRepairs((prev) =>
              prev.map((r) =>
                r.id === repair.id ? { ...r, status: repair.status } : r
              )
            );
          }
        })();
      }}
      className={`group flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-all duration-200 ${
        repair.status === s.value
          ? `bg-${s.color}-100 text-${s.color}-800 border-2 border-${s.color}-400 shadow-sm scale-105`
          : `bg-white text-gray-700 border border-gray-200 hover:bg-${s.color}-50 hover:border-${s.color}-300 hover:shadow-sm`
      }`}
    >
      <span className="text-base">{s.icon}</span>
      {s.label}
    </button>
  ))}
</div>
</div>
              ))}
            </div>
          )}
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