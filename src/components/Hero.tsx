import Container from "./ui/Container";
import Image from "next/image";
import { IconSearch, IconBrandGithubFilled } from "@tabler/icons-react";
import Link from "next/link";
import { useQueryState } from "nuqs";

//Interface
interface Props {
    imgSrc: string;
}

const Hero = ({ imgSrc }: Props) => {
    //State
    const [searchQuery, setSearchQuery] = useQueryState("q", { defaultValue: "", clearOnDefault: true });

    return (
        <section className="py-8">
            <Container className="grid grid-cols-12 gap-x-10 items-center">
                <div className="col-span-8">
                    <h4 className="text-4xl font-medium">The best free stock photos, royalty free images with custom size and download for your website</h4>
                    <div className="relative mt-10">
                        <IconSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-gray-500" />
                        <input
                            placeholder="Search for images..."
                            className="bg-[#f7f7f7] w-full pr-2.5 pl-11 py-5 rounded-lg focus:outline-fuchsia-700"
                            value={searchQuery || ""}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <h4 className="text-base mt-3 text-gray-600 flex gap-x-1">
                        Developed by
                        <Link className="text-fuchsia-700 font-semibold underline underline-offset-2" href="https://siamahnaf.com/" target="_blank">
                            Siam Ahnaf
                        </Link>.
                        <Link href="https://github.com/siamahnaf/imagisum" target="_blank" className="ml-3 hover:text-fuchsia-700">
                            <IconBrandGithubFilled />
                        </Link>
                    </h4>
                </div>
                <div className="col-span-4 h-[300px] relative">
                    <Image src={imgSrc} width={1280} height={1920} alt="Image" className="w-full object-cover object-center h-full rounded-xl" />
                    <div className="flex items-center justify-center gap-x-3">
                        <h4 className="text-base font-medium text-gray-600">Photos by</h4>
                        <Link href="https://www.pexels.com" target="_blank">
                            <Image src="/pexels.png" width={500} height={281} alt="Pexels" className="w-[100px]" />
                        </Link>
                    </div>
                </div>
            </Container>
        </section>
    );
};

export default Hero;

