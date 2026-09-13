import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Imagisum",
  description: "Imagisum has moved to https://imagisum.netlify.app",
  robots: { index: false, follow: true }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
