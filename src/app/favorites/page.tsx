import type { Metadata } from "next";

import Container from "@/components/ui/Container";
import PageHeader from "@/components/ui/PageHeader";
import FavoritesGallery from "@/components/photo/FavoritesGallery";

export const metadata: Metadata = {
    title: "Your favourites",
    description: "Photos you've saved on Imagisum, stored locally in your browser.",
    robots: { index: false }
};

const FavoritesPage = () => (
    <Container className="py-8 md:py-12">
        <PageHeader
            breadcrumbs={[{ label: "Home", href: "/" }, { label: "Favourites" }]}
            title="Your favourites"
            description="Saved photos live in this browser's local storage — nothing is uploaded and no account is needed."
        />

        <div className="mt-10">
            <FavoritesGallery />
        </div>
    </Container>
);

export default FavoritesPage;
