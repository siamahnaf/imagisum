"use client"
import { ChangeEvent, useState } from "react";
import Image from "next/image";
import { useForm, SubmitHandler } from "react-hook-form";
import FileSaver from "file-saver";

//UI
import { Input, Loading } from "../ui";

//Types
interface Inputs {
    width: string;
    height: string;
}

const DownloadBox = () => {
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
            const response = await fetch(`https://picsum.photos/${value.width}/${value.height}`);
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

    return (
        <div className="border border-solid border-gray-200 mb-8 p-6 rounded-xl text-center">
            <Image src="/logo.png" width={1001} height={179} alt="Logo" className="w-[200px] mx-auto" />
            <p className="text-lg text-gray-600 mt-3">Download Random Image By Providing just width and height.</p>
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
                    <button className="bg-black py-2.5 px-7 rounded-md text-white relative" type="submit" disabled={fetching}>
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
    );
};

export default DownloadBox;