"use client";
import Image from "next/image";
import Link from "next/link";
import { IconExternalLink } from "@tabler/icons-react";

import Dialog from "../ui/Dialog";
import CustomizePanel from "./CustomizePanel";
import { PexelsPhoto } from "@/_types";

interface Props {
    open: boolean;
    onClose: () => void;
    photo: PexelsPhoto;
}

const CustomizeDialog = ({ open, onClose, photo }: Props) => (
    <Dialog open={open} onClose={onClose} className="w-[calc(100%-2rem)] max-w-[620px]">
        <Dialog.Header title="Customise & download" onClose={onClose} className="px-5 py-4" />
        <div className="border-b border-border" />
        <Dialog.Body className="px-5 py-5">
            <div className="relative aspect-video overflow-hidden rounded-xl bg-bg-inset">
                <Image
                    src={photo.src.landscape || "/placeholder.svg"}
                    alt={photo.alt || `Photo by ${photo.photographer}`}
                    fill
                    sizes="620px"
                    className="object-cover"
                />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-fg-muted">
                <span>Photo by</span>
                <Link
                    href={photo.photographer_url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 font-medium text-brand hover:underline"
                >
                    {photo.photographer}
                    <IconExternalLink size={15} />
                </Link>
                <span className="text-fg-subtle">·</span>
                <Link href={`/photo/${photo.id}`} className="font-medium text-fg-muted hover:text-fg hover:underline">
                    Open full page
                </Link>
            </div>
            <div className="mt-5">
                <CustomizePanel photo={photo} dense />
            </div>
        </Dialog.Body>
    </Dialog>
);

export default CustomizeDialog;
