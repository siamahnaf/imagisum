import Link from "next/link";
import Image from "next/image";
import { IconBrandGithubFilled, IconWorld } from "@tabler/icons-react";

import Container from "../ui/Container";
import Logo from "./Logo";
import { categories } from "@/lib/categories";

const columns = [
    {
        title: "Browse",
        links: [
            { label: "Home", href: "/" },
            { label: "Discover", href: "/discover" },
            { label: "Collections", href: "/collections" },
            { label: "Favourites", href: "/favorites" }
        ]
    },
    {
        title: "Developers",
        links: [
            { label: "Image API", href: "/docs" },
            { label: "Random image", href: "/docs#random" },
            { label: "Custom sizes", href: "/docs#sizes" },
            { label: "Source code", href: "https://github.com/siamahnaf/imagisum" }
        ]
    }
];

const Footer = () => (
    <footer className="mt-24 border-t border-border bg-bg-subtle">
        <Container className="py-14">
            <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
                <div className="lg:col-span-1">
                    <Logo />
                    <p className="mt-4 max-w-xs text-sm leading-relaxed text-fg-muted">
                        Lorem Ipsum, but for photos. Search millions of free stock images and download them at any
                        size you need — or hotlink them straight into your markup.
                    </p>
                    <div className="mt-5 flex items-center gap-2">
                        <Link
                            href="https://github.com/siamahnaf/imagisum"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="GitHub"
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:text-fg"
                        >
                            <IconBrandGithubFilled size={17} />
                        </Link>
                        <Link
                            href="https://siamahnaf.com/"
                            target="_blank"
                            rel="noreferrer"
                            aria-label="Website"
                            className="inline-flex size-9 items-center justify-center rounded-lg border border-border text-fg-muted transition-colors hover:text-fg"
                        >
                            <IconWorld size={17} />
                        </Link>
                    </div>
                </div>

                {columns.map((column) => (
                    <div key={column.title}>
                        <h4 className="text-sm font-semibold tracking-tight">{column.title}</h4>
                        <ul className="mt-4 space-y-2.5">
                            {column.links.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        href={link.href}
                                        className="text-sm text-fg-muted transition-colors hover:text-brand"
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>
                ))}

                <div>
                    <h4 className="text-sm font-semibold tracking-tight">Popular categories</h4>
                    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2.5">
                        {categories.slice(0, 10).map((category) => (
                            <li key={category.slug}>
                                <Link
                                    href={`/discover/${category.slug}`}
                                    className="text-sm text-fg-muted transition-colors hover:text-brand"
                                >
                                    {category.name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            <div className="mt-12 flex flex-col items-start justify-between gap-4 border-t border-border pt-6 sm:flex-row sm:items-center">
                <p className="text-sm text-fg-muted">
                    Built by{" "}
                    <Link
                        href="https://siamahnaf.com/"
                        target="_blank"
                        rel="noreferrer"
                        className="font-medium text-brand underline underline-offset-2"
                    >
                        Siam Ahnaf
                    </Link>
                    . Free for personal and commercial use.
                </p>
                <div className="flex items-center gap-2.5 text-sm text-fg-muted">
                    Photos by
                    <Link href="https://www.pexels.com" target="_blank" rel="noreferrer">
                        <Image
                            src="/pexels.png"
                            width={500}
                            height={281}
                            alt="Pexels"
                            className="w-[86px] dark:brightness-0 dark:invert"
                        />
                    </Link>
                </div>
            </div>
        </Container>
    </footer>
);

export default Footer;
