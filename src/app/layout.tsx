import type { Metadata } from "next";
import "./globals.css";

//Fonts
import { clashGroteskSemibold } from "@/fonts";

//Footer
import Footer from "@/components/home/Footer";


//Metadata
export const metadata: Metadata = {
  title: "Imagisum | Lorem ipsum image source",
  description: "Lorem ipsum image source with download image using picsum",
  keywords: ["imagisum", "picsum", "lorem", "ipsum", "lorem-ipsum-image"]
}


const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
  return (
    <html lang="en">
      <body className={`${clashGroteskSemibold.className} bg-white`}>
        {children}
        <Footer />
      </body>
    </html>
  );
}

export default RootLayout;