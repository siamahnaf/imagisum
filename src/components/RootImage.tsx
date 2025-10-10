"use client"
import { useState } from "react";
import Container from "./ui/Container";

//Components
import Header from "./Header";
import Hero from "./Hero";
import ImageGallery from "./ImageGallery";

const RootImage = ({ imgSrc }: { imgSrc: string }) => {
    //State
    const [searchQuery, setSearchQuery] = useState("");

    return (
        <main>
            <Header onSearch={setSearchQuery} searchQuery={searchQuery} />
            <Hero onSearch={setSearchQuery} searchQuery={searchQuery} imgSrc={imgSrc} />
            <Container>
                <ImageGallery searchQuery={searchQuery} />
            </Container>
        </main>
    );
};

export default RootImage;