"use client"

import { useId, type ReactNode, type SelectHTMLAttributes } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/src/lib/utils"

export interface NativeSelectOption {
  value: string
  label: string
}

interface NativeSelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  label: ReactNode
  value: string
  onValueChange: (value: string) => void
  options: ReadonlyArray<NativeSelectOption>
  /** Texto de ayuda: se asocia al control con aria-describedby */
  hint?: ReactNode
  icon?: ReactNode
}

/**
 * Selector nativo con etiqueta asociada (htmlFor) y ayuda enlazada (aria-describedby).
 * Usa el <select> del navegador: teclado, lector de pantalla y selector móvil gratis, sin JS extra.
 */
export function NativeSelectField({
  label,
  value,
  onValueChange,
  options,
  hint,
  icon,
  className,
  disabled,
  ...props
}: NativeSelectFieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-foreground">
        {icon}
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          disabled={disabled}
          aria-describedby={hintId}
          onChange={(e) => onValueChange(e.target.value)}
          className={cn(
            "h-12 w-full cursor-pointer appearance-none rounded-md border-2 border-surface-border bg-slate-950/60 px-3 pr-10 text-base text-foreground",
            "transition-colors hover:border-slate-500 focus-visible:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
            "disabled:cursor-not-allowed disabled:opacity-60",
            className,
          )}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      </div>
      {hint && (
        <p id={hintId} className="text-xs leading-relaxed text-slate-400">
          {hint}
        </p>
      )}
    </div>
  )
}
