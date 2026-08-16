import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { AppProgressBar } from "@siamf/next-progress";

import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { SITE_DESCRIPTION, SITE_NAME, themeScript } from "@/lib/constants";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });

export const metadata: Metadata = {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://imagisum.vercel.app"),
    title: {
        default: `${SITE_NAME} — Free stock photos at any size`,
        template: `%s · ${SITE_NAME}`
    },
    description: SITE_DESCRIPTION,
    keywords: [
        "free stock photos",
        "royalty free images",
        "placeholder images",
        "lorem ipsum images",
        "image resizer",
        "pexels"
    ],
    openGraph: {
        type: "website",
        siteName: SITE_NAME,
        title: `${SITE_NAME} — Free stock photos at any size`,
        description: SITE_DESCRIPTION
    },
    twitter: {
        card: "summary_large_image",
        title: `${SITE_NAME} — Free stock photos at any size`,
        description: SITE_DESCRIPTION
    }
};

export const viewport: Viewport = {
    themeColor: [
        { media: "(prefers-color-scheme: light)", color: "#ffffff" },
        { media: "(prefers-color-scheme: dark)", color: "#0a0a0c" }
    ]
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <html lang="en" suppressHydrationWarning>
            <head>
                {/* Applies the stored theme before first paint to avoid a flash. */}
                <script dangerouslySetInnerHTML={{ __html: themeScript }} />
            </head>
            <body className={`${inter.className} min-h-screen bg-bg text-fg antialiased`}>
                <AppProgressBar
                    /* Theme token, not a literal — follows the light/dark palette. */
                    color="var(--brand)"
                    delay={300}
                    height={5}
                    showSpinner={false}
                    zIndex={99999999999999}
                />
                <NuqsAdapter>
                    <Header />
                    <main>{children}</main>
                    <Footer />
                </NuqsAdapter>
            </body>
        </html>
    );
};

export default RootLayout;
