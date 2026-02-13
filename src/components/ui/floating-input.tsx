'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  containerClassName?: string;
}

const FloatingInput = forwardRef<HTMLInputElement, FloatingInputProps>(
  (
    {
      id,
      label,
      value = "",
      onChange,
      type = "text",
      required = false,
      placeholder = "",
      className,
      containerClassName,
      disabled = false,
      ...props
    },
    ref
  ) => {
    const isFilled = value.toString().length > 0;

    return (
      <div className={cn("relative w-full group", containerClassName)}>
        <Input
          ref={ref}
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            // Alap kinézet – kerek, szürke keret, átlátszó háttér
            "peer h-14 w-full px-4 pt-6 pb-2 text-base bg-transparent border border-muted-foreground/50 rounded-xl",
            "transition-all duration-200 ease-out",
            // Fókusz / hover / kitöltött állapot
            "focus:border-primary focus:ring-1 focus:ring-primary/30 focus:shadow-[0_0_0_4px_rgba(var(--primary),0.15)]",
            "group-hover:border-primary/70",
            isFilled && "border-primary/70",
            // Disabled
            disabled && "opacity-60 cursor-not-allowed bg-muted/30",
            className
          )}
          {...props}
        />

        {/* Floating label – NINCS háttér, átlátszó */}
        <Label
          htmlFor={id}
          className={cn(
            // Alap pozíció: középen
            "absolute left-4 top-1/2 -translate-y-1/2 text-base text-muted-foreground pointer-events-none transition-all duration-200 ease-out",
            // Felcsúszott állapot
            (isFilled) && "-top-2 text-xs font-medium",
            // Fókusz állapot
            "peer-focus:-top-2 peer-focus:text-xs peer-focus:font-medium peer-focus:text-primary",
            // Nincs px-1 vagy bg, hogy ne legyen fehér/szürke doboz
            "px-0 ml-0 z-10"
          )}
        >
          {label}
        </Label>
      </div>
    );
  }
);

FloatingInput.displayName = "FloatingInput";

export { FloatingInput };