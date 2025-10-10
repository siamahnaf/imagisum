import type { Metadata } from "next";

//Components
import RootImage from "@/components/RootImage";

export const metadata: Metadata = {
  title: "Imagisum | Lorem image downloader with custom size for your website"
}

export const dynamic = "force-dynamic";

const Page = () => {
  //Image
  const imgSrc = images[Math.floor(Math.random() * images.length)];

  return (
    <RootImage imgSrc={imgSrc} />
  );
};

export default Page;

const images = ["/hero/i-1.jpg", "/hero/i-2.jpg", "/hero/i-3.jpg", "/hero/i-4.jpg", "/hero/i-5.jpg"]