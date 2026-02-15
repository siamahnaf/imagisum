"use client"
import { useState, useEffect } from "react";
import { IconPhotoFilled, IconSearch } from "@tabler/icons-react";
import Container from "./ui/Container";
import Image from "next/image";
import Link from "next/link";
import { useQueryState } from "nuqs";

const Header = () => {
    //State
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "", clearOnDefault: true });

    //Effect
    useEffect(() => {
        const onScroll = () => {
            setShowSearch(window.scrollY > 300);
        };

        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    return (
        <header className={`border-b border-solid sticky top-0 z-999 bg-white shadow-xs transition-all ${showSearch ? "border-gray-100 py-3" : "border-transparent py-1"}`}>
            <Container className="grid grid-cols-2 gap-x-5">
                <div className="flex items-center gap-x-10">
                    <div className="flex items-center gap-x-1.5">
                        <IconPhotoFilled className="text-fuchsia-700" size={42} />
                        <h4 className="text-2xl font-semibold">Imagisum</h4>
                    </div>
                    <div className={`relative transition-all ${showSearch ? "visible opacity-100 translate-y-0" : "opacity-0 invisible translate-y-4"}`}>
                        <IconSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
                        <input
                            placeholder="Search for images..."
                            className={`border border-solid border-gray-200 w-[500px] pr-2.5 pl-11 py-2 rounded-lg focus:outline-fuchsia-700`}
                            value={searchQuery || ""}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-x-3">
                    <h4 className="text-base font-medium text-gray-600">Photos by</h4>
                    <Link href="https://www.pexels.com" target="_blank">
                        <Image src="/pexels.png" width={500} height={281} alt="Pexels" className="w-[100px]" />
                    </Link>
                </div>
            </Container>
        </header>
    )
}

export default Header;