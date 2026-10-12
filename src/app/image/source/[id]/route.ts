import { NextResponse } from "next/server";

import { getPixabayImage, PixabayError } from "@/lib/pixabay";
import { parseId } from "@/lib/photo-id";
import { cacheHeaders } from "@/lib/cache-headers";

/**
 * A Pixabay photo's 1280px original, served from our own server cache. This
 * is what wsrv.nl resizes from, so hotlinks never point at Pixabay itself.
 * The bytes never change, so the response is cached for a year as well.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const parsed = parseId((await params).id);
    const noStore = cacheHeaders("none");

    if (parsed?.source !== "pixabay") {
        return NextResponse.json({ error: "Expected a Pixabay id like `x-123`." }, { status: 400, headers: noStore });
    }

    try {
        const bytes = await getPixabayImage(parsed.raw);
        return new NextResponse(new Uint8Array(bytes), {
            headers: { ...cacheHeaders("forever"), "Content-Type": "image/jpeg", "Content-Length": String(bytes.length) }
        });
    } catch (error) {
        // Pixabay answers an unknown id with a 400.
        let status = 502;
        if (error instanceof PixabayError && error.status === 429) status = 429;
        else if (error instanceof PixabayError && error.status < 500) status = 404;
        return NextResponse.json({ error: "The photo could not be fetched from Pixabay." }, { status, headers: noStore });
    }
}
