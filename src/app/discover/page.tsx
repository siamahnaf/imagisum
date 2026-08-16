import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IconArrowRight } from "@tabler/icons-react";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import { categories } from "@/lib/categories";
import { searchPhotos } from "@/lib/pexels";

// Cover art barely changes — refresh once a day and stay well inside rate limits.
export const revalidate = 86400;

export const metadata: Metadata = {
    title: "Discover categories",
    description:
        "Browse free stock photos by category — nature, business, technology, travel, food and more, all downloadable at any size.",
    alternates: { canonical: "/discover" }
};

async function coverFor(query: string): Promise<string | null> {
    try {
        const result = await searchPhotos(query, { perPage: 1 });
        return result.photos[0]?.src.large ?? null;
    } catch {
        return null;
    }
}

const DiscoverPage = async () => {
    const covers = await Promise.all(categories.map((category) => coverFor(category.query)));

    return (
        <Container className="py-8 md:py-12">
            <PageHeader
                breadcrumbs={[{ label: "Home", href: "/" }, { label: "Discover" }]}
                title="Discover by category"
                description="Eighteen hand-tuned collections covering the shots most projects need. Every photo is free to use and resizable on the fly."
            />

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((category, index) => {
                    const cover = covers[index];

                    return (
                        <Link
                            key={category.slug}
                            href={`/discover/${category.slug}`}
                            className="group relative flex h-56 flex-col justify-end overflow-hidden rounded-2xl p-6 md:h-64"
                        >
                            {cover ? (
                                <Image
                                    src={cover}
                                    alt=""
                                    fill
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                            ) : (
                                <div className={`absolute inset-0 bg-linear-to-br ${category.gradient}`} />
                            )}

                            <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/35 to-black/10 transition-opacity duration-300 group-hover:from-black/90" />

                            <div className="relative">
                                <h2 className="text-xl font-semibold tracking-tight text-white">{category.name}</h2>
                                <p className="mt-1.5 line-clamp-2 text-sm text-white/70">{category.description}</p>
                                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-white/0 transition-all duration-200 group-hover:text-white">
                                    Browse
                                    <IconArrowRight size={15} />
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </Container>
    );
};

export default DiscoverPage;
