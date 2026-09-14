import { cn } from "@/lib/utils";
import { SKILL_BANDS, SKILL_MIN, skillBand } from "@/lib/yupai/types";

const BANDS = (() => {
  const out: Array<{ label: string; from: number; to: number }> = [];
  let from = SKILL_MIN;
  for (const band of SKILL_BANDS) {
    out.push({ label: band.label, from, to: band.max });
    from = band.max + 1;
  }
  return out;
})();

export function SkillPicker({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (n: number) => void;
  disabled?: boolean;
}) {
  const selected = Math.round(value);
  return (
    <div className="flex flex-col gap-1.5">
      {BANDS.map((band) => (
        <div key={band.label} className="flex items-center gap-2">
          <span className="w-8 shrink-0 text-xs text-muted-foreground">{band.label}</span>
          <div className="flex flex-1 gap-1">
            {Array.from({ length: band.to - band.from + 1 }, (_, i) => band.from + i).map(
              (n) => (
                <button
                  key={n}
                  type="button"
                  disabled={disabled}
                  onClick={() => onChange(n)}
                  className={cn(
                    "min-h-11 flex-1 rounded-md text-sm tabular transition-colors",
                    selected === n
                      ? "bg-primary text-primary-foreground"
                      : "bg-accent text-accent-foreground hover:bg-secondary",
                  )}
                  aria-pressed={selected === n}
                  aria-label={`${n}級 ${skillBand(n)}`}
                >
                  {n}
                </button>
              ),
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
