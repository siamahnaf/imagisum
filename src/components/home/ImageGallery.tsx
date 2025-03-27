"use client"
import { Fragment, useState } from "react";
import Image from "next/image";
import { Masonry } from "react-plock";

//UI
import { Loading } from "../ui";

//Components
import ImageDialog from "./ImageDialog";

//Types
import { LImage } from "@/types/image.types";

//Interface
interface Props {
    data: LImage[];
}

const ImageGallery = ({ data }: Props) => {
    //State
    const [images, setImages] = useState<LImage[]>(data);
    const [page, setPage] = useState<number>(1);
    const [isFetching, setFetching] = useState<boolean>(false);
    const [open, setOpen] = useState<string | null>(null);


    //Handler
    const onLoadMore = async () => {
        try {
            setFetching(true)
            const response = await fetch(`https://picsum.photos/v2/list?page=${page + 1}&limit=30`);

            const data: LImage[] = await response.json();
            setImages(prev => [...prev, ...data]);
        } catch {
            setFetching(false);
        } finally {
            setPage(prev => prev + 1);
            setFetching(false);
        }
    }

    return (
        <div>
            <h4 className="text-3xl mb-2.5 text-gray-800">Browse Image</h4>
            <Masonry
                items={images}
                config={{
                    columns: [1, 2, 3],
                    gap: [12, 12, 12],
                    media: [640, 768, 1024],
                }}
                render={(item, idx) => (
                    <Fragment>
                        <div className="w-full h-full overflow-hidden rounded-xl">
                            <Image key={idx} src={item.download_url as string} width={item.width} height={item.height} alt={`${idx}`} className="cursor-pointer transition-all duration-300 hover:scale-[1.05]" onClick={() => setOpen(item.id)} sizes="200px" />
                        </div>
                        <ImageDialog
                            open={item.id === open}
                            onClose={() => setOpen(null)}
                            data={item}
                        />
                    </Fragment>
                )}
            />
            {images.length > 0 && page < 21 &&
                <div className="mt-20 text-center">
                    <button className="bg-black py-2.5 px-8 rounded-md text-white relative" onClick={onLoadMore} disabled={isFetching}>
                        <span className={`${isFetching && "opacity-20"}`}>Load More</span>
                        {isFetching &&
                            <div className="absolute top-1/2 left-1/2 -translate-1/2">
                                <Loading />
                            </div>
                        }
                    </button>
                </div>
            }
        </div>
    );
};

export default ImageGallery;