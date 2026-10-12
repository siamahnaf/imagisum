import type { Metadata } from "next";
import { notFound } from "next/navigation";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import PhotoGrid from "@/components/photo/PhotoGrid";
import CategoryRail from "@/components/home/CategoryRail";
import Notice from "@/components/ui/Notice";
import { getCategory } from "@/lib/categories";
import { emptyPage, FALLBACK_MESSAGE, getCategoryPhotos } from "@/lib/photos";

/**
 * Rendered per request, so a Picsum fallback is never pinned in a cached page.
 * The Pixabay answer underneath is cached on the server for most of a day.
 */
export const dynamic = "force-dynamic";

interface PageProps {
    params: Promise<{ slug: string }>;
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

const CategoryPage = async ({ params }: PageProps) => {
    const category = getCategory((await params).slug);
    if (!category) notFound();

    let initial = emptyPage();
    let problem: string | null = null;

    try {
        initial = await getCategoryPhotos(category.query);
        if (initial.fallback) problem = FALLBACK_MESSAGE;
    } catch {
        problem = "This category couldn't load right now. Try again in a moment.";
    }

    return (
        <Container className="py-8 md:py-12">
            <PageHeader
                breadcrumbs={[{ label: "Home", href: "/" }, { label: category.name }]}
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

            {problem && (
                <div className="mt-6">
                    <Notice>{problem}</Notice>
                </div>
            )}

            <div className="mt-8">
                <PhotoGrid
                    initial={initial}
                    endpoint={`/api/photos?category=${category.slug}`}
                    emptyTitle={`No ${category.name.toLowerCase()} photos right now`}
                    emptyDescription="Try again shortly, or search for something specific."
                />
            </div>
        </Container>
    );
};

export default CategoryPage;
