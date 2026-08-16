module.exports = [
"[project]/.next-internal/server/app/api/photos/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[project]/src/lib/pexels.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "PER_PAGE",
    ()=>PER_PAGE,
    "PexelsError",
    ()=>PexelsError,
    "emptyPage",
    ()=>emptyPage,
    "findFeaturedCollection",
    ()=>findFeaturedCollection,
    "getCollectionPhotos",
    ()=>getCollectionPhotos,
    "getCuratedPhotos",
    ()=>getCuratedPhotos,
    "getFeaturedCollections",
    ()=>getFeaturedCollections,
    "getPhoto",
    ()=>getPhoto,
    "getPhotoSafe",
    ()=>getPhotoSafe,
    "getRandomPhoto",
    ()=>getRandomPhoto,
    "searchPhotos",
    ()=>searchPhotos
]);
const API_ROOT = "https://api.pexels.com/v1";
const API_KEY = process.env.PIXELS_API;
/** Curated/search listings change slowly — cache hard, we are rate limited. */ const LIST_REVALIDATE = 60 * 60; // 1 hour
const PHOTO_REVALIDATE = 60 * 60 * 24 * 7; // 1 week, a photo never changes
const PER_PAGE = 24;
class PexelsError extends Error {
    status;
    constructor(message, status){
        super(message);
        this.name = "PexelsError";
        this.status = status;
    }
}
async function request(path, params, revalidate) {
    if (!API_KEY) {
        throw new PexelsError("Pexels API key is not configured (set PIXELS_API).", 500);
    }
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)){
        if (value === undefined || value === null || value === "") continue;
        search.set(key, String(value));
    }
    const query = search.toString();
    const response = await fetch(`${API_ROOT}${path}${query ? `?${query}` : ""}`, {
        headers: {
            Authorization: API_KEY
        },
        next: {
            revalidate
        }
    });
    if (!response.ok) {
        throw new PexelsError(response.status === 429 ? "Too many requests to Pexels. Please try again in a moment." : `Pexels request failed (${response.status}).`, response.status);
    }
    return response.json();
}
function normalise(raw, fallbackPerPage) {
    const photos = raw.photos ?? (raw.media ?? []).filter((m)=>m.type !== "Video");
    const perPage = raw.per_page ?? fallbackPerPage;
    return {
        photos,
        page: raw.page ?? 1,
        perPage,
        totalResults: raw.total_results ?? null,
        // Pexels only sends `next_page` when more exist; fall back to a length check
        // so collections (which omit it inconsistently) still paginate.
        nextPage: raw.next_page || photos.length === perPage ? (raw.page ?? 1) + 1 : null
    };
}
function emptyPage(perPage = PER_PAGE) {
    return {
        photos: [],
        page: 1,
        perPage,
        totalResults: 0,
        nextPage: null
    };
}
function getCuratedPhotos({ page = 1, perPage = PER_PAGE } = {}) {
    return request("/curated", {
        page,
        per_page: perPage
    }, LIST_REVALIDATE).then((raw)=>normalise(raw, perPage));
}
function searchPhotos(query, { page = 1, perPage = PER_PAGE, orientation, size, color } = {}) {
    return request("/search", {
        query,
        page,
        per_page: perPage,
        orientation,
        size,
        color
    }, LIST_REVALIDATE).then((raw)=>normalise(raw, perPage));
}
function getPhoto(id) {
    return request(`/photos/${id}`, {}, PHOTO_REVALIDATE);
}
async function getPhotoSafe(id) {
    try {
        return await getPhoto(id);
    } catch  {
        return null;
    }
}
async function getFeaturedCollections({ page = 1, perPage = 24 } = {}) {
    const raw = await request("/collections/featured", {
        page,
        per_page: perPage
    }, LIST_REVALIDATE);
    return {
        collections: raw.collections ?? [],
        page: raw.page ?? page,
        nextPage: raw.next_page ? (raw.page ?? page) + 1 : null
    };
}
async function findFeaturedCollection(id) {
    try {
        const { collections } = await getFeaturedCollections({
            perPage: 80
        });
        return collections.find((collection)=>collection.id === id) ?? null;
    } catch  {
        return null;
    }
}
function getCollectionPhotos(id, { page = 1, perPage = PER_PAGE } = {}) {
    return request(`/collections/${id}`, {
        page,
        per_page: perPage,
        type: "photos"
    }, LIST_REVALIDATE).then((raw)=>normalise(raw, perPage));
}
async function getRandomPhoto(query) {
    const page = 1 + Math.floor(Math.random() * 10);
    const perPage = 20;
    try {
        const result = query ? await searchPhotos(query, {
            page,
            perPage
        }) : await getCuratedPhotos({
            page,
            perPage
        });
        if (!result.photos.length) return null;
        return result.photos[Math.floor(Math.random() * result.photos.length)];
    } catch  {
        return null;
    }
}
}),
"[project]/src/app/api/photos/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$12_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/.pnpm/next@15.5.12_react-dom@19.1.0_react@19.1.0__react@19.1.0/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pexels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/pexels.ts [app-route] (ecmascript)");
;
;
const ORIENTATIONS = [
    "landscape",
    "portrait",
    "square"
];
const SIZES = [
    "large",
    "medium",
    "small"
];
function pick(value, allowed) {
    return value && allowed.includes(value) ? value : undefined;
}
async function GET(request) {
    const params = request.nextUrl.searchParams;
    const page = Math.max(1, Number(params.get("page") ?? 1) || 1);
    const perPage = Math.min(80, Math.max(1, Number(params.get("per_page") ?? __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pexels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PER_PAGE"]) || __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pexels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PER_PAGE"]));
    const query = params.get("query")?.trim();
    const options = {
        page,
        perPage,
        orientation: pick(params.get("orientation"), ORIENTATIONS),
        size: pick(params.get("size"), SIZES),
        color: params.get("color") ?? undefined
    };
    try {
        const result = query ? await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pexels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["searchPhotos"])(query, options) : await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pexels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["getCuratedPhotos"])(options);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$12_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(result);
    } catch (error) {
        const status = error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$pexels$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["PexelsError"] ? error.status : 500;
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f2e$pnpm$2f$next$40$15$2e$5$2e$12_react$2d$dom$40$19$2e$1$2e$0_react$40$19$2e$1$2e$0_$5f$react$40$19$2e$1$2e$0$2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            error: error instanceof Error ? error.message : "Failed to fetch photos"
        }, {
            status: status === 429 ? 429 : 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__d413d91c._.js.map