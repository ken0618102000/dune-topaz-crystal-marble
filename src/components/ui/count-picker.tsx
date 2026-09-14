import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CountPicker({
  value,
  min,
  max,
  onChange,
  suffix = "",
  ariaLabel,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (n: number) => void;
  suffix?: string;
  ariaLabel?: string;
}) {
  const items = Array.from({ length: max - min + 1 }, (_, i) => min + i);
  return (
    <div className="flex gap-2" role="radiogroup" aria-label={ariaLabel}>
      {items.map((n) => (
        <Button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          variant={value === n ? "default" : "secondary"}
          className={cn("min-h-12 flex-1 px-0 font-display text-lg tabular")}
          onClick={() => onChange(n)}
        >
          {n}
          {suffix}
        </Button>
      ))}
    </div>
  );
}

const TIMES: string[] = [];
for (let h = 6; h <= 23; h++) {
  TIMES.push(`${String(h).padStart(2, "0")}:00`);
  if (h < 23) TIMES.push(`${String(h).padStart(2, "0")}:30`);
}

export function TimeSelect({
  value,
  onChange,
  id,
}: {
  value: string;
  onChange: (v: string) => void;
  id?: string;
}) {
  const options = TIMES.includes(value) ? TIMES : [value, ...TIMES];
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full rounded-md border border-input bg-secondary px-3 text-base text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {options.map((t) => (
        <option key={t} value={t}>
          {t}
        </option>
      ))}
    </select>
  );
}
