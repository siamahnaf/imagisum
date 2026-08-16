"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    IconBrandGithubFilled,
    IconHeart,
    IconMenu2,
    IconX,
    IconCompass,
    IconLayoutGrid,
    IconCode,
    IconHome
} from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

import Container from "../ui/Container";
import Logo from "./Logo";
import ThemeToggle from "./ThemeToggle";
import SearchBar from "../search/SearchBar";
import { useFavorites } from "@/lib/use-favorites";
import { GITHUB_URL, HEADER_HEIGHT } from "@/lib/constants";

const navItems = [
    { href: "/", label: "Home", icon: IconHome },
    { href: "/discover", label: "Discover", icon: IconCompass },
    { href: "/collections", label: "Collections", icon: IconLayoutGrid },
    { href: "/docs", label: "API", icon: IconCode }
];

/** Mirrors the URL back into the search field on `/search/<term>` pages. */
function queryFromPath(pathname: string): string {
    if (!pathname.startsWith("/search/")) return "";
    try {
        return decodeURIComponent(pathname.slice("/search/".length));
    } catch {
        return "";
    }
}

const Header = () => {
    const pathname = usePathname();
    const isHome = pathname === "/";
    const query = queryFromPath(pathname);

    const [scrollY, setScrollY] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const { count, ready } = useFavorites();

    useEffect(() => {
        const onScroll = () => setScrollY(window.scrollY);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    // Close the mobile drawer whenever navigation happens.
    useEffect(() => setMenuOpen(false), [pathname]);

    useEffect(() => {
        document.body.style.overflow = menuOpen ? "hidden" : "";
        return () => {
            document.body.style.overflow = "";
        };
    }, [menuOpen]);

    // Three states: floating over the hero (home, before the hero scrolls away),
    // flat against the page (inner pages, at top), and lifted once content is
    // travelling underneath it.
    const HERO_HANDOFF = 320;
    const onHero = isHome && scrollY < HERO_HANDOFF;
    const scrolled = isHome ? scrollY >= HERO_HANDOFF : scrollY > 8;
    const showSearch = !isHome || scrollY >= HERO_HANDOFF;

    const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

    return (
        <>
            <header
                className={twMerge(
                    // No border-b in the base classes: the divider only exists in the
                    // scrolled state, so at the top there is zero border width to draw.
                    "fixed inset-x-0 top-0 z-50 transition-colors duration-300",
                    onHero
                        ? "bg-transparent"
                        : scrolled
                            ? "border-b border-border bg-bg/85 backdrop-blur-xl"
                            : "bg-bg"
                )}
                style={{ height: HEADER_HEIGHT }}
            >
                {/*
                 * Legibility scrim for the hero. It is deliberately taller than the
                 * bar and sits behind its contents: a gradient that stopped at the
                 * 72px edge left a visible seam against the hero's own overlay.
                 */}
                {isHome && (
                    <div
                        aria-hidden
                        className={twMerge(
                            "pointer-events-none absolute inset-x-0 top-0 -z-10 h-44 bg-linear-to-b from-black/65 via-black/25 to-transparent transition-opacity duration-300",
                            onHero ? "opacity-100" : "opacity-0"
                        )}
                    />
                )}

                <Container className="flex h-full items-center gap-3 lg:gap-6">
                    <Logo onDark={onHero} />

                    <nav className="hidden items-center gap-1 lg:flex">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={twMerge(
                                    "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                                    onHero
                                        ? "text-white/80 hover:bg-white/10 hover:text-white"
                                        : isActive(item.href)
                                            ? "bg-bg-inset text-fg"
                                            : "text-fg-muted hover:text-fg"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div
                        className={twMerge(
                            "ml-auto max-w-xl flex-1 transition-all duration-300",
                            showSearch ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0"
                        )}
                    >
                        {/* Only owns the "/" shortcut while it's actually visible. */}
                        <SearchBar defaultValue={query} placeholder="Search photos" globalShortcut={showSearch} />
                    </div>

                    <div className="flex shrink-0 items-center gap-0.5">
                        <Link
                            href="/favorites"
                            aria-label="Favourites"
                            className={twMerge(
                                "relative hidden size-10 items-center justify-center rounded-xl transition-colors sm:inline-flex",
                                onHero ? "text-white hover:bg-white/10" : "text-fg hover:bg-bg-inset"
                            )}
                        >
                            <IconHeart size={19} />
                            {ready && count > 0 && (
                                <span className="absolute right-1 top-1 flex min-w-4 items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-4 text-brand-fg">
                                    {count > 99 ? "99+" : count}
                                </span>
                            )}
                        </Link>

                        <div className={onHero ? "text-white" : "text-fg"}>
                            <ThemeToggle className={onHero ? "hover:bg-white/10" : ""} />
                        </div>

                        <Link
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noreferrer"
                            aria-label="View source on GitHub"
                            className={twMerge(
                                "hidden size-10 items-center justify-center rounded-xl transition-colors md:inline-flex",
                                onHero ? "text-white hover:bg-white/10" : "text-fg hover:bg-bg-inset"
                            )}
                        >
                            <IconBrandGithubFilled size={18} />
                        </Link>

                        <button
                            type="button"
                            aria-label="Open menu"
                            aria-expanded={menuOpen}
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className={twMerge(
                                "inline-flex size-10 items-center justify-center rounded-xl transition-colors lg:hidden",
                                onHero ? "text-white hover:bg-white/10" : "text-fg hover:bg-bg-inset"
                            )}
                        >
                            {menuOpen ? <IconX size={20} /> : <IconMenu2 size={20} />}
                        </button>
                    </div>
                </Container>
            </header>

            {/* Mobile drawer */}
            <div
                className={twMerge(
                    // overflow-hidden clips the closed drawer's border and shadow,
                    // which would otherwise bleed across the top of the page.
                    "fixed inset-0 z-40 overflow-hidden lg:hidden",
                    menuOpen ? "pointer-events-auto" : "pointer-events-none"
                )}
                inert={!menuOpen}
            >
                <div
                    onClick={() => setMenuOpen(false)}
                    className={twMerge(
                        "absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-200",
                        menuOpen ? "opacity-100" : "opacity-0"
                    )}
                />
                <div
                    className={twMerge(
                        "absolute inset-x-0 top-0 rounded-b-3xl border-b border-border bg-bg-elevated pb-6 shadow-2xl transition-transform duration-300",
                        menuOpen ? "translate-y-0" : "-translate-y-full"
                    )}
                    style={{ paddingTop: HEADER_HEIGHT }}
                >
                    <div className="px-4 pt-4">
                        <SearchBar defaultValue={query} placeholder="Search photos" />
                    </div>
                    <nav className="mt-4 flex flex-col px-2">
                        {[...navItems, { href: "/favorites", label: "Favourites", icon: IconHeart }].map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={twMerge(
                                    "flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium transition-colors",
                                    isActive(item.href) ? "bg-bg-inset text-fg" : "text-fg-muted hover:text-fg"
                                )}
                            >
                                <item.icon size={20} />
                                {item.label}
                                {item.href === "/favorites" && ready && count > 0 && (
                                    <span className="ml-auto rounded-full bg-brand px-2 py-0.5 text-xs font-bold text-brand-fg">
                                        {count}
                                    </span>
                                )}
                            </Link>
                        ))}
                        <Link
                            href={GITHUB_URL}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-base font-medium text-fg-muted transition-colors hover:text-fg"
                        >
                            <IconBrandGithubFilled size={20} />
                            GitHub
                        </Link>
                    </nav>
                    <div className="mt-4 flex items-center gap-2 border-t border-border px-6 pt-4 text-sm text-fg-muted">
                        Photos by
                        <Link href="https://www.pexels.com" target="_blank" rel="noreferrer">
                            <Image
                                src="/pexels.png"
                                width={500}
                                height={281}
                                alt="Pexels"
                                className="w-[84px] dark:brightness-0 dark:invert"
                            />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Spacer — the hero renders under the transparent bar on home. */}
            {!isHome && <div style={{ height: HEADER_HEIGHT }} />}
        </>
    );
};

export default Header;
