"use client"
import { IconPhotoFilled, IconSearch } from "@tabler/icons-react";
import Container from "./ui/Container";
import Image from "next/image";
import Link from "next/link";

//Interface
interface Props {
    onSearch: (query: string) => void
    searchQuery: string
}

const Header = ({ onSearch, searchQuery }: Props) => {
    return (
        <header className="border-b border-solid border-gray-200 shadow-xs py-3">
            <Container className="grid grid-cols-2 gap-x-5">
                <div className="flex items-center gap-x-10">
                    <div className="flex items-center gap-x-1.5">
                        <IconPhotoFilled className="text-fuchsia-700" size={42} />
                        <h4 className="text-2xl font-semibold">Imagisum</h4>
                    </div>
                    <div className="relative">
                        <IconSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
                        <input
                            placeholder="Search for images..."
                            className="border border-solid border-gray-200 w-[500px] pr-2.5 pl-11 py-2 rounded-lg focus:outline-fuchsia-700"
                            value={searchQuery}
                            onChange={(e) => onSearch(e.target.value)}
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