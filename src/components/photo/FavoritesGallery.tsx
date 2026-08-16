"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { IconHeartOff, IconTrash } from "@tabler/icons-react";

import PhotoCard from "./PhotoCard";
import { PhotoGridSkeleton, gridColumns } from "./PhotoGrid";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Spinner from "../ui/Spinner";
import { PexelsPhoto } from "@/_types";
import { useFavorites } from "@/lib/use-favorites";

const BATCH = 12;

const FavoritesGallery = () => {
    const { ids, ready, clear, count } = useFavorites();

    const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadedCount, setLoadedCount] = useState(BATCH);

    // Cache across re-renders so removing one favourite doesn't refetch the rest.
    const cache = useRef(new Map<number, PexelsPhoto>());

    const hydrate = useCallback(
        async (targetIds: number[]) => {
            const missing = targetIds.filter((id) => !cache.current.has(id));

            if (missing.length) {
                setLoading(true);
                const results = await Promise.all(
                    missing.map(async (id) => {
                        try {
                            const response = await fetch(`/api/photos/${id}`);
                            if (!response.ok) return null;
                            return (await response.json()) as PexelsPhoto;
                        } catch {
                            return null;
                        }
                    })
                );
                results.forEach((photo) => photo && cache.current.set(photo.id, photo));
                setLoading(false);
            }

            setPhotos(targetIds.map((id) => cache.current.get(id)).filter((p): p is PexelsPhoto => Boolean(p)));
        },
        []
    );

    // Whenever the favourite list or the visible window changes, resolve photos.
    useEffect(() => {
        if (!ready) return;
        hydrate(ids.slice(0, loadedCount));
    }, [ids, ready, loadedCount, hydrate]);

    if (!ready) return <PhotoGridSkeleton count={8} />;

    if (count === 0) {
        return (
            <EmptyState
                icon={<IconHeartOff size={26} />}
                title="No favourites yet"
                description="Tap the heart on any photo and it'll show up here. Favourites are stored in this browser only — no account needed."
            >
                <Link
                    href="/discover"
                    className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
                >
                    Find some photos
                </Link>
            </EmptyState>
        );
    }

    const hasMore = loadedCount < ids.length;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between gap-4">
                <p className="text-sm text-fg-muted">
                    {count} saved {count === 1 ? "photo" : "photos"} in this browser
                </p>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                        if (confirm("Remove all favourites? This can't be undone.")) clear();
                    }}
                >
                    <IconTrash size={16} />
                    Clear all
                </Button>
            </div>

            {loading && photos.length === 0 ? (
                <PhotoGridSkeleton count={8} />
            ) : (
                <div className={gridColumns}>
                    {photos.map((photo) => (
                        <PhotoCard key={photo.id} item={photo} />
                    ))}
                </div>
            )}

            <div className="flex justify-center py-10">
                {loading && photos.length > 0 && <Spinner className="text-brand" size={24} />}
                {!loading && hasMore && (
                    <Button variant="outline" onClick={() => setLoadedCount((prev) => prev + BATCH)}>
                        Load more
                    </Button>
                )}
            </div>
        </div>
    );
};

export default FavoritesGallery;
