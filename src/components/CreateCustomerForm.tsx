'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { FloatingInput } from "@/components/ui/floating-input";

interface CreateCustomerFormProps {
  onSuccess?: () => void;
}

export function CreateCustomerForm({ onSuccess }: CreateCustomerFormProps = {}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nincs bejelentkezve");

      const { error } = await supabase
        .from('customers')
        .insert({
          name,
          phone: phone || null,
          email: email || null,
          address: address || null,
          user_id: user.id,
        });

      if (error) throw error;

      // Reset form
      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      onSuccess?.();
    } catch (err) {
      console.error("Ügyfél létrehozási hiba:", err);
      setError(err instanceof Error ? err.message : "Nem sikerült létrehozni az ügyfelet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-background p-6 rounded-xl border border-border shadow-lg">
      {/* Cím */}
      <div className="relative group">
        <h2 className="text-2xl font-bold tracking-tight text-foreground transition-all duration-300 group-hover:-translate-y-1">
          Új ügyfél hozzáadása
        </h2>
        <span className="absolute -bottom-1 left-0 h-0.5 bg-primary transition-all duration-300 w-0 group-hover:w-full" />
      </div>

      {/* Név */}
      <FloatingInput
        id="name"
        label="Név *"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />

      {/* Telefon */}
      <FloatingInput
        id="phone"
        label="Telefon"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
      />

      {/* Email */}
      <FloatingInput
        id="email"
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      {/* Cím */}
      <FloatingInput
        id="address"
        label="Cím"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
      />

      {/* Submit gomb + hiba */}
      <div className="flex flex-col gap-4 pt-4">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-11 w-full text-base font-medium transition-all duration-200 hover:scale-[1.02] hover:shadow-md"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Létrehozás folyamatban...
            </>
          ) : (
            "Ügyfél hozzáadása"
          )}
        </Button>

        {error && (
          <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm text-center">
            {error}
          </div>
        )}
      </div>
    </form>
  );
}