"use client"
import { ChangeEvent, useState } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import FileSaver from "file-saver";

//UI
import { Dialog, Input, Loading } from "../ui";

//Components
import ImageSize from "./ImageSize";

//Types
import { LImage } from "@/types/image.types";


//Interface
interface Props {
    open: boolean;
    onClose: () => void;
    data: LImage;
}
//Types
interface Inputs {
    width: string;
    height: string;
}


const ImageDialog = ({ open, onClose, data }: Props) => {
    //Initializing Form
    const {
        register,
        handleSubmit,
        formState: { errors },
        reset
    } = useForm<Inputs>();

    //State
    const [fetching, setFetching] = useState<boolean>(false);

    //Handler
    const onSubmit: SubmitHandler<Inputs> = async (value) => {
        try {
            setFetching(true);
            const response = await fetch(`https://picsum.photos/id/${data.id}/${value.width}/${value.height}`);
            const finalUrl = response.url;

            const url = new URL(finalUrl);

            FileSaver.saveAs(finalUrl, url.searchParams.get("hmac") || "imagisum");

        } catch {
            setFetching(false);
        } finally {
            setFetching(false);
            reset();
        }
    }


    //Generating Image
    const generateImageSizes = (originalWidth: number, originalHeight: number) => {
        const aspectRatio = originalWidth / originalHeight;
        const minSize = Math.min(originalWidth, originalHeight) * 0.2;
        const sizes = [];

        let step = Math.round(originalWidth / 4);
        let newWidth = originalWidth;

        while (newWidth > minSize && sizes.length < 6) {
            let newHeight = Math.round(newWidth / aspectRatio);
            sizes.push({ width: newWidth, height: newHeight });
            newWidth -= step;
            if (newWidth < minSize * 1.5) break;
        }

        return sizes;
    }

    return (
        <Dialog
            open={open}
            onClose={onClose}
            className="rounded-xl w-[1000px]"
        >
            <div className="max-h-[80vh] overflow-auto p-3 bg-white">
                <div className="mb-10">
                    <h4 className="text-xl mb-4">Download Images</h4>
                    <div className="flex gap-5 mb-8">
                        {generateImageSizes(data.width, data.height).map((item, i) => (
                            <ImageSize key={i} item={item} id={data.id} />
                        ))}
                    </div>
                    <h4 className="text-xl mb-4">Custom Size</h4>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="flex items-center justify-center mt-10 gap-4">
                            <Input
                                id="width"
                                {...register("width", { required: "Width is required" })}
                                errorMessage={errors.width?.message}
                                onInput={(e: ChangeEvent<HTMLInputElement>) => {
                                    e.target.value = e.target.value.replace(/[^0-9]/g, '')
                                }}
                                placeholder="Width"
                            />
                            <span className="text-lg text-gray-600">×</span>
                            <Input
                                id="height"
                                {...register("height", { required: "Height is required" })}
                                errorMessage={errors.height?.message}
                                onInput={(e: ChangeEvent<HTMLInputElement>) => {
                                    e.target.value = e.target.value.replace(/[^0-9]/g, '')
                                }}
                                placeholder="Height"
                            />
                        </div>
                        <div className="text-center mt-10">
                            <button className="bg-black py-2.5 px-7 rounded-md text-white relative" type="submit">
                                <span className={`${fetching && "opacity-20"}`}>Download Image</span>
                                {fetching &&
                                    <div className="absolute top-1/2 left-1/2 -translate-1/2">
                                        <Loading />
                                    </div>
                                }
                            </button>
                        </div>
                    </form>
                </div>
                <Image src={data.download_url as string} width={data.width} height={data.height} alt={`${data.id}`} sizes="500px" className="rounded-xl w-full h-full object-contain" />
            </div>
        </Dialog>
    );
};

export default ImageDialog;