"use client";
import { useEffect, useRef, useState } from "react";
import { IconCheck, IconMoon, IconSun, IconSunMoon } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

import { ThemeMode } from "@/lib/constants";
import { useTheme } from "@/lib/use-theme";

const options: { value: ThemeMode; label: string; icon: typeof IconSun }[] = [
    { value: "light", label: "Light", icon: IconSun },
    { value: "dark", label: "Dark", icon: IconMoon },
    { value: "system", label: "System", icon: IconSunMoon }
];

const ThemeToggle = ({ className }: { className?: string }) => {
    const { mode, resolved, mounted, setTheme } = useTheme();
    const [open, setOpen] = useState(false);
    const wrapRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;

        const onPointerDown = (event: MouseEvent) => {
            if (!wrapRef.current?.contains(event.target as Node)) setOpen(false);
        };
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };

        document.addEventListener("mousedown", onPointerDown);
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("mousedown", onPointerDown);
            document.removeEventListener("keydown", onKeyDown);
        };
    }, [open]);

    // Until mount we assume "system" — the most common state and a stable
    // starting point for hydration.
    const active = mounted ? mode : "system";
    const ActiveIcon = options.find((option) => option.value === active)?.icon ?? IconSunMoon;

    return (
        <div ref={wrapRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((prev) => !prev)}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label={`Theme: ${active}`}
                title={`Theme: ${active}`}
                className={twMerge(
                    "inline-flex size-10 items-center justify-center rounded-xl transition-colors hover:bg-bg-inset",
                    className
                )}
            >
                <ActiveIcon size={19} />
            </button>

            {open && (
                <div
                    role="menu"
                    aria-label="Theme"
                    className="absolute right-0 top-full z-50 mt-2 w-48 overflow-hidden rounded-xl border border-border bg-bg-elevated p-1 text-fg shadow-2xl shadow-black/10 animate-fade-in"
                >
                    {options.map((option) => (
                        <button
                            key={option.value}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active === option.value}
                            onClick={() => {
                                setTheme(option.value);
                                setOpen(false);
                            }}
                            className={twMerge(
                                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-bg-inset",
                                active === option.value ? "font-medium text-fg" : "text-fg-muted"
                            )}
                        >
                            <option.icon size={17} className="shrink-0" />
                            <span className="flex-1 text-left">{option.label}</span>
                            {active === option.value && <IconCheck size={15} className="text-brand" />}
                        </button>
                    ))}

                    {mounted && mode === "system" && (
                        <p className="border-t border-border px-3 py-2 text-[11px] text-fg-subtle">
                            Following your device — currently {resolved}.
                        </p>
                    )}
                </div>
            )}
        </div>
    );
};

export default ThemeToggle;
