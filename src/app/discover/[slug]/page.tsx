import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import PhotoGrid from "@/components/photo/PhotoGrid";
import CategoryRail from "@/components/home/CategoryRail";
import FilterBar from "@/components/search/FilterBar";
import Notice from "@/components/ui/Notice";
import { categories, getCategory } from "@/lib/categories";
import { emptyPage, searchPhotos } from "@/lib/pexels";
import { Orientation, PhotoSize } from "@/_types";

export const revalidate = 3600;

interface PageProps {
    params: Promise<{ slug: string }>;
    searchParams: Promise<{ orientation?: string; size?: string; color?: string }>;
}

const ORIENTATIONS = ["landscape", "portrait", "square"];
const SIZES = ["large", "medium", "small"];

export function generateStaticParams() {
    return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const category = getCategory((await params).slug);
    if (!category) return { title: "Category not found" };

    return {
        title: `${category.name} photos`,
        description: `${category.description} Free ${category.name.toLowerCase()} stock photos, downloadable at any size.`,
        alternates: { canonical: `/discover/${category.slug}` }
    };
}

const CategoryPage = async ({ params, searchParams }: PageProps) => {
    const category = getCategory((await params).slug);
    if (!category) notFound();

    const filters = await searchParams;
    const orientation = ORIENTATIONS.includes(filters.orientation ?? "")
        ? (filters.orientation as Orientation)
        : undefined;
    const size = SIZES.includes(filters.size ?? "") ? (filters.size as PhotoSize) : undefined;
    const color = filters.color || undefined;

    let initial = emptyPage();
    let failed = false;

    try {
        initial = await searchPhotos(category.query, { orientation, size, color });
    } catch {
        failed = true;
    }

    const endpointParams = new URLSearchParams({ query: category.query });
    if (orientation) endpointParams.set("orientation", orientation);
    if (size) endpointParams.set("size", size);
    if (color) endpointParams.set("color", color);

    return (
        <Container className="py-8 md:py-12">
            <PageHeader
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Discover", href: "/discover" },
                    { label: category.name }
                ]}
                title={`${category.name} photos`}
                description={category.description}
                meta={
                    initial.totalResults ? (
                        <span>{initial.totalResults.toLocaleString()} free photos</span>
                    ) : undefined
                }
            />

            <div className="mt-8">
                <CategoryRail activeSlug={category.slug} />
            </div>

            <div className="mt-6">
                <FilterBar />
            </div>

            {failed && (
                <div className="mt-6">
                    <Notice>This category couldn&apos;t load right now. Try again in a moment.</Notice>
                </div>
            )}

            <div className="mt-8">
                <PhotoGrid
                    initial={initial}
                    endpoint={`/api/photos?${endpointParams.toString()}`}
                    emptyTitle={`No ${category.name.toLowerCase()} photos matched`}
                    emptyDescription="Your filters may be too narrow — try clearing one."
                />
            </div>
        </Container>
    );
};

export default CategoryPage;
