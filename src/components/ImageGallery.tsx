"use client"
import { useEffect, useState, useRef, useCallback } from "react";
import Spinner from "./ui/Spinner";
import { Masonry } from "react-plock";
import { IconBugFilled } from "@tabler/icons-react";
import ImageCard from "./ImageCard";
import { PexelsPhoto } from "@/_types";

interface ImageGalleryProps {
    searchQuery: string;
}

const SKELETON_COUNT = 15;
const DEBOUNCE_MS = 400;

const ImageGallery = ({ searchQuery }: ImageGalleryProps) => {
    const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);

    const observerTarget = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);

    useEffect(() => {
        const t = setTimeout(() => setDebouncedQuery(searchQuery), DEBOUNCE_MS);
        return () => clearTimeout(t);
    }, [searchQuery]);

    useEffect(() => {
        setPhotos([]);
        setPage(1);
        setHasMore(true);
        setLoading(true);
        fetchPhotos(1, debouncedQuery);
    }, [debouncedQuery]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadMore();
                }
            },
            { threshold: 0.1 },
        );

        const currentTarget = observerTarget.current;
        if (currentTarget) observer.observe(currentTarget);
        return () => {
            if (currentTarget) observer.unobserve(currentTarget);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasMore, loadingMore, loading]);

    const fetchPhotos = async (pageNum: number, query: string) => {
        if (abortRef.current) abortRef.current.abort();
        const controller = new AbortController();
        abortRef.current = controller;

        try {
            const url = query
                ? `/api/photos?page=${pageNum}&query=${encodeURIComponent(query)}`
                : `/api/photos?page=${pageNum}`;
            const response = await fetch(url, { signal: controller.signal });
            const data = await response.json();

            if (data.photos && data.photos.length > 0) {
                setPhotos((prev) => (pageNum === 1 ? data.photos : [...prev, ...data.photos]));
                setHasMore(data.photos.length === 15);
            } else {
                setHasMore(false);
            }
        } catch {
            console.error("Error fetching photos");
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore) return;
        setLoadingMore(true);
        const nextPage = page + 1;
        setPage(nextPage);
        fetchPhotos(nextPage, debouncedQuery);
    }, [page, hasMore, loadingMore, debouncedQuery]);

    if (loading && photos.length === 0) {
        const skeletons = Array.from({ length: SKELETON_COUNT }).map((_, i) => ({
            id: i,
            height: 150 + ((i % 5) * 40),
        }));

        return (
            <div className="mt-12">
                <Masonry
                    items={skeletons}
                    config={{
                        columns: [1, 2, 3],
                        gap: [12, 12, 12],
                        media: [640, 768, 1024],
                        useBalancedLayout: true
                    }}
                    render={(item) => (
                        <div
                            key={item.id}
                            className="w-full rounded-xl animate-pulse bg-gray-200/80 dark:bg-gray-700/40"
                            style={{ height: item.height }}
                        />
                    )}

                />
            </div>
        );
    }

    if (photos.length === 0) {
        return (
            <div className="py-20 text-center">
                <IconBugFilled className="mx-auto text-fuchsia-700" size={30} />
                <p className="text-xl font-medium">No images found</p>
                <p className="text-sm mt-1 text-gray-600">Try a different search term or again later</p>
            </div>
        );
    }

    return (
        <div className="mt-12">
            <Masonry
                items={photos}
                config={{
                    columns: [1, 2, 3],
                    gap: [12, 12, 12],
                    media: [640, 768, 1024],
                    useBalancedLayout: true
                }}
                render={(item) => <ImageCard item={item} />}
            />
            <div ref={observerTarget} className="flex items-center justify-center py-8">
                {loadingMore && <Spinner />}
            </div>
        </div>
    );
};

export default ImageGallery;
