import { unstable_cache } from "next/cache";

import { Photo, PhotoPage } from "@/_types";
import { formatId } from "./photo-id";

const API_ROOT = "https://pixabay.com/api/";

export const PER_PAGE = 24;

/**
 * Pixabay asks for every answer to be cached for 24 hours, but the image URLs
 * inside an answer also expire after 24 hours. Refreshing an hour early keeps
 * the cache within their rules without ever serving a dead link.
 *
 * The cache is Next's own fetch cache: shared by every visitor and every
 * server instance, so a search one person runs is free for the next. Only 200
 * responses are stored — a rate limit or outage is never pinned.
 */
const REVALIDATE = 23 * 60 * 60;

/** The longest side `largeImageURL` gives without full API access. */
export const PIXABAY_MAX_DIMENSION = 1280;

export class PixabayError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "PixabayError";
        this.status = status;
    }
}

interface RawHit {
    id: number;
    pageURL: string;
    tags: string;
    webformatURL: string;
    largeImageURL: string;
    imageWidth: number;
    imageHeight: number;
    user: string;
    user_id: number;
}

interface RawResponse {
    total: number;
    totalHits: number;
    hits: RawHit[];
}

type Params = Record<string, string | number | boolean | undefined>;

async function request(params: Params): Promise<RawResponse> {
    const key = process.env.PIXABAY_API_KEY;
    if (!key) throw new PixabayError("No Pixabay key is configured (set PIXABAY_API_KEY).", 500);

    const search = new URLSearchParams({ key, image_type: "photo", safesearch: "true" });
    for (const [name, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") search.set(name, String(value));
    }

    const response = await fetch(`${API_ROOT}?${search}`, { next: { revalidate: REVALIDATE } });
    if (!response.ok) throw new PixabayError(`Pixabay request failed (${response.status}).`, response.status);
    return response.json() as Promise<RawResponse>;
}

/** "Nature ", "nature" and "NATURE" are one search, so they share one cache entry. */
function normaliseQuery(query: string): string {
    return query.trim().toLowerCase().replace(/\s+/g, " ").slice(0, 100);
}

function normalise(hit: RawHit): Photo {
    const tags = hit.tags.split(",").map((tag) => tag.trim()).filter(Boolean);

    return {
        id: formatId("pixabay", String(hit.id)),
        source: "pixabay",
        siteName: "Pixabay",
        width: hit.imageWidth,
        height: hit.imageHeight,
        color: null,
        alt: tags.slice(0, 3).join(", ") || `Photo by ${hit.user}`,
        photographer: hit.user,
        photographerUrl: `https://pixabay.com/users/${encodeURIComponent(hit.user)}-${hit.user_id}/`,
        pageUrl: hit.pageURL,
        thumb: hit.webformatURL,
        preview: hit.largeImageURL
    };
}

function toPage(raw: RawResponse, page: number, perPage: number): PhotoPage {
    return {
        photos: raw.hits.map(normalise),
        page,
        totalResults: raw.totalHits,
        // Pixabay serves at most 500 hits per query, which `totalHits` already reflects.
        nextPage: page * perPage < raw.totalHits ? page + 1 : null
    };
}

/** Pixabay's Editor's Choice, most popular first. */
export async function getFeed(page = 1, perPage = PER_PAGE): Promise<PhotoPage> {
    const raw = await request({ editors_choice: true, order: "popular", page, per_page: perPage });
    return toPage(raw, page, perPage);
}

export async function searchPhotos(query: string, page = 1, perPage = PER_PAGE): Promise<PhotoPage> {
    const raw = await request({ q: normaliseQuery(query), page, per_page: perPage });
    return toPage(raw, page, perPage);
}

/** Where a photo's 1280px copy lives right now. The URL expires after a day, so it is looked up, not stored. */
export async function getLargeImageUrl(id: string): Promise<string> {
    const raw = await request({ id });
    const hit = raw.hits[0];
    if (!hit) throw new PixabayError("No photo with that id.", 404);
    return hit.largeImageURL;
}

/**
 * The photo's 1280px copy, downloaded from Pixabay once and then kept in
 * Next's server cache for good — Pixabay asks for images to be on our own
 * server before they are hotlinked. Base64, because the cache stores JSON.
 * Entries are capped at 2MB; a 1280px JPEG is usually well under that, and an
 * oversized one is simply fetched again next time.
 */
const cachedImage = unstable_cache(
    async (id: string): Promise<string> => {
        const response = await fetch(await getLargeImageUrl(id), { cache: "no-store" });
        if (!response.ok) throw new PixabayError(`Pixabay image download failed (${response.status}).`, 502);
        return Buffer.from(await response.arrayBuffer()).toString("base64");
    },
    ["pixabay-image"],
    { revalidate: false }
);

export async function getPixabayImage(id: string): Promise<Buffer> {
    return Buffer.from(await cachedImage(id), "base64");
}
