"use client"
import { useEffect, useState, useRef, useCallback } from "react";
import Spinner from "./ui/Spinner";
import { Masonry } from "react-plock";
import { IconBugFilled } from "@tabler/icons-react";

//Components
import ImageCard from "./ImageCard";


//Interface
import { PexelsPhoto } from "@/_types";
interface ImageGalleryProps {
    searchQuery: string
}

const ImageGallery = ({ searchQuery }: ImageGalleryProps) => {
    //State
    const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const observerTarget = useRef<HTMLDivElement>(null);

    //Effect
    useEffect(() => {
        setPhotos([])
        setPage(1)
        setHasMore(true)
        setLoading(true)
        fetchPhotos(1, searchQuery)
    }, [searchQuery]);
    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
                    loadMore()
                }
            },
            { threshold: 0.1 },
        )

        const currentTarget = observerTarget.current
        if (currentTarget) {
            observer.observe(currentTarget)
        }

        return () => {
            if (currentTarget) {
                observer.unobserve(currentTarget)
            }
        }
    }, [hasMore, loadingMore, loading]);

    const fetchPhotos = async (pageNum: number, query: string) => {
        try {
            const url = query
                ? `/api/photos?page=${pageNum}&query=${encodeURIComponent(query)}`
                : `/api/photos?page=${pageNum}`

            const response = await fetch(url)
            const data = await response.json()

            if (data.photos && data.photos.length > 0) {
                setPhotos((prev) => (pageNum === 1 ? data.photos : [...prev, ...data.photos]))
                setHasMore(data.photos.length === 15)
            } else {
                setHasMore(false)
            }
        } catch (error) {
            console.error("Error fetching photos:", error)
        } finally {
            setLoading(false)
            setLoadingMore(false)
        }
    }

    const loadMore = useCallback(() => {
        if (!hasMore || loadingMore) return
        setLoadingMore(true)
        const nextPage = page + 1
        setPage(nextPage)
        fetchPhotos(nextPage, searchQuery)
    }, [page, hasMore, loadingMore, searchQuery]);

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Spinner />
            </div>
        )
    }

    if (photos.length === 0) {
        return (
            <div className="py-20 text-center">
                <IconBugFilled className="mx-auto text-fuchsia-700" size={30} />
                <p className="text-xl text-medium">No images found</p>
                <p className="text-sm mt-1 text-gray-600">Try a different search term or again later</p>
            </div>
        )
    }

    return (
        <div className="mt-12">
            <Masonry
                items={photos}
                config={{
                    columns: [1, 2, 3],
                    gap: [12, 12, 12],
                    media: [640, 768, 1024]
                }}
                render={(item, i) => (
                    <ImageCard item={item} />
                )}
            />
            <div ref={observerTarget} className="flex items-center justify-center py-8">
                {loadingMore && <Spinner />}
            </div>
        </div>
    )
}

export default ImageGallery;