import Link from "next/link";
import { IconArrowRight, IconBolt, IconCrop, IconLink } from "@tabler/icons-react";

import Container from "@/components/ui/Container";
import Hero from "@/components/home/Hero";
import CategoryRail from "@/components/home/CategoryRail";
import PhotoGrid from "@/components/photo/PhotoGrid";
import Notice from "@/components/ui/Notice";
import { emptyPage, getCuratedPhotos, getRandomPhoto } from "@/lib/pexels";

// Rendered per request so the hero photo is new on every visit. The Pexels
// calls underneath are still fetch-cached, so this costs almost no rate limit.
export const dynamic = "force-dynamic";

/** Used only if Pexels is unreachable. */
const heroImages = [
    "/hero/i-1.jpg", "/hero/i-2.jpg", "/hero/i-3.jpg", "/hero/i-4.jpg", "/hero/i-5.jpg",
    "/hero/i-6.jpg", "/hero/i-7.jpg", "/hero/i-8.jpg", "/hero/i-9.jpg", "/hero/i-10.jpg",
    "/hero/i-11.jpg", "/hero/i-12.jpg", "/hero/i-13.jpg", "/hero/i-14.jpg", "/hero/i-15.jpg"
];

const features = [
    {
        icon: IconCrop,
        title: "Any size you need",
        body: "Pick a preset or type exact pixels. Aspect ratio stays locked unless you unlock it."
    },
    {
        icon: IconLink,
        title: "Hotlink or download",
        body: "Every photo gets a stable URL you can drop straight into an <img> tag, or download as a file."
    },
    {
        icon: IconBolt,
        title: "Random placeholders",
        body: "Need filler? /image?random=1&query=nature returns a fresh photo on every request."
    }
];

const Page = async () => {
    const fallbackSrc = heroImages[Math.floor(Math.random() * heroImages.length)];

    let initial = emptyPage();
    let failed = false;

    // The hero and the grid are independent — fetch them together.
    const [curated, heroPhoto] = await Promise.all([
        getCuratedPhotos().catch(() => null),
        getRandomPhoto("landscape scenery", { orientation: "landscape" })
    ]);

    if (curated) initial = curated;
    else failed = true;

    return (
        <>
            <Hero photo={heroPhoto} fallbackSrc={fallbackSrc} />

            <Container className="pt-10">
                <CategoryRail />
            </Container>

            <Container className="pt-10">
                <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Curated for you</h2>
                        <p className="mt-1.5 text-sm text-fg-muted">
                            Fresh picks from the Pexels editorial feed, updated hourly.
                        </p>
                    </div>
                    <Link
                        href="/discover"
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand transition-opacity hover:opacity-75"
                    >
                        Browse all categories
                        <IconArrowRight size={16} />
                    </Link>
                </div>

                {failed && (
                    <div className="mb-6">
                        <Notice>
                            Couldn&apos;t reach Pexels just now — the feed may be rate limited. Try refreshing in a
                            minute.
                        </Notice>
                    </div>
                )}

                <PhotoGrid
                    initial={initial}
                    endpoint="/api/photos"
                    emptyTitle="Nothing to show yet"
                    emptyDescription="The curated feed is unavailable right now. Try a search or come back shortly."
                />
            </Container>

            <Container className="mt-6">
                <section className="overflow-hidden rounded-3xl border border-border bg-bg-subtle p-8 md:p-12">
                    <div className="max-w-2xl">
                        <span className="text-xs font-semibold uppercase tracking-wider text-brand">
                            For developers
                        </span>
                        <h2 className="mt-3 text-2xl font-semibold tracking-tight md:text-3xl">
                            Placeholder images without the placeholder look
                        </h2>
                        <p className="mt-3 text-base text-fg-muted">
                            Imagisum turns any Pexels photo into a resizable URL. Point an{" "}
                            <code className="rounded-md bg-bg-inset px-1.5 py-0.5 font-mono text-sm">img</code> tag at
                            it and you get a real photograph at exactly the dimensions your layout expects.
                        </p>
                    </div>

                    <div className="mt-8 grid gap-6 md:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.title}>
                                <div className="flex size-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
                                    <feature.icon size={20} />
                                </div>
                                <h3 className="mt-3.5 font-semibold tracking-tight">{feature.title}</h3>
                                <p className="mt-1.5 text-sm leading-relaxed text-fg-muted">{feature.body}</p>
                            </div>
                        ))}
                    </div>

                    <Link
                        href="/docs"
                        className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
                    >
                        Read the API docs
                        <IconArrowRight size={17} />
                    </Link>
                </section>
            </Container>
        </>
    );
};

export default Page;
