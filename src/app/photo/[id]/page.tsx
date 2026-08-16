import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { IconExternalLink, IconPalette, IconRuler, IconLayoutBoard, IconUser } from "@tabler/icons-react";

import Container from "@/components/ui/Container";
import PhotoCard from "@/components/photo/PhotoCard";
import CustomizePanel from "@/components/photo/CustomizePanel";
import FavoriteButton from "@/components/photo/FavoriteButton";
import { getPhotoSafe, searchPhotos } from "@/lib/pexels";
import { aspectLabel, orientationOf } from "@/lib/image-url";
import { PexelsPhoto } from "@/_types";

export const revalidate = 604800;

interface PageProps {
    params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
    const { id } = await params;
    const photo = await getPhotoSafe(id);

    if (!photo) return { title: "Photo not found" };

    const title = photo.alt || `Photo by ${photo.photographer}`;

    return {
        title,
        description: `${title} — free stock photo by ${photo.photographer}. Download it at any size, or hotlink it straight into your site.`,
        alternates: { canonical: `/photo/${photo.id}` },
        openGraph: {
            type: "article",
            title,
            images: [{ url: photo.src.large, width: 940, height: 650, alt: title }]
        }
    };
}

/** Related photos come from the alt text, which reads like a caption. */
async function relatedPhotos(photo: PexelsPhoto): Promise<PexelsPhoto[]> {
    const keywords = (photo.alt || "")
        .split(/\s+/)
        .filter((word) => word.length > 3)
        .slice(0, 3)
        .join(" ");

    try {
        const result = await searchPhotos(keywords || "photography", { perPage: 12 });
        return result.photos.filter((item) => item.id !== photo.id).slice(0, 8);
    } catch {
        return [];
    }
}

const PhotoPage = async ({ params }: PageProps) => {
    const { id } = await params;
    if (!/^\d+$/.test(id)) notFound();

    const photo = await getPhotoSafe(id);
    if (!photo) notFound();

    const related = await relatedPhotos(photo);
    const title = photo.alt || `Photo by ${photo.photographer}`;

    const stats = [
        { icon: IconRuler, label: "Dimensions", value: `${photo.width} × ${photo.height}` },
        { icon: IconLayoutBoard, label: "Aspect ratio", value: aspectLabel(photo.width, photo.height) },
        { icon: IconUser, label: "Orientation", value: orientationOf(photo.width, photo.height) },
        { icon: IconPalette, label: "Average colour", value: photo.avg_color ?? "—", swatch: photo.avg_color }
    ];

    return (
        <Container className="py-6 md:py-10">
            <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1.5 text-sm text-fg-subtle">
                <Link href="/" className="transition-colors hover:text-fg">
                    Home
                </Link>
                <span>/</span>
                <Link href="/discover" className="transition-colors hover:text-fg">
                    Photos
                </Link>
                <span>/</span>
                <span className="truncate text-fg-muted">{title}</span>
            </nav>

            <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-10">
                <div>
                    <div
                        className="flex items-center justify-center overflow-hidden rounded-2xl border border-border"
                        style={{ backgroundColor: photo.avg_color ?? undefined }}
                    >
                        <Image
                            src={photo.src.large2x || photo.src.large}
                            alt={title}
                            width={photo.width}
                            height={photo.height}
                            priority
                            sizes="(max-width: 1024px) 100vw, 60vw"
                            className="max-h-[76vh] w-auto object-contain"
                        />
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                        <div className="flex min-w-0 flex-1 items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-brand-soft text-base font-semibold text-brand">
                                {photo.photographer.charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                                <p className="truncate font-semibold tracking-tight">{photo.photographer}</p>
                                <Link
                                    href={photo.photographer_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="inline-flex items-center gap-1 text-sm text-fg-muted transition-colors hover:text-brand"
                                >
                                    View profile
                                    <IconExternalLink size={13} />
                                </Link>
                            </div>
                        </div>

                        <FavoriteButton id={photo.id} withLabel />
                        <Link
                            href={photo.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex h-11 items-center gap-2 rounded-xl border border-border px-4 text-sm font-medium text-fg-muted transition-colors hover:border-border-strong hover:text-fg"
                        >
                            View on Pexels
                            <IconExternalLink size={16} />
                        </Link>
                    </div>

                    <h1 className="mt-6 text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>

                    <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                        {stats.map((stat) => (
                            <div key={stat.label} className="rounded-2xl border border-border bg-bg-subtle p-4">
                                <dt className="flex items-center gap-1.5 text-xs font-medium text-fg-subtle">
                                    <stat.icon size={14} />
                                    {stat.label}
                                </dt>
                                <dd className="mt-1.5 flex items-center gap-2 font-mono text-sm capitalize text-fg">
                                    {stat.swatch && (
                                        <span
                                            className="size-3.5 shrink-0 rounded border border-border"
                                            style={{ backgroundColor: stat.swatch }}
                                        />
                                    )}
                                    <span className="truncate">{stat.value}</span>
                                </dd>
                            </div>
                        ))}
                    </dl>

                    <p className="mt-6 text-sm leading-relaxed text-fg-muted">
                        Free to use under the{" "}
                        <Link
                            href="https://www.pexels.com/license/"
                            target="_blank"
                            rel="noreferrer"
                            className="font-medium text-brand underline underline-offset-2"
                        >
                            Pexels licence
                        </Link>{" "}
                        — no attribution required, though crediting {photo.photographer} is always appreciated.
                    </p>
                </div>

                <aside className="lg:sticky lg:top-24 lg:h-max">
                    <div className="rounded-2xl border border-border bg-bg-elevated p-5 md:p-6">
                        <h2 className="text-lg font-semibold tracking-tight">Customise & download</h2>
                        <p className="mt-1 text-sm text-fg-muted">
                            Set the exact dimensions your layout needs — we resize on the fly.
                        </p>
                        <div className="mt-6">
                            <CustomizePanel photo={photo} />
                        </div>
                    </div>
                </aside>
            </div>

            {related.length > 0 && (
                <section className="mt-16 border-t border-border pt-10">
                    <h2 className="text-xl font-semibold tracking-tight md:text-2xl">Related photos</h2>
                    <div className="mt-6 columns-2 gap-3 sm:gap-4 lg:columns-3 2xl:columns-4">
                        {related.map((item) => (
                            <PhotoCard key={item.id} item={item} />
                        ))}
                    </div>
                </section>
            )}
        </Container>
    );
};

export default PhotoPage;
