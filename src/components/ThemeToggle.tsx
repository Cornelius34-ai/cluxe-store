"use client";

import * as React from "react";
import { Moon, Sun, Monitor } from "lucide-react";

import { useTheme } from "@/components/theme-provider";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { value: "light", label: "Light", Icon: Sun },
  { value: "system", label: "System", Icon: Monitor },
  { value: "dark", label: "Dark", Icon: Moon },
] as const;

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  // Avoid hydration mismatch — render a neutral placeholder until mounted
  React.useEffect(() => setMounted(true), []);

  if (!mounted) {
    return (
      <div
        className={cn(
          "inline-flex h-9 items-center gap-0.5 rounded-md border bg-background p-0.5",
          className
        )}
        aria-hidden
      >
        {OPTIONS.map(({ label }) => (
          <div
            key={label}
            className="inline-flex h-8 w-8 items-center justify-center rounded-sm"
          />
        ))}
      </div>
    );
  }

  return (
    <div
      role="radiogroup"
      aria-label="Theme"
      className={cn(
        "inline-flex h-9 items-center gap-0.5 rounded-md border bg-background p-0.5",
        className
      )}
    >
      {OPTIONS.map(({ value, label, Icon }) => {
        const active = theme === value;
        return (
          <button
            key={value}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={label}
            onClick={() => setTheme(value)}
            className={cn(
              "inline-flex h-8 w-8 items-center justify-center rounded-sm text-muted-foreground transition-colors",
              "hover:text-foreground",
              active && "bg-foreground text-background"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </button>
        );
      })}
    </div>
  );
}
