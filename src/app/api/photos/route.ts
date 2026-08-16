import { NextRequest, NextResponse } from "next/server";

import { getCuratedPhotos, PER_PAGE, PexelsError, searchPhotos } from "@/lib/pexels";
import { Orientation, PhotoSize } from "@/_types";

const ORIENTATIONS: Orientation[] = ["landscape", "portrait", "square"];
const SIZES: PhotoSize[] = ["large", "medium", "small"];

function pick<T extends string>(value: string | null, allowed: T[]): T | undefined {
    return value && (allowed as string[]).includes(value) ? (value as T) : undefined;
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
    const perPage = Math.min(80, Math.max(1, Number(params.get("per_page") ?? PER_PAGE) || PER_PAGE));
    const query = params.get("query")?.trim();

    const options = {
        page,
        perPage,
        orientation: pick(params.get("orientation"), ORIENTATIONS),
        size: pick(params.get("size"), SIZES),
        color: params.get("color") ?? undefined
    };

    try {
        const result = query ? await searchPhotos(query, options) : await getCuratedPhotos(options);
        return NextResponse.json(result);
    } catch (error) {
        const status = error instanceof PexelsError ? error.status : 500;
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch photos" },
            { status: status === 429 ? 429 : 500 }
        );
    }
}
