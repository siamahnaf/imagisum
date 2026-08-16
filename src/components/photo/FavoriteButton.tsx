"use client";
import { IconHeart, IconHeartFilled } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

import { useFavorites } from "@/lib/use-favorites";

interface Props {
    id: number;
    className?: string;
    withLabel?: boolean;
}

const FavoriteButton = ({ id, className, withLabel }: Props) => {
    const { isFavorite, toggle, ready } = useFavorites();
    const favorite = ready && isFavorite(id);

    return (
        <button
            type="button"
            onClick={() => toggle(id)}
            aria-pressed={favorite}
            aria-label={favorite ? "Remove from favourites" : "Save to favourites"}
            className={twMerge(
                "inline-flex h-11 items-center justify-center gap-2 rounded-xl border px-4 text-sm font-medium transition-colors",
                favorite
                    ? "border-rose-500/40 bg-rose-500/10 text-rose-500"
                    : "border-border text-fg-muted hover:border-border-strong hover:text-fg",
                className
            )}
        >
            {favorite ? <IconHeartFilled size={18} /> : <IconHeart size={18} />}
            {withLabel && (favorite ? "Saved" : "Save")}
        </button>
    );
};

export default FavoriteButton;
