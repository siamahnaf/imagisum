import { NextResponse } from "next/server";

import { getPhoto, PexelsError } from "@/lib/pexels";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;

    if (!/^\d+$/.test(id)) {
        return NextResponse.json({ error: "Invalid photo id" }, { status: 400 });
    }

    try {
        const photo = await getPhoto(id);
        return NextResponse.json(photo);
    } catch (error) {
        const status = error instanceof PexelsError ? error.status : 500;
        return NextResponse.json({ error: "Photo not found" }, { status: status === 404 ? 404 : 500 });
    }
}
