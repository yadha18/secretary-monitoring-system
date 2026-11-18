import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  error,
  required,
  hint,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  required?: boolean;
  hint?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      {children}
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export function Options({ values, placeholder }: { values: readonly (string | number)[]; placeholder?: string }) {
  return (
    <>
      {placeholder && <option value="">{placeholder}</option>}
      {values.map((v) => (
        <option key={v} value={v}>
          {typeof v === "number" ? `${v}%` : v}
        </option>
      ))}
    </>
  );
}
