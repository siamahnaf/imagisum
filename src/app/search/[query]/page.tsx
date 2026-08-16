import type { Metadata } from "next";
import Link from "next/link";
import { IconSearch } from "@tabler/icons-react";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import PhotoGrid from "@/components/photo/PhotoGrid";
import FilterBar from "@/components/search/FilterBar";
import Notice from "@/components/ui/Notice";
import Chip from "@/components/ui/Chip";
import { emptyPage, searchPhotos } from "@/lib/pexels";
import { categories, popularSearches } from "@/lib/categories";
import { Orientation, PhotoSize } from "@/_types";

export const revalidate = 3600;

interface PageProps {
    params: Promise<{ query: string }>;
    searchParams: Promise<{ orientation?: string; size?: string; color?: string }>;
}

const ORIENTATIONS = ["landscape", "portrait", "square"];
const SIZES = ["large", "medium", "small"];

function decode(raw: string): string {
    try {
        return decodeURIComponent(raw);
    } catch {
        return raw;
    }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const term = decode((await params).query);

    return {
        title: `${term} — free stock photos`,
        description: `Free ${term} photos, downloadable at any size. Browse royalty-free ${term} images on Imagisum.`,
        alternates: { canonical: `/search/${encodeURIComponent(term)}` }
    };
}

const SearchPage = async ({ params, searchParams }: PageProps) => {
    const term = decode((await params).query).trim();
    const filters = await searchParams;

    const orientation = ORIENTATIONS.includes(filters.orientation ?? "")
        ? (filters.orientation as Orientation)
        : undefined;
    const size = SIZES.includes(filters.size ?? "") ? (filters.size as PhotoSize) : undefined;
    const color = filters.color || undefined;

    let initial = emptyPage();
    let failed = false;

    try {
        initial = await searchPhotos(term, { orientation, size, color });
    } catch {
        failed = true;
    }

    // Reflect the same filters in the infinite-scroll endpoint.
    const endpointParams = new URLSearchParams({ query: term });
    if (orientation) endpointParams.set("orientation", orientation);
    if (size) endpointParams.set("size", size);
    if (color) endpointParams.set("color", color);

    const related = [...categories.map((category) => category.name), ...popularSearches]
        .filter((label) => label.toLowerCase() !== term.toLowerCase())
        .slice(0, 8);

    const total = initial.totalResults;

    return (
        <Container className="py-8 md:py-12">
            <PageHeader
                breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }, { label: term }]}
                title={
                    <span className="flex flex-wrap items-baseline gap-2">
                        <span className="capitalize">{term}</span>
                        <span className="text-base font-normal text-fg-subtle">photos</span>
                    </span>
                }
                meta={
                    total !== null && total > 0 ? (
                        <span className="inline-flex items-center gap-1.5">
                            <IconSearch size={15} />
                            {total.toLocaleString()} free photos found
                        </span>
                    ) : undefined
                }
            />

            <div className="mt-6">
                <FilterBar />
            </div>

            {failed && (
                <div className="mt-6">
                    <Notice>Search is temporarily unavailable — Pexels may be rate limiting us. Try again shortly.</Notice>
                </div>
            )}

            <div className="mt-8">
                <PhotoGrid
                    initial={initial}
                    endpoint={`/api/photos?${endpointParams.toString()}`}
                    emptyTitle={`No results for “${term}”`}
                    emptyDescription="Check the spelling, drop a filter, or try one of the searches below."
                    emptyAction={
                        <div className="flex flex-wrap justify-center gap-2">
                            {popularSearches.slice(0, 6).map((suggestion) => (
                                <Chip key={suggestion} href={`/search/${encodeURIComponent(suggestion)}`}>
                                    {suggestion}
                                </Chip>
                            ))}
                        </div>
                    }
                />
            </div>

            <section className="mt-12 border-t border-border pt-8">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-fg-subtle">Related searches</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                    {related.map((label) => (
                        <Link
                            key={label}
                            href={`/search/${encodeURIComponent(label.toLowerCase())}`}
                            className="rounded-full border border-border px-4 py-2 text-sm text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
                        >
                            {label}
                        </Link>
                    ))}
                </div>
            </section>
        </Container>
    );
};

export default SearchPage;
