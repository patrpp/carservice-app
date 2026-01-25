'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTrigger } from "@/components/ui/dialog";
import { PlusCircle } from 'lucide-react';
import { CreateRepairForm } from '@/components/CreateRepairForm';

interface CreateRepairModalProps {
  onSuccess?: () => void;
}

export function CreateRepairModal({ onSuccess }: CreateRepairModalProps = {}) {
  const [open, setOpen] = useState(false);

  const handleSuccess = () => {
    setOpen(false);
    onSuccess?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className="
            relative flex items-center justify-center rounded-xl 
           
            group cursor-pointer overflow-hidden
            transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
            hover:border-primary/40 hover:bg-primary/5">
          <div/>
          <PlusCircle
            size={80}
            className="
              text-teal-500 dark:text-teal-400
              transition-all duration-500 ease-in-out
              group-hover:rotate-90 group-hover:scale-110
              group-hover:text-teal-600 dark:group-hover:text-teal-300"/>
         <span className="
    absolute text-base font-medium text-gray-600 dark:text-gray-300
    opacity-0 -translate-y-4 transition-all duration-300
    group-hover:opacity-100 group-hover:-translate-y-16">
  Új javítás
</span>

        </div>
        
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
        </DialogHeader>
        <CreateRepairForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}