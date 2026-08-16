"use client";
import { useCallback, useEffect, useState } from "react";

import { THEME_STORAGE_KEY, ThemeMode } from "./constants";

const EVENT = "imagisum:theme-changed";
const DARK_QUERY = "(prefers-color-scheme: dark)";

function readMode(): ThemeMode {
    try {
        const raw = localStorage.getItem(THEME_STORAGE_KEY);
        return raw === "light" || raw === "dark" ? raw : "system";
    } catch {
        return "system";
    }
}

/** Writes the class the CSS actually keys off, mirroring the pre-paint script. */
function applyMode(mode: ThemeMode): "light" | "dark" {
    const dark = mode === "dark" || (mode === "system" && window.matchMedia(DARK_QUERY).matches);
    const root = document.documentElement;

    root.classList.toggle("dark", dark);
    root.style.colorScheme = dark ? "dark" : "light";

    return dark ? "dark" : "light";
}

/**
 * Three-mode theme state. "system" is persisted by clearing the key, so a user
 * who never touches the toggle keeps following their OS forever.
 */
export function useTheme() {
    const [mode, setMode] = useState<ThemeMode>("system");
    const [resolved, setResolved] = useState<"light" | "dark">("light");
    // The server can't know the mode; hold off on mode-specific UI until mount.
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const sync = () => {
            const next = readMode();
            setMode(next);
            setResolved(applyMode(next));
        };

        sync();
        setMounted(true);

        const media = window.matchMedia(DARK_QUERY);
        // Only matters while following the system, but the listener is cheap.
        const onSystemChange = () => {
            if (readMode() === "system") sync();
        };

        window.addEventListener(EVENT, sync);
        window.addEventListener("storage", sync);
        media.addEventListener("change", onSystemChange);

        return () => {
            window.removeEventListener(EVENT, sync);
            window.removeEventListener("storage", sync);
            media.removeEventListener("change", onSystemChange);
        };
    }, []);

    const setTheme = useCallback((next: ThemeMode) => {
        try {
            if (next === "system") localStorage.removeItem(THEME_STORAGE_KEY);
            else localStorage.setItem(THEME_STORAGE_KEY, next);
        } catch {
            /* private mode — the choice just won't survive a reload */
        }
        // Notifies every hook instance on this page; `storage` covers other tabs.
        window.dispatchEvent(new CustomEvent(EVENT));
    }, []);

    return { mode, resolved, mounted, setTheme };
}
