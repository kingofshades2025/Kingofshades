import { cn } from "@/lib/utils";

const fieldBase =
  "w-full rounded-xl border border-line bg-charcoal-light px-4 py-3 text-sm text-snow placeholder:text-mist/60 transition-colors focus:border-gold/60 focus:outline-none focus:ring-2 focus:ring-gold/20";

export function Label({
  htmlFor,
  children,
  className,
}: {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn("mb-1.5 block text-sm font-medium text-snow/90", className)}
    >
      {children}
    </label>
  );
}

export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldBase, className)} {...props} />;
}

export function Textarea({
  className,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea className={cn(fieldBase, "min-h-28 resize-y", className)} {...props} />
  );
}

export function Select({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(fieldBase, "appearance-none bg-[length:1rem] pr-10", className)}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' fill='none' stroke='%239a9a9a' stroke-width='2' viewBox='0 0 24 24'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "right 0.9rem center",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
  className,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      {label && <Label htmlFor={htmlFor}>{label}</Label>}
      {children}
      {hint && <p className="mt-1 text-xs text-mist">{hint}</p>}
    </div>
  );
}
