import { type NextRequest, NextResponse } from "next/server"

const PEXELS_API_KEY = process.env.PIXELS_API as string
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const width = searchParams.get("width")
    const height = searchParams.get("height")

    if (!id) {
        return NextResponse.json({ error: "Photo ID is required" }, { status: 400 })
    }

    try {
        const response = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
            headers: { Authorization: PEXELS_API_KEY },
        })

        if (!response.ok) throw new Error("Failed to fetch photo from Pexels")

        const photo = await response.json()

        const imageUrl = width && height ? `${photo.src.original}?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop` : photo.src.original

        const imageResponse = await fetch(imageUrl)
        if (!imageResponse.ok) throw new Error("Failed to fetch image data")

        const contentType = imageResponse.headers.get("content-type") ?? "image/jpeg"
        const imageBuffer = await imageResponse.arrayBuffer()

        return new NextResponse(imageBuffer, {
            headers: {
                "Content-Type": contentType,
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        })
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
    }
}