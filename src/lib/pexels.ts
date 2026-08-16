import { PexelsCollection, PexelsPhoto, PhotoFilters, PhotoPage } from "@/_types";

const API_ROOT = "https://api.pexels.com/v1";
const API_KEY = process.env.PIXELS_API as string;

/** Curated/search listings change slowly — cache hard, we are rate limited. */
const LIST_REVALIDATE = 60 * 60;      // 1 hour
const PHOTO_REVALIDATE = 60 * 60 * 24 * 7; // 1 week, a photo never changes

export const PER_PAGE = 24;

export class PexelsError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = "PexelsError";
        this.status = status;
    }
}

type Params = Record<string, string | number | undefined | null>;

async function request<T>(path: string, params: Params, revalidate: number): Promise<T> {
    if (!API_KEY) {
        throw new PexelsError("Pexels API key is not configured (set PIXELS_API).", 500);
    }

    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        search.set(key, String(value));
    }

    const query = search.toString();
    const response = await fetch(`${API_ROOT}${path}${query ? `?${query}` : ""}`, {
        headers: { Authorization: API_KEY },
        next: { revalidate }
    });

    if (!response.ok) {
        throw new PexelsError(
            response.status === 429
                ? "Too many requests to Pexels. Please try again in a moment."
                : `Pexels request failed (${response.status}).`,
            response.status
        );
    }

    return response.json() as Promise<T>;
}

interface RawListResponse {
    photos?: PexelsPhoto[];
    media?: Array<PexelsPhoto & { type?: string }>;
    page: number;
    per_page: number;
    total_results?: number;
    next_page?: string;
}

function normalise(raw: RawListResponse, fallbackPerPage: number): PhotoPage {
    const photos = (raw.photos ?? (raw.media ?? []).filter((m) => m.type !== "Video")) as PexelsPhoto[];
    const perPage = raw.per_page ?? fallbackPerPage;

    return {
        photos,
        page: raw.page ?? 1,
        perPage,
        totalResults: raw.total_results ?? null,
        // Pexels only sends `next_page` when more exist; fall back to a length check
        // so collections (which omit it inconsistently) still paginate.
        nextPage: (raw.next_page || photos.length === perPage) ? (raw.page ?? 1) + 1 : null
    };
}

/** Rendered when Pexels is unreachable — the page still works, just empty. */
export function emptyPage(perPage: number = PER_PAGE): PhotoPage {
    return { photos: [], page: 1, perPage, totalResults: 0, nextPage: null };
}

export interface ListOptions extends PhotoFilters {
    page?: number;
    perPage?: number;
}

/** The Pexels front page feed — hand-picked photos. */
export function getCuratedPhotos({ page = 1, perPage = PER_PAGE }: ListOptions = {}): Promise<PhotoPage> {
    return request<RawListResponse>("/curated", { page, per_page: perPage }, LIST_REVALIDATE)
        .then((raw) => normalise(raw, perPage));
}

export function searchPhotos(
    query: string,
    { page = 1, perPage = PER_PAGE, orientation, size, color }: ListOptions = {}
): Promise<PhotoPage> {
    return request<RawListResponse>(
        "/search",
        { query, page, per_page: perPage, orientation, size, color },
        LIST_REVALIDATE
    ).then((raw) => normalise(raw, perPage));
}

export function getPhoto(id: string | number): Promise<PexelsPhoto> {
    return request<PexelsPhoto>(`/photos/${id}`, {}, PHOTO_REVALIDATE);
}

/** Same photo, but `null` instead of a throw — for optional/best-effort lookups. */
export async function getPhotoSafe(id: string | number): Promise<PexelsPhoto | null> {
    try {
        return await getPhoto(id);
    } catch {
        return null;
    }
}

export interface CollectionPage {
    collections: PexelsCollection[];
    page: number;
    nextPage: number | null;
}

export async function getFeaturedCollections({ page = 1, perPage = 24 } = {}): Promise<CollectionPage> {
    const raw = await request<{ collections: PexelsCollection[]; page: number; per_page: number; next_page?: string }>(
        "/collections/featured",
        { page, per_page: perPage },
        LIST_REVALIDATE
    );

    return {
        collections: raw.collections ?? [],
        page: raw.page ?? page,
        nextPage: raw.next_page ? (raw.page ?? page) + 1 : null
    };
}

/**
 * Pexels has no "get one collection" endpoint, so the featured list (already
 * cached) is where a collection's title comes from.
 */
export async function findFeaturedCollection(id: string): Promise<PexelsCollection | null> {
    try {
        const { collections } = await getFeaturedCollections({ perPage: 80 });
        return collections.find((collection) => collection.id === id) ?? null;
    } catch {
        return null;
    }
}

export function getCollectionPhotos(
    id: string,
    { page = 1, perPage = PER_PAGE }: ListOptions = {}
): Promise<PhotoPage> {
    return request<RawListResponse>(
        `/collections/${id}`,
        { page, per_page: perPage, type: "photos" },
        LIST_REVALIDATE
    ).then((raw) => normalise(raw, perPage));
}

/**
 * One photo for a query, used for hero art and the random image endpoint.
 * Draws from a pool of 10 pages × 20 photos; each underlying page request is
 * cached, so freshness costs almost no rate limit.
 */
export async function getRandomPhoto(
    query?: string,
    { orientation }: { orientation?: PhotoFilters["orientation"] } = {}
): Promise<PexelsPhoto | null> {
    const page = 1 + Math.floor(Math.random() * 10);
    const perPage = 20;

    try {
        const result = query
            ? await searchPhotos(query, { page, perPage, orientation })
            : await getCuratedPhotos({ page, perPage, orientation });

        if (!result.photos.length) return null;
        return result.photos[Math.floor(Math.random() * result.photos.length)];
    } catch {
        return null;
    }
}
