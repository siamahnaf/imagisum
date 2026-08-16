"use client";
import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "imagisum:favorites";
const EVENT = "imagisum:favorites-changed";
const MAX_FAVORITES = 300;

function read(): number[] {
    if (typeof window === "undefined") return [];
    try {
        const raw = window.localStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed.filter((v): v is number => typeof v === "number") : [];
    } catch {
        return [];
    }
}

function write(ids: number[]) {
    try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids.slice(0, MAX_FAVORITES)));
    } catch {
        /* quota or private mode — favourites are a nicety, never block on them */
    }
    window.dispatchEvent(new CustomEvent(EVENT));
}

/**
 * Favourites live in localStorage (no accounts in this app). All hook instances
 * stay in sync through a custom event, plus `storage` for other tabs.
 */
export function useFavorites() {
    const [ids, setIds] = useState<number[]>([]);
    // Guards against hydration mismatch: the server has no localStorage.
    const [ready, setReady] = useState(false);

    useEffect(() => {
        setIds(read());
        setReady(true);

        const sync = () => setIds(read());
        window.addEventListener(EVENT, sync);
        window.addEventListener("storage", sync);
        return () => {
            window.removeEventListener(EVENT, sync);
            window.removeEventListener("storage", sync);
        };
    }, []);

    const toggle = useCallback((id: number) => {
        const current = read();
        write(current.includes(id) ? current.filter((v) => v !== id) : [id, ...current]);
    }, []);

    const isFavorite = useCallback((id: number) => ids.includes(id), [ids]);

    const clear = useCallback(() => write([]), []);

    return { ids, ready, toggle, isFavorite, clear, count: ids.length };
}
