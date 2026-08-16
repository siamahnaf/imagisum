import type { Metadata } from "next";
import { IconPhoto } from "@tabler/icons-react";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import PhotoGrid from "@/components/photo/PhotoGrid";
import Notice from "@/components/ui/Notice";
import { emptyPage, findFeaturedCollection, getCollectionPhotos } from "@/lib/pexels";

export const revalidate = 3600;

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const collection = await findFeaturedCollection(id);
    const title = collection?.title ?? "Collection";

    return {
        title,
        description: collection?.description ?? `Free stock photos from the ${title} collection, resizable on download.`,
        alternates: { canonical: `/collections/${id}` }
    };
}

const CollectionPage = async ({ params }: PageProps) => {
    const { id } = await params;

    const collection = await findFeaturedCollection(id);

    let initial = emptyPage();
    let failed = false;

    try {
        initial = await getCollectionPhotos(id);
    } catch {
        failed = true;
    }

    return (
        <Container className="py-8 md:py-12">
            <PageHeader
                breadcrumbs={[
                    { label: "Home", href: "/" },
                    { label: "Collections", href: "/collections" },
                    { label: collection?.title ?? "Collection" }
                ]}
                title={collection?.title ?? "Collection"}
                description={collection?.description ?? undefined}
                meta={
                    collection ? (
                        <span className="inline-flex items-center gap-1.5">
                            <IconPhoto size={15} />
                            {collection.photos_count.toLocaleString()} photos
                        </span>
                    ) : undefined
                }
            />

            {failed && (
                <div className="mt-6">
                    <Notice>This collection couldn&apos;t be loaded. It may be private or temporarily unavailable.</Notice>
                </div>
            )}

            <div className="mt-8">
                <PhotoGrid
                    initial={initial}
                    endpoint={`/api/collections/${id}`}
                    emptyTitle="This collection is empty"
                    emptyDescription="It may contain only videos, which Imagisum doesn't serve."
                />
            </div>
        </Container>
    );
};

export default CollectionPage;
