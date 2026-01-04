'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Vehicle } from '@/types/index';

interface CreateRepairFormProps {
  onSuccess?: () => void;
  defaultValues?: {
    id?: string;
    description?: string;
    status?: string;
    vehicle_id?: string;
  };
}

export function CreateRepairForm({ onSuccess, defaultValues }: CreateRepairFormProps = {}) {
  const [vehicleId, setVehicleId] = useState(defaultValues?.vehicle_id || "");
  const [description, setDescription] = useState(defaultValues?.description || "");
  const [status, setStatus] = useState(defaultValues?.status || "pending");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Autók betöltése
  useEffect(() => {
    const fetchVehicles = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingVehicles(false);
        return;
      }

      const { data: rawData, error } = await supabase
        .from('vehicles')
        .select(`
          id, customer_id, user_id, make, model, license_plate, year, vin, mileage, created_at
        `)
        .eq('user_id', user.id)
        .order('make');

      if (error) {
        console.error("Teljes Supabase hiba objektum:", error);
        setError("Autók betöltése sikertelen – részletek a konzolon");
        setLoadingVehicles(false);
        return;
      }

      type RawVehicle = {
        id: string;
        customer_id: string | null;
        user_id: string;
        make: string;
        model: string;
        license_plate?: string;
        year?: number;
        vin?: string;
        mileage?: number;
        created_at: string;
      };

      const formattedVehicles = await Promise.all(
        (rawData ?? []).map(async (item: RawVehicle) => {
          let customerName = 'Nincs ügyfél';

          if (item.customer_id) {
            const { data: customer, error: customerError } = await supabase
              .from('customers')
              .select('name')
              .eq('id', item.customer_id)
              .single();

            if (customerError) {
              console.error("Ügyfél lekérdezési hiba:", customerError);
            } else if (customer?.name) {
              customerName = customer.name;
            }
          }

          return {
            id: item.id,
            customer_id: item.customer_id,
            user_id: item.user_id,
            make: item.make,
            model: item.model,
            year: item.year,
            license_plate: item.license_plate,
            vin: item.vin,
            mileage: item.mileage,
            created_at: item.created_at,
            customer: { name: customerName },
          } as Vehicle;
        })
      );

      setVehicles(formattedVehicles);
      setLoadingVehicles(false);
    };

    fetchVehicles();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!vehicleId) {
      setError("Válassz egy autót!");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nincs bejelentkezve felhasználó");

      if (defaultValues?.id) {
        // MÓDOSÍTÁS (UPDATE)
        const { error } = await supabase
          .from('repairs')
          .update({
            vehicle_id: vehicleId,
            description,
            status,
          })
          .eq('id', defaultValues.id);

        if (error) throw error;
      } else {
        // ÚJ LÉTREHOZÁS (INSERT)
        const { error } = await supabase
          .from('repairs')
          .insert({
            vehicle_id: vehicleId,
            description,
            user_id: user.id,
            status: status || 'pending',
          });

        if (error) throw error;
      }

      // Reset form
      setVehicleId("");
      setDescription("");
      setStatus("pending");
      onSuccess?.();
    } catch (err) {
      console.error("Javítás műveleti hiba:", err);
      setError(err instanceof Error ? err.message : "Nem sikerült elmenteni a javítást");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h2 className="text-2xl font-bold text-black">
        {defaultValues?.id ? "Javítás szerkesztése" : "Új javítás"}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="vehicle" className="text-black">Autó</Label>
        {loadingVehicles ? (
          <p className="text-sm text-gray-500">Autók betöltése...</p>
        ) : vehicles.length === 0 ? (
          <p className="text-sm text-gray-500">Még nincs autó hozzáadva. Előbb hozz létre egyet!</p>
        ) : (
          <Select value={vehicleId} onValueChange={setVehicleId} required>
            <SelectTrigger id="vehicle" className="border-input focus:ring-ring">
              <SelectValue placeholder="Válassz autót" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  <span className="font-medium">
                    {vehicle.make} {vehicle.model}
                  </span>
                  {vehicle.license_plate && (
                    <span className="text-muted-foreground ml-1">({vehicle.license_plate})</span>
                  )}
                  <span className="ml-2 text-muted-foreground">
                    – {vehicle.customer?.name ?? 'Nincs ügyfél'}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-black">Leírás</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Pl. fékcsere, olajcsere, diagnosztika..."
          rows={4}
          required
          className="resize-none"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status" className="text-black">Státusz</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Válassz státuszt" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Függőben</SelectItem>
            <SelectItem value="in_progress">Folyamatban</SelectItem>
            <SelectItem value="diagnosed">Diagnosztizálva</SelectItem>
            <SelectItem value="waiting_parts">Alkatrészre vár</SelectItem>
            <SelectItem value="completed">Kész</SelectItem>
            <SelectItem value="invoiced">Számlázva</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={isSubmitting || loadingVehicles} className="w-full">
        {isSubmitting ? "Mentés..." : defaultValues?.id ? "Módosítás mentése" : "Javítás hozzáadása"}
      </Button>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}
    </form>
  );
}