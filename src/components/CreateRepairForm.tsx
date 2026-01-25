'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { Vehicle } from '@/types/index';
import { Loader2 } from 'lucide-react';

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
          id, customer_id, make, model, license_plate, year
        `)
        .eq('user_id', user.id)
        .order('make');

      if (error) {
        console.error("Autók betöltése sikertelen:", error);
        setError("Autók betöltése sikertelen");
        setLoadingVehicles(false);
        return;
      }

      const formattedVehicles = await Promise.all(
        (rawData ?? []).map(async (item) => {
          let customerName = 'Nincs ügyfél';
          if (item.customer_id) {
            const { data: customer } = await supabase
              .from('customers')
              .select('name')
              .eq('id', item.customer_id)
              .single();
            customerName = customer?.name ?? 'Nincs ügyfél';
          }

          return {
            id: item.id,
            make: item.make,
            model: item.model,
            license_plate: item.license_plate,
            year: item.year,
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
      setError("Válassz autót!");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nincs bejelentkezve");

      if (defaultValues?.id) {
        const { error } = await supabase
          .from('repairs')
          .update({ vehicle_id: vehicleId, description, status })
          .eq('id', defaultValues.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('repairs')
          .insert({
            vehicle_id: vehicleId,
            description,
            user_id: user.id,
            status,
          });
        if (error) throw error;
      }

      setVehicleId("");
      setDescription("");
      setStatus("pending");
      onSuccess?.();
    } catch (err) {
      setError("Nem sikerült menteni a javítást");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-7">
      <h2 className="text-2xl font-bold text-center text-foreground">
        {defaultValues?.id ? "Javítás szerkesztése" : "Új javítás hozzáadása"}
      </h2>

      <div className="space-y-2">
        <Label htmlFor="vehicle">Autó</Label>
        {loadingVehicles ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Betöltés...
          </div>
        ) : vehicles.length === 0 ? (
          <p className="text-sm text-muted-foreground">Még nincs autó. Előbb hozz létre egyet!</p>
        ) : (
          <Select value={vehicleId} onValueChange={setVehicleId} required>
            <SelectTrigger id="vehicle">
              <SelectValue placeholder="Válassz autót" />
            </SelectTrigger>
            <SelectContent>
              {vehicles.map((vehicle) => (
                <SelectItem key={vehicle.id} value={vehicle.id}>
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {vehicle.license_plate && `${vehicle.license_plate} • `}
                     {vehicle.make} {vehicle.model}
                    </span>
                     <span className="text-sm text-muted-foreground">
                       {vehicle.customer?.name ?? 'Nincs ügyfél'}
                    </span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Leírás</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Pl. fékcsere, olajcsere, diagnosztika..."
          rows={5}
          required
          className="resize-none"
        />
      </div>

      <div className="space-y-3">
  <Label className="text-foreground font-medium">Státusz</Label>
  <div className="flex flex-wrap gap-2">
    {[
      { value: "pending", label: "Függőben", color: "bg-amber-100 text-amber-800 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:hover:bg-amber-900/50" },
      { value: "in_progress", label: "Folyamatban", color: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-900/50" },
      { value: "diagnosed", label: "Diagnosztizálva", color: "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:hover:bg-purple-900/50" },
      { value: "waiting_parts", label: "Alkatrészre vár", color: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:hover:bg-indigo-900/50" },
      { value: "completed", label: "Kész", color: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-900/50" },
      { value: "invoiced", label: "Számlázva", color: "bg-rose-100 text-rose-800 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:hover:bg-rose-900/50" },
    ].map((item) => (
      <button
        key={item.value}
        type="button"
        onClick={() => setStatus(item.value)}
        className={`
          px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
          ${status === item.value 
            ? `${item.color.replace(/bg-/, 'bg-').replace(/text-/, 'text-')} ring-2 ring-offset-2 ring-offset-background ring-primary/50`
            : `${item.color.replace(/bg-/, 'bg-').replace(/text-/, 'text-')} hover:scale-105`
          }
        `}
      >
        {item.label}
      </button>
    ))}
  </div>
</div>
      <div className="pt-4">
        <Button 
          type="submit" 
          disabled={isSubmitting || loadingVehicles}
          className="w-full"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Mentés...
            </>
          ) : defaultValues?.id ? "Módosítás mentése" : "Javítás hozzáadása"}
        </Button>

        {error && (
          <div className="mt-4 p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}