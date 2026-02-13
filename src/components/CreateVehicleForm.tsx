'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { Customer } from "@/types";
import { FloatingInput} from "@/components/ui/floating-input";

interface CreateVehicleFormProps {
  onSuccess?: () => void;
  defaultValues?: {
    id?: string;
    customer_id?: string;
    make?: string;
    model?: string;
    license_plate?: string;
    year?: string;
    vin?: string;
    mileage?: string;
  };
}

export function CreateVehicleForm({
  onSuccess,
  defaultValues,
}: CreateVehicleFormProps = {}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState(defaultValues?.customer_id || "");
  const [make, setMake] = useState(defaultValues?.make || "");
  const [model, setModel] = useState(defaultValues?.model || "");
  const [licensePlate, setLicensePlate] = useState(defaultValues?.license_plate || "");
  const [year, setYear] = useState(defaultValues?.year || "");
  const [vin, setVin] = useState(defaultValues?.vin || "");
  const [mileage, setMileage] = useState(defaultValues?.mileage || "");
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCustomers = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoadingCustomers(false);
        return;
      }

      const { data, error } = await supabase
        .from("customers")
        .select("id, name, user_id, created_at")
        .eq("user_id", user.id)
        .order("name");

      if (error) {
        console.error(error);
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

    setIsSubmitting(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nincs bejelentkezve");

      const payload = {
        customer_id: customerId,
        user_id: user.id,
        make,
        model,
        license_plate: licensePlate || null,
        year: year ? Number(year) : null,
        vin: vin || null,
        mileage: mileage ? Number(mileage) : null,
      };

      if (defaultValues?.id) {
        const { error } = await supabase
          .from("vehicles")
          .update(payload)
          .eq("id", defaultValues.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("vehicles")
          .insert(payload);
        if (error) throw error;
      }

      onSuccess?.();
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : "Hiba történt");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8 bg-background p-6 rounded-xl border border-border shadow-lg"
    >
      {/* Cím */}
      <div className="relative group">
        <h2 className="text-2xl font-bold tracking-tight transition-all group-hover:-translate-y-1">
          {defaultValues?.id ? "Autó szerkesztése" : "Új autó hozzáadása"}
        </h2>
        <span className="absolute -bottom-1 left-0 h-0.5 bg-primary transition-all w-0 group-hover:w-full" />
      </div>

      {/* Ügyfél */}
      <div className="relative">

        {loadingCustomers ? (
          <div className="flex items-center gap-2 pt-6 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Ügyfelek betöltése...
          </div>
        ) : (
          <Select value={customerId} onValueChange={setCustomerId}>
            <SelectTrigger className="h-12 pt-4">
              <SelectValue placeholder="Válassz ügyfelet..." />
            </SelectTrigger>
            <SelectContent>
              {customers.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
<div className="space-y-6">
  {/* Floating inputs */}
  <FloatingInput
    id="make"
    label="Márka *"
    value={make}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMake(e.target.value)}
    required
  />

  <FloatingInput
    id="model"
    label="Típus *"
    value={model}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setModel(e.target.value)}
    required
  />

  <FloatingInput
    id="license_plate"
    label="Rendszám"
    value={licensePlate}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setLicensePlate(e.target.value)}
  />

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
    <FloatingInput
      id="year"
      label="Évjárat"
      type="number"
      value={year}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(e.target.value)}
    />

    <FloatingInput
      id="mileage"
      label="Km-állás"
      type="number"
      value={mileage}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMileage(e.target.value)}
    />
  </div>

  <FloatingInput
    id="vin"
    label="Alvázszám (VIN)"
    value={vin}
    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVin(e.target.value)}
  />
</div>
      {/* Submit */}
      <Button
        type="submit"
        disabled={isSubmitting || loadingCustomers}
        className="h-11 w-full text-base hover:scale-[1.02]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Mentés folyamatban...
          </>
        ) : defaultValues?.id ? "Módosítás mentése" : "Autó hozzáadása"}
      </Button>

      {error && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-center text-sm text-destructive">
          {error}
        </div>
      )}
    </form>
  );
}
