import { NextRequest, NextResponse } from "next/server";

import { getCollectionPhotos, PER_PAGE } from "@/lib/pexels";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const searchParams = request.nextUrl.searchParams;

    const page = Math.max(1, Number(searchParams.get("page") ?? 1) || 1);
    const perPage = Math.min(80, Math.max(1, Number(searchParams.get("per_page") ?? PER_PAGE) || PER_PAGE));

    try {
        const result = await getCollectionPhotos(id, { page, perPage });
        return NextResponse.json(result);
    } catch {
        return NextResponse.json({ error: "Failed to fetch collection" }, { status: 500 });
    }
}
