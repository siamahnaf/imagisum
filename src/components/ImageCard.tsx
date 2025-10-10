"use client"
import { useState, Fragment } from "react";
import Image from "next/image";

//Components
import ImageDialog from "./ImageDialog";

//Interface
import { PexelsPhoto } from "@/_types"
interface Props {
    item: PexelsPhoto;
}

const ImageCard = ({ item }: Props) => {
    //State
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Fragment>
            <div className="group cursor-pointer relative rounded-xl overflow-hidden" onClick={() => setOpen(true)}>
                <div className="relative w-full" style={{ aspectRatio: `${item.width}/${item.height}` }}>
                    <Image
                        src={item.src.large || "/placeholder.svg"}
                        alt={`Photo by ${item.photographer}`}
                        fill
                        className="object-cover transition-all duration-200 group-hover:scale-105"
                    />
                </div>
                <div className="px-5 py-5 bg-card absolute bg-linear-to-t from-black to-transparent bottom-0 left-0 w-full text-white opacity-0 invisible translate-y-2 group-hover:opacity-100 group-hover:visible group-hover:translate-y-0 transition-all">
                    <p className="text-base text-muted-foreground truncate">
                        Photo by <span className="font-medium text-foreground">{item.photographer}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {item.width} × {item.height}
                    </p>
                </div>
            </div>
            <ImageDialog
                open={open}
                onClose={() => setOpen(false)}
                item={item}
            />
        </Fragment>
    )
}

export default ImageCard;