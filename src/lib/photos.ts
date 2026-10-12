import { Photo, PhotoPage } from "@/_types";
import { getPicsumPage, getRandomPicsum } from "./picsum";
import { getFeed, PER_PAGE, searchPhotos } from "./pixabay";

/**
 * Which provider answers what:
 *
 * - Home feed, categories and search: Pixabay, cached on the server for most
 *   of a day and shared by every visitor (see `pixabay.ts`).
 * - Whenever Pixabay fails — rate limit, outage, missing key — the same page
 *   comes from Picsum instead, marked `fallback` so the UI can say so.
 * - Random (hero, `/image?random=1`): Picsum, which has no limit at all.
 */
async function withFallback(load: () => Promise<PhotoPage>, page: number): Promise<PhotoPage> {
    try {
        return await load();
    } catch (error) {
        console.warn("Pixabay unavailable, serving Picsum", error);
        return { ...(await getPicsumPage(page, PER_PAGE)), totalResults: null, fallback: true };
    }
}

export function getHomeFeed(page = 1): Promise<PhotoPage> {
    return withFallback(() => getFeed(page), page);
}

export function getCategoryPhotos(query: string, page = 1): Promise<PhotoPage> {
    return withFallback(() => searchPhotos(query, page), page);
}

export function getSearchPhotos(query: string, page = 1): Promise<PhotoPage> {
    return withFallback(() => searchPhotos(query, page), page);
}

/** A random photo, always from Picsum: it has no rate limit, so random links cost nothing. */
export function getRandomPhoto(): Promise<Photo | null> {
    return getRandomPicsum();
}

export function emptyPage(): PhotoPage {
    return { photos: [], page: 1, totalResults: 0, nextPage: null };
}

export const FALLBACK_MESSAGE =
    "Search is temporarily unavailable, so these are random photos from Lorem Picsum. Try again in a little while.";
