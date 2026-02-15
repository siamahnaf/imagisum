"use client"
import Container from "./ui/Container";

//Components
import Header from "./Header";
import Hero from "./Hero";
import ImageGallery from "./ImageGallery";

const RootImage = ({ imgSrc }: { imgSrc: string }) => {
    return (
        <main>
            <Header />
            <Hero imgSrc={imgSrc} />
            <Container>
                <ImageGallery />
            </Container>
        </main>
    );
};

export default RootImage;