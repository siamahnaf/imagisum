import type { Metadata } from "next";
import Link from "next/link";
import { IconArrowRight, IconInfoCircle } from "@tabler/icons-react";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import CodeBlock from "@/components/docs/CodeBlock";

export const metadata: Metadata = {
    title: "Image API",
    description:
        "Serve real stock photos as placeholders. One endpoint, any dimensions, optional random mode — no key required.",
    alternates: { canonical: "/docs" }
};

const params = [
    { name: "id", type: "number", required: "Required*", body: "Pexels photo id. Every photo page shows it in the URL." },
    { name: "random", type: "0 | 1", required: "Required*", body: "Returns a different photo on every request. Use instead of `id`." },
    { name: "query", type: "string", required: "Optional", body: "Narrows random mode to a subject, e.g. `nature`, `office`." },
    { name: "width", type: "16–6000", required: "Optional", body: "Output width in pixels. Alias: `w`." },
    { name: "height", type: "16–6000", required: "Optional", body: "Output height in pixels. Alias: `h`." },
    { name: "fit", type: "crop | contain", required: "Optional", body: "`crop` fills the box and trims overflow (default). `contain` fits inside it." },
    { name: "download", type: "0 | 1", required: "Optional", body: "Sends `Content-Disposition: attachment` so browsers save the file." }
];

const sections = [
    { id: "quick-start", label: "Quick start" },
    { id: "parameters", label: "Parameters" },
    { id: "sizes", label: "Custom sizes" },
    { id: "random", label: "Random images" },
    { id: "json", label: "JSON endpoints" },
    { id: "notes", label: "Notes & limits" }
];

