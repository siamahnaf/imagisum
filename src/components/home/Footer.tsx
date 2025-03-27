import Image from "next/image";
import Link from "next/link";

//UI
import { Container } from "../ui";

const Footer = () => {
    return (
        <footer className="py-14 bg-black text-white mt-20">
            <Container>
                <div className="text-center">
                    <Image src="/logo-white.png" width={1001} height={179} alt="Logo" className="w-[200px] mx-auto" />
                    <p className="mt-2 group text-lg">Created by <Link href="https://siamahnaf.com/" target="_blank" className="group-hover:underline">Siam Ahnaf</Link></p>
                    <p className="mt-px">Powered by Picsum</p>
                    <Link href="https://github.com/siamahnaf/imagisum" className="underline block mt-px" target="_blank">
                        Source Code
                    </Link>
                    <Link href="https://api.whatsapp.com/message/UAXIYNES562EN1" className="block mt-4" target="_blank">
                        <Image src="/whatsapp-icon.png" width={800} height={800} alt="Logo" className="w-[50px] mx-auto" />
                    </Link>
                </div>
            </Container>
        </footer>
    );
};

export default Footer;