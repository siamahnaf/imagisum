import { type NextRequest, NextResponse } from "next/server"

const PEXELS_API_KEY = process.env.PIXELS_API as string;

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams
    const id = searchParams.get("id")
    const width = searchParams.get("width") || "800"
    const height = searchParams.get("height") || "600"

    if (!id) {
        return NextResponse.json({ error: "Photo ID is required" }, { status: 400 })
    }

    try {
        const response = await fetch(`https://api.pexels.com/v1/photos/${id}`, {
            headers: {
                Authorization: PEXELS_API_KEY,
            },
        })

        if (!response.ok) {
            throw new Error("Failed to fetch photo from Pexels")
        }

        const photo = await response.json()

        const imageUrl = `${photo.src.original}?auto=compress&cs=tinysrgb&w=${width}&h=${height}&fit=crop`


        const imageResponse = await fetch(imageUrl)
        const imageBuffer = await imageResponse.arrayBuffer()

        return new NextResponse(imageBuffer, {
            headers: {
                "Content-Type": "image/jpeg",
                "Cache-Control": "public, max-age=31536000, immutable",
            },
        })
    } catch (error) {
        console.error("[v0] Error fetching image:", error)
        return NextResponse.json({ error: "Failed to fetch image" }, { status: 500 })
    }
}
