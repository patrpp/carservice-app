'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Customer } from '@/types/index';  

interface CreateVehicleFormProps {
  onSuccess?: () => void;
}

export function CreateVehicleForm({ onSuccess }: CreateVehicleFormProps = {}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [licensePlate, setLicensePlate] = useState("");
  const [year, setYear] = useState("");
  const [vin, setVin] = useState("");
  const [mileage, setMileage] = useState("");
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Ügyfelek betöltése
  useEffect(() => {
    const fetchCustomers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingCustomers(false);
        return;
      }

      const { data, error } = await supabase
        .from('customers')
        .select('id, name, user_id, created_at')
        .eq('user_id', user.id)
        .order('name');

      if (error) {
        console.error('Ügyfelek betöltése sikertelen:', error);
        setError("Nem sikerült betölteni az ügyfeleket");
      } else {
        setCustomers(data || []);
      }
      setLoadingCustomers(false);
    };

    fetchCustomers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) {
      setError("Válassz egy ügyfelet!");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nincs bejelentkezve");

      const { error } = await supabase
        .from('vehicles')
        .insert({
          customer_id: customerId,
          user_id: user.id,
          make,
          model,
          license_plate: licensePlate || null,
          year: year ? Number(year) : null,
          vin: vin || null,
          mileage: mileage ? Number(mileage) : null,
        });

      if (error) throw error;

      // Siker esetén reset
      setCustomerId("");
      setMake("");
      setModel("");
      setLicensePlate("");
      setYear("");
      setVin("");
      setMileage("");
      onSuccess?.();
   } catch (err) {
  console.error("Autó létrehozási hiba:", err);  
  setError(err instanceof Error ? err.message : "Nem sikerült létrehozni az autót");
} finally {
  setIsSubmitting(false);
}
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-black">Új autó</h2>

 <div>
  <Label htmlFor="customer">Ügyfél *</Label>
 <Select value={customerId} onValueChange={setCustomerId} required>
  <SelectTrigger id="customer">
    <SelectValue placeholder="Válassz ügyfelet" />
  </SelectTrigger>
  <SelectContent>
    {customers.map((c) => (
      <SelectItem key={c.id} value={c.id}>
        {c.name}
      </SelectItem>
    ))}
  </SelectContent>
</Select>
</div>

      <div>
        <Label htmlFor="make">Márka *</Label>
        <Input id="make" value={make} onChange={(e) => setMake(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="model">Típus *</Label>
        <Input id="model" value={model} onChange={(e) => setModel(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="license_plate">Rendszám</Label>
        <Input id="license_plate" value={licensePlate} onChange={(e) => setLicensePlate(e.target.value)} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="year">Évjárat</Label>
          <Input id="year" type="number" value={year} onChange={(e) => setYear(e.target.value)} />
        </div>
        <div>
          <Label htmlFor="mileage">Km-állás</Label>
          <Input id="mileage" type="number" value={mileage} onChange={(e) => setMileage(e.target.value)} />
        </div>
      </div>

      <div>
        <Label htmlFor="vin">Alvázszám (VIN)</Label>
        <Input id="vin" value={vin} onChange={(e) => setVin(e.target.value)} />
      </div>

      <Button type="submit" disabled={isSubmitting || loadingCustomers} className="w-full">
        {isSubmitting ? "Létrehozás..." : "Autó hozzáadása"}
      </Button>

      {error && <div className="text-red-500 text-sm mt-2">{error}</div>}
    </form>
  );
}