"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { IconHeart, IconHeartFilled, IconArrowDownToArc, IconPhoto } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

import CustomizeDialog from "./CustomizeDialog";
import { PexelsPhoto } from "@/_types";
import { useFavorites } from "@/lib/use-favorites";
import { orientationOf } from "@/lib/image-url";

interface Props {
    item: PexelsPhoto;
    /** Set on the first screenful so the LCP image isn't lazy loaded. */
    priority?: boolean;
    className?: string;
}

const PhotoCard = ({ item, priority, className }: Props) => {
    const [dialogOpen, setDialogOpen] = useState(false);
    // Mount the dialog on first open and keep it, so it can animate out.
    const [dialogMounted, setDialogMounted] = useState(false);
    const { isFavorite, toggle, ready } = useFavorites();

    const favorite = ready && isFavorite(item.id);
    const alt = item.alt || `Photo by ${item.photographer}`;

    return (
        <>
            <article
                className={twMerge(
                    "group relative mb-4 break-inside-avoid overflow-hidden rounded-2xl bg-bg-inset",
                    className
                )}
            >
                <Link
                    href={`/photo/${item.id}`}
                    className="block focus-visible:outline-none"
                    aria-label={alt}
                >
                    <span
                        className="block w-full"
                        style={{ backgroundColor: item.avg_color || undefined }}
                    >
                        <Image
                            src={item.src.large || "/placeholder.svg"}
                            alt={alt}
                            width={item.width}
                            height={item.height}
                            priority={priority}
                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1440px) 33vw, 25vw"
                            className="h-auto w-full transition-transform duration-500 group-hover:scale-[1.03]"
                        />
                    </span>

                    {/* Hover scrim + credit */}
                    <span className="pointer-events-none absolute inset-0 bg-linear-to-t from-black/75 via-black/10 to-black/25 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
                    <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-2 p-4 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100">
                        <span className="block truncate text-sm font-semibold text-white">{item.photographer}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-white/70">
                            <IconPhoto size={13} />
                            {item.width} × {item.height}
                            <span className="capitalize">· {orientationOf(item.width, item.height)}</span>
                        </span>
                    </span>
                </Link>

                {/* Actions sit outside the Link so they stay independently clickable */}
                <div className="absolute right-3 top-3 flex translate-y-2 items-center gap-2 opacity-0 transition-all duration-200 focus-within:translate-y-0 focus-within:opacity-100 group-hover:translate-y-0 group-hover:opacity-100">
                    <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        aria-label={favorite ? "Remove from favourites" : "Add to favourites"}
                        aria-pressed={favorite}
                        className="inline-flex size-9 items-center justify-center rounded-xl bg-white/95 text-neutral-800 shadow-sm backdrop-blur transition-transform hover:scale-105 active:scale-95"
                    >
                        {favorite ? <IconHeartFilled size={17} className="text-rose-500" /> : <IconHeart size={17} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setDialogMounted(true);
                            setDialogOpen(true);
                        }}
                        aria-label="Customise and download"
                        className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-brand px-3 text-xs font-semibold text-brand-fg shadow-sm transition-transform hover:scale-105 active:scale-95"
                    >
                        <IconArrowDownToArc size={16} />
                        Get
                    </button>
                </div>

                {/* Favourited photos keep a persistent marker when not hovered */}
                {favorite && (
                    <span className="pointer-events-none absolute left-3 top-3 inline-flex size-7 items-center justify-center rounded-lg bg-black/45 text-rose-400 backdrop-blur transition-opacity group-hover:opacity-0">
                        <IconHeartFilled size={14} />
                    </span>
                )}
            </article>

            {dialogMounted && (
                <CustomizeDialog open={dialogOpen} onClose={() => setDialogOpen(false)} photo={item} />
            )}
        </>
    );
};

export default PhotoCard;
