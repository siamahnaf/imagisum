/**
 * Cache headers for routes whose answer depends on the query string.
 *
 * - `forever`: a specific photo at a specific size never changes, so image
 *   links are cached for a year by browsers and by Vercel's CDN (which keys on
 *   the full URL, query string included).
 * - `none`: listings, random images and downloads — always fresh. Listings
 *   are cached on the server instead, where every visitor shares them.
 *
 * Netlify's CDN is always kept out: it builds its cache key from the path and
 * ignores our query params, so it once handed out the same photo for every id
 * and every size. A browser keys on the whole URL, so it is safe there.
 */
export type CachePolicy = "forever" | "none";

const VALUES: Record<CachePolicy, string> = {
    forever: "public, max-age=31536000, immutable",
    none: "no-store, must-revalidate"
};

export function cacheHeaders(policy: CachePolicy): Record<string, string> {
    return {
        "Cache-Control": VALUES[policy],
        "Vercel-CDN-Cache-Control": policy === "none" ? "no-store" : VALUES[policy],
        "Netlify-CDN-Cache-Control": "no-store"
    };
}
