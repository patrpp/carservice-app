'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/lib/supabase";

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
          phone,
          email,
          address,
          user_id: user.id,
        });

      if (error) throw error;

      setName("");
      setPhone("");
      setEmail("");
      setAddress("");
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Nem sikerült létrehozni az ügyfelet");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow">
      <h2 className="text-xl font-bold text-black">Új ügyfél</h2>

      <div>
        <Label htmlFor="name">Név *</Label>
        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>

      <div>
        <Label htmlFor="phone">Telefon</Label>
        <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div>
        <Label htmlFor="address">Cím</Label>
        <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} />
      </div>

      <Button type="submit" disabled={isSubmitting} className="w-full">
        {isSubmitting ? "Létrehozás..." : "Ügyfél hozzáadása"}
      </Button>

      {error && <div className="text-red-500 text-sm">{error}</div>}
    </form>
  );
}