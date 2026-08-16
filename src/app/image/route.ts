import { type NextRequest, NextResponse } from "next/server";

import { getPhoto, getRandomPhoto } from "@/lib/pexels";
import { clampDimension } from "@/lib/image-url";
import { PexelsPhoto } from "@/_types";

export const dynamic = "force-dynamic";

function dimension(raw: string | null): number | null {
    if (!raw) return null;
    const value = Number(raw);
    if (!Number.isFinite(value) || value <= 0) return null;
    return clampDimension(value);
}

/**
 * Builds the Pexels CDN URL. Their image pipeline takes `w`/`h`/`fit`, so we
 * hand the resizing off rather than processing bytes ourselves.
 */
function cdnUrl(photo: PexelsPhoto, width: number | null, height: number | null, fit: string): string {
    if (!width && !height) return photo.src.original;

    const params = new URLSearchParams({ auto: "compress", cs: "tinysrgb" });
    if (width) params.set("w", String(width));
    if (height) params.set("h", String(height));
    // `crop` fills and trims; anything else letterboxes inside the box.
    params.set("fit", fit === "contain" ? "clip" : "crop");

    return `${photo.src.original}?${params.toString()}`;
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const id = params.get("id");
    const random = params.get("random") === "1" || params.get("random") === "true";
    const query = params.get("query")?.trim() || undefined;
    const width = dimension(params.get("width") ?? params.get("w"));
    const height = dimension(params.get("height") ?? params.get("h"));
    const fit = params.get("fit") === "contain" ? "contain" : "crop";
    const asDownload = params.get("download") === "1" || params.get("download") === "true";

    if (!id && !random) {
        return NextResponse.json(
            { error: "Provide `id`, or `random=1` (optionally with `query`)." },
            { status: 400 }
        );
    }

    try {
        const photo = random ? await getRandomPhoto(query) : await getPhoto(id as string);

        if (!photo) {
            return NextResponse.json({ error: "No photo found" }, { status: 404 });
        }

        const imageResponse = await fetch(cdnUrl(photo, width, height, fit));
        if (!imageResponse.ok) throw new Error("Failed to fetch image data");

        const contentType = imageResponse.headers.get("content-type") ?? "image/jpeg";
        const buffer = await imageResponse.arrayBuffer();

        const headers: Record<string, string> = {
            "Content-Type": contentType,
            "Content-Length": String(buffer.byteLength),
            // A random image must never be cached; a specific one never changes.
            "Cache-Control": random
                ? "no-store, must-revalidate"
                : "public, max-age=31536000, immutable",
            "X-Photo-Id": String(photo.id),
            "X-Photographer": encodeURIComponent(photo.photographer)
        };

        if (asDownload) {
            const size = width || height ? `-${width ?? "auto"}x${height ?? "auto"}` : "";
            headers["Content-Disposition"] = `attachment; filename="imagisum-${photo.id}${size}.jpg"`;
        }

        return new NextResponse(buffer, { headers });
    } catch {
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 });
    }
}
