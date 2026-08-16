import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconPhoto, IconLayoutGrid } from "@tabler/icons-react";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import { getCollectionPhotos, getFeaturedCollections } from "@/lib/pexels";
import { PexelsCollection } from "@/_types";

export const revalidate = 86400;

export const metadata: Metadata = {
    title: "Featured collections",
    description:
        "Curated photo collections from the Pexels editorial team — themed sets of free stock images ready to download at any size.",
    alternates: { canonical: "/collections" }
};

async function coverFor(id: string): Promise<string | null> {
    try {
        const result = await getCollectionPhotos(id, { perPage: 1 });
        return result.photos[0]?.src.large ?? null;
    } catch {
        return null;
    }
}

const CollectionsPage = async () => {
    let collections: PexelsCollection[] = [];
    let failed = false;

    try {
        const result = await getFeaturedCollections({ perPage: 15 });
        collections = result.collections.filter((collection) => collection.photos_count > 0);
    } catch {
        failed = true;
    }

    const covers = await Promise.all(collections.map((collection) => coverFor(collection.id)));

    return (
        <Container className="py-8 md:py-12">
            <PageHeader
                breadcrumbs={[{ label: "Home", href: "/" }, { label: "Collections" }]}
                title="Featured collections"
                description="Themed sets put together by the Pexels editorial team. Open one to browse and resize every photo inside."
            />

            {failed || collections.length === 0 ? (
                <EmptyState
                    icon={<IconLayoutGrid size={26} />}
                    title="Collections are unavailable"
                    description="The Pexels collections feed didn't respond. Browse categories instead — they cover the same ground."
                >
                    <Link
                        href="/discover"
                        className="inline-flex h-11 items-center rounded-xl bg-brand px-5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
                    >
                        Go to Discover
                    </Link>
                </EmptyState>
            ) : (
                <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {collections.map((collection, index) => {
                        const cover = covers[index];

                        return (
                            <Link
                                key={collection.id}
                                href={`/collections/${collection.id}`}
                                className="group overflow-hidden rounded-2xl border border-border bg-bg-elevated transition-colors hover:border-border-strong"
                            >
                                <div className="relative aspect-16/10 overflow-hidden bg-bg-inset">
                                    {cover ? (
                                        <Image
                                            src={cover}
                                            alt=""
                                            fill
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-fg-subtle">
                                            <IconPhoto size={28} />
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <h2 className="truncate font-semibold tracking-tight">{collection.title}</h2>
                                    {collection.description && (
                                        <p className="mt-1.5 line-clamp-2 text-sm text-fg-muted">
                                            {collection.description}
                                        </p>
                                    )}
                                    <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-fg-subtle">
                                        <IconPhoto size={14} />
                                        {collection.photos_count.toLocaleString()} photos
                                    </p>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </Container>
    );
};

export default CollectionsPage;
