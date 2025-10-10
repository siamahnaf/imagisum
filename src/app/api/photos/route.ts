import { NextResponse } from "next/server"

//API Key
const PEXELS_API_KEY = process.env.PIXELS_API as string;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const page = searchParams.get("page") || "1"
        const query = searchParams.get("query")

        let url: string
        if (query) {
            url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&page=${page}`
        } else {
            url = `https://api.pexels.com/v1/curated?per_page=15&page=${page}`
        }

        const response = await fetch(url, {
            headers: {
                Authorization: PEXELS_API_KEY,
            },
        })

        if (!response.ok) {
            throw new Error("Failed to fetch photos from Pexels")
        }

        const data = await response.json()
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
    }
}