const DocsPage = () => (
    <Container className="py-8 md:py-12">
        <PageHeader
            breadcrumbs={[{ label: "Home", href: "/" }, { label: "API" }]}
            title="Image API"
            description="One endpoint that turns any Pexels photo into a resizable, hotlinkable URL. No key, no signup — just point an img tag at it."
        />

        <div className="mt-10 grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-14">
            <nav className="lg:sticky lg:top-24 lg:h-max">
                <p className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">On this page</p>
                <ul className="mt-3 space-y-1">
                    {sections.map((section) => (
                        <li key={section.id}>
                            <a
                                href={`#${section.id}`}
                                className="block rounded-lg px-3 py-2 text-sm text-fg-muted transition-colors hover:bg-bg-inset hover:text-fg"
                            >
                                {section.label}
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            <div className="min-w-0 max-w-3xl space-y-14">
                <section id="quick-start" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold tracking-tight">Quick start</h2>
                    <p className="mt-3 text-fg-muted">
                        Every photo on Imagisum is served from a single route. Give it an id and the dimensions you
                        want:
                    </p>
                    <CodeBlock
                        className="mt-5"
                        code={`<img
  src="https://imagisum.vercel.app/image?id=1181671&width=800&height=450"
  width="800"
  height="450"
  alt="Free stock photo"
/>`}
                    />
                    <p className="mt-4 text-sm text-fg-muted">
                        Prefer the UI? Open any photo, set the size, and copy the ready-made snippet.{" "}
                        <Link href="/discover" className="font-medium text-brand underline underline-offset-2">
                            Browse photos
                        </Link>
                        .
                    </p>
                </section>

                <section id="parameters" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold tracking-tight">Parameters</h2>
                    <p className="mt-3 text-fg-muted">
                        <code className="rounded-md bg-bg-inset px-1.5 py-0.5 font-mono text-sm">GET /image</code>
                    </p>

                    <div className="mt-5 overflow-x-auto rounded-2xl border border-border">
                        <table className="w-full min-w-[560px] text-left text-sm">
                            <thead className="bg-bg-subtle text-xs uppercase tracking-wider text-fg-subtle">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Param</th>
                                    <th className="px-4 py-3 font-semibold">Type</th>
                                    <th className="px-4 py-3 font-semibold">Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                {params.map((param) => (
                                    <tr key={param.name} className="border-t border-border align-top">
                                        <td className="px-4 py-3">
                                            <span className="font-mono font-semibold text-fg">{param.name}</span>
                                            <span className="mt-1 block text-xs text-fg-subtle">{param.required}</span>
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-brand">
                                            {param.type}
                                        </td>
                                        <td className="px-4 py-3 text-fg-muted">{param.body}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <p className="mt-4 flex items-start gap-2 text-sm text-fg-subtle">
                        <IconInfoCircle size={17} className="mt-0.5 shrink-0" />
                        <span>* Pass either `id` or `random=1` — one of the two is required.</span>
                    </p>
                </section>

                <section id="sizes" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold tracking-tight">Custom sizes</h2>
                    <p className="mt-3 text-fg-muted">
                        Width and height are independent. Give both and the photo is cropped to fill that exact box;
                        give one and the other scales to keep the original ratio.
                    </p>
                    <CodeBlock
                        className="mt-5"
                        code={`/image?id=1181671&width=400            → 400px wide, ratio preserved
/image?id=1181671&width=400&height=400 → square, cropped to fill
/image?id=1181671&width=400&height=400&fit=contain → square, letterboxed
/image?id=1181671&width=400&download=1 → saves as a file`}
                    />
                    <p className="mt-4 text-sm text-fg-muted">
                        Dimensions are clamped to 16–6000px. Requests for a specific id are immutable and cached for a
                        year, so they are effectively free after the first hit.
                    </p>
                </section>

                <section id="random" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold tracking-tight">Random images</h2>
                    <p className="mt-3 text-fg-muted">
                        Drop the id and ask for a random photo instead — ideal for mockups where you want real
                        photography rather than grey boxes.
                    </p>
                    <CodeBlock
                        className="mt-5"
                        code={`<!-- any curated photo, 600×400 -->
<img src="/image?random=1&width=600&height=400" alt="" />

<!-- narrowed to a subject -->
<img src="/image?random=1&query=mountains&width=1200&height=630" alt="" />`}
                    />
                    <p className="mt-4 text-sm text-fg-muted">
                        Random responses are sent with <code className="font-mono">no-store</code>, so each request
                        genuinely returns a different photo.
                    </p>
                </section>

                <section id="json" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold tracking-tight">JSON endpoints</h2>
                    <p className="mt-3 text-fg-muted">
                        The same data powering this site is available as JSON if you would rather build your own
                        gallery.
                    </p>
                    <CodeBlock
                        className="mt-5"
                        code={`GET /api/photos?query=nature&page=1&per_page=24
GET /api/photos?orientation=landscape&color=blue
GET /api/photos/1181671
GET /api/collections/{collectionId}?page=1`}
                    />
                    <p className="mt-4 text-sm text-fg-muted">
                        List endpoints return{" "}
                        <code className="font-mono text-xs">{`{ photos, page, perPage, totalResults, nextPage }`}</code>.
                        When <code className="font-mono text-xs">nextPage</code> is <code className="font-mono text-xs">null</code>,
                        you have reached the end.
                    </p>
                </section>

                <section id="notes" className="scroll-mt-24">
                    <h2 className="text-2xl font-semibold tracking-tight">Notes & limits</h2>
                    <ul className="mt-4 space-y-3 text-fg-muted">
                        <li className="flex gap-3">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                            Photos come from Pexels and are free for personal and commercial use under the{" "}
                            <Link
                                href="https://www.pexels.com/license/"
                                target="_blank"
                                rel="noreferrer"
                                className="font-medium text-brand underline underline-offset-2"
                            >
                                Pexels licence
                            </Link>
                            .
                        </li>
                        <li className="flex gap-3">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                            Upstream rate limits apply. If a page shows a warning banner, that is Pexels throttling —
                            wait a minute and retry.
                        </li>
                        <li className="flex gap-3">
                            <span className="mt-2 size-1.5 shrink-0 rounded-full bg-brand" />
                            This is a hobby project, not a CDN. Use it for prototypes, demos and mockups rather than
                            high-traffic production pages.
                        </li>
                    </ul>

                    <Link
                        href="/discover"
                        className="mt-8 inline-flex h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-fg transition-colors hover:bg-brand-hover"
                    >
                        Start browsing photos
                        <IconArrowRight size={17} />
                    </Link>
                </section>
            </div>
        </div>
    </Container>
);

export default DocsPage;
