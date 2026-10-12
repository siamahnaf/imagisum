import { NextRequest, NextResponse } from "next/server";

import { getCategoryPhotos, getHomeFeed, getSearchPhotos } from "@/lib/photos";
import { getCategory } from "@/lib/categories";
import { cacheHeaders } from "@/lib/cache-headers";

/**
 * Next pages for the infinite-scroll grid.
 *
 *   /api/photos?page=2                  home feed
 *   /api/photos?category=nature&page=2  a category
 *   /api/photos?query=cats&page=2       a search
 *
 * Nothing is cached by browsers or the CDN: the Pixabay answers underneath are
 * already cached on the server and shared by everyone (see `pixabay.ts`).
 */
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const page = Math.min(500, Math.max(1, Number(params.get("page") ?? 1) || 1));
    const query = params.get("query")?.trim();
    const slug = params.get("category");
    const headers = cacheHeaders("none");

    try {
        if (query) return NextResponse.json(await getSearchPhotos(query, page), { headers });

        if (slug) {
            const category = getCategory(slug);
            if (!category) return NextResponse.json({ error: "Unknown category." }, { status: 404, headers });
            return NextResponse.json(await getCategoryPhotos(category.query, page), { headers });
        }

        return NextResponse.json(await getHomeFeed(page), { headers });
    } catch (error) {
        return NextResponse.json(
            { error: error instanceof Error ? error.message : "Failed to fetch photos" },
            { status: 500, headers }
        );
    }
}
