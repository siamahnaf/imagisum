"use client"
import { useState } from "react";
import FileSaver from "file-saver";

//UI
import { Loading } from "../ui";

//Interface
interface Props {
    item: {
        width: number;
        height: number;
    },
    id: string;
}

const ImageSize = ({ item, id }: Props) => {
    //State
    const [fetching, setFetching] = useState<boolean>(false);

    //Handler
    const onDownload = async () => {
        try {
            setFetching(true);
            const response = await fetch(`https://picsum.photos/id/${id}/${item.width}/${item.height}`);
            const finalUrl = response.url;

            const url = new URL(finalUrl);

            FileSaver.saveAs(finalUrl, url.searchParams.get("hmac") || "imagisum");

        } catch {
            setFetching(false);
        } finally {
            setFetching(false);
        }
    }

    return (
        <button className="bg-black py-1 px-4 rounded-md text-white relative" disabled={fetching} onClick={onDownload}>
            <span className={`${fetching && "opacity-20"}`}>{item.width} × {item.height}</span>
            {fetching &&
                <div className="absolute top-1/2 left-1/2 -translate-1/2">
                    <Loading />
                </div>
            }
        </button>
    );
};

export default ImageSize;