"use client"
import { useState } from "react";
import Dialog from "./ui/Dialog";
import Image from "next/image";
import Link from "next/link";
import { IconExternalLink, IconCheck, IconCopy, IconDownload } from "@tabler/icons-react";
import { nanoid } from "@/utils/nanoid";

//Interface
import { PexelsPhoto } from "@/_types";
interface Props {
    open: boolean;
    onClose: () => void;
    item: PexelsPhoto;
}

const ImageDialog = ({ open, onClose, item }: Props) => {
    //State
    const [width, setWidth] = useState<number | null>(null);
    const [height, setHeight] = useState<number | null>(null);
    const [copied, setCopied] = useState(false)
    const [downloading, setDownloading] = useState(false)

    //Suggested Sizes
    const aspectRatio = item.width / item.height
    const suggestedSizes = [
        { label: "Original", width: item.width, height: item.height },
        { label: "Large", width: 1920, height: Math.round(1920 / aspectRatio) },
        { label: "Medium", width: 1280, height: Math.round(1280 / aspectRatio) },
        { label: "Small", width: 640, height: Math.round(640 / aspectRatio) },
    ]

    //Creating Image URL
    const imageUrl = (() => {
        const params = new URLSearchParams({ id: String(item.id) })

        if (width != null) params.set("width", String(width))
        if (height != null) params.set("height", String(height))

        return `/image?${params.toString()}`
    })()

    const handleSizeSelect = (w: number, h: number) => {
        setWidth(w)
        setHeight(h)
    }

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(`${window.location.origin}${imageUrl}`)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const handleDownload = async () => {
        setDownloading(true)
        try {
            const absoluteUrl = `${window.location.origin}${imageUrl}`
            const response = await fetch(absoluteUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `${nanoid({ size: 15 })}-${width}x${height}.jpg`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)
        } catch (error) {
            console.error("Error downloading image:", error)
        } finally {
            setDownloading(false)
        }
    }


    return (
        <Dialog
            open={open}
            onClose={onClose}
            className="w-[600px]"
        >
            <Dialog.Header
                title="Customize Image"
                onClose={onClose}
                className="px-5 py-4"
            />
            <hr className="border-gray-100" />
            <Dialog.Body className="px-5 py-4">
                <div className="relative aspect-video rounded-lg overflow-hidden">
                    <Image
                        src={item.src.landscape || "/placeholder.svg"}
                        alt={`Photo by ${item.photographer}`}
                        fill
                        className="object-cover"
                    />
                </div>
                <div className="flex items-center gap-2 text-sm mt-4">
                    <span>Photo by</span>
                    <Link
                        href={item.photographer_url}
                        target="_blank"
                        className="font-medium text-fuchsia-700 hover:underline inline-flex items-center gap-1"
                    >
                        {item.photographer}
                        <IconExternalLink size={18} />
                    </Link>
                </div>
                <div className="mt-4">
                    <h4 className="text-lg font-semibold text-gray-700">Suggested Sizes</h4>
                    <div className="flex flex-wrap gap-x-3 gap-y-2.5 mt-1">
                        {suggestedSizes.map((size) => (
                            <button
                                key={size.label}
                                onClick={() => handleSizeSelect(size.width, size.height)}
                                className="text-sm border border-solid border-gray-200 shadow-xs py-1.5 px-2 rounded-lg hover:bg-fuchsia-700 hover:text-white group"
                            >
                                {size.label}
                                <span className="ml-1.5 text-gray-500 group-hover:text-gray-200">
                                    {size.width} × {size.height}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-x-6 mt-4">
                    <div className="space-y-2">
                        <label htmlFor="width" className="text-gray-700 font-semibold">Width (px)</label>
                        <input
                            id="width"
                            type="number"
                            value={width || ""}
                            placeholder="800"
                            onChange={(e) => {
                                const v = e.target.value
                                setWidth(v === "" ? null : Number(v))
                            }}
                            min={100}
                            max={4000}
                            className="w-full border border-solid border-gray-200 px-2.5 py-1.5 rounded-lg shadow-xs mt-1"
                        />
                    </div>
                    <div className="space-y-2">
                        <label htmlFor="height" className="text-gray-700 font-semibold">Height (px)</label>
                        <input
                            id="height"
                            type="number"
                            value={height || ""}
                            placeholder="300"
                            onChange={(e) => {
                                const v = e.target.value
                                setHeight(v === "" ? null : Number(v))
                            }}
                            min={100}
                            max={4000}
                            className="w-full border border-solid border-gray-200 px-2.5 py-1.5 rounded-lg shadow-xs mt-1"
                        />
                    </div>
                </div>
                <div className="space-y-2 mt-6">
                    <h4 className="text-gray-700 font-semibold">Image URL</h4>
                    <div className="flex gap-2">
                        <input
                            id="url"
                            value={`${window.location.origin}${imageUrl}`}
                            readOnly
                            className="font-mono w-full text-sm border border-solid border-gray-200 py-2 px-3 rounded-lg"
                        />
                        <button onClick={handleCopyLink} className="shrink-0 bg-transparent border border-solid border-gray-200 px-2.5 rounded-lg">
                            {copied ? <IconCheck className="w-4 h-4 text-green-600" /> : <IconCopy className="w-4 h-4" />}
                        </button>
                    </div>
                    <p className="text-xs text-[#606369]">
                        Example:{" "}
                        <code className="bg-[#ecf1f8] px-1 py-0.5 rounded">{`<img src="${window.location.origin}${imageUrl}" />`}</code>
                    </p>
                </div>
                <div className="flex gap-x-3 mt-8">
                    <button onClick={handleDownload} disabled={downloading} className={`flex-1 text-white flex items-center justify-center py-2 rounded-lg ${(downloading || (!width && !height)) ? "bg-gray-400" : "bg-fuchsia-700"}`}>
                        <IconDownload className="w-4 h-4 mr-2" />
                        {downloading ? "Downloading..." : "Download Image"}
                    </button>
                    <button onClick={onClose} className="border border-solid border-gray-200 px-4 rounded-lg">
                        Close
                    </button>
                </div>
            </Dialog.Body>
        </Dialog>
    );
};

export default ImageDialog;