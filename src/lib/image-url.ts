import type { PhotoSource } from "@/_types";

export type Format = "jpg" | "png" | "webp" | "avif";

export const FORMATS: Format[] = ["jpg", "png", "webp", "avif"];

/** Everything that can change the pixels the `/image` route sends back. */
export interface ImageTransform {
    width?: number | null;
    height?: number | null;
    /** Crop anchor as a 0–1 fraction of each axis. Only applies when both sides are set. */
    focalX?: number | null;
    focalY?: number | null;
    format?: Format;
    /** 1–100. Only meaningful for lossy formats. */
    quality?: number | null;
    /** 0–100. */
    blur?: number | null;
    grayscale?: boolean;
}

export interface ImageUrlOptions extends ImageTransform {
    id: string;
    download?: boolean;
}

export const MIN_DIMENSION = 16;
export const MAX_DIMENSION = 6000;
export const DEFAULT_QUALITY = 80;

/** Pixabay hands out at most a 1280px copy without full API access; anything larger would be upscaled. */
export function maxDimensionFor(source: PhotoSource): number {
    return source === "pixabay" ? 1280 : MAX_DIMENSION;
}

export function clampDimension(value: number, max = MAX_DIMENSION): number {
    return Math.min(max, Math.max(MIN_DIMENSION, Math.round(value)));
}

export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

/** Rounds to 2dp so focal points don't produce 17-character URLs. */
export function clampFocal(value: number): number {
    return Math.round(clamp(value, 0, 1) * 100) / 100;
}

/** True when the anchor is anywhere but dead centre. */
export function isOffCentre(transform: ImageTransform): boolean {
    return clampFocal(transform.focalX ?? 0.5) !== 0.5 || clampFocal(transform.focalY ?? 0.5) !== 0.5;
}

/**
 * Builds the app's own `/image` URL — the thing users embed in their markup.
 * Anything left at its default is omitted, so simple links stay short and the
 * same picture always gets the same URL (which is what lets it cache forever).
 */
export function buildImageUrl({
    id,
    width,
    height,
    focalX,
    focalY,
    format,
    quality,
    blur,
    grayscale,
    download
}: ImageUrlOptions): string {
    const params = new URLSearchParams({ id });

    if (width != null && Number.isFinite(width)) params.set("width", String(clampDimension(width)));
    if (height != null && Number.isFinite(height)) params.set("height", String(clampDimension(height)));

    // A focal point only changes anything when both sides are pinned.
    if (width && height) {
        const x = clampFocal(focalX ?? 0.5);
        const y = clampFocal(focalY ?? 0.5);
        if (x !== 0.5) params.set("fp-x", String(x));
        if (y !== 0.5) params.set("fp-y", String(y));
    }

    if (format && format !== "jpg") params.set("format", format);
    if (quality != null && Number.isFinite(quality) && quality !== DEFAULT_QUALITY) {
        params.set("q", String(Math.round(clamp(quality, 1, 100))));
    }
    if (blur) params.set("blur", String(Math.round(clamp(blur, 0, 100))));
    if (grayscale) params.set("grayscale", "1");
    if (download) params.set("download", "1");

    return `/image?${params.toString()}`;
}

/** The format actually served: every photo goes through Picsum or wsrv.nl, neither of which encodes AVIF. */
export function outputFormat(format: Format | undefined): Format {
    if (format === "avif") return "webp";
    return format ?? "jpg";
}

export function contentTypeFor(format: Format | undefined): string {
    return format === "png" || format === "webp" || format === "avif" ? `image/${format}` : "image/jpeg";
}

export interface SizePreset {
    label: string;
    width: number;
    height: number;
}

/** Ratio-preserving presets plus a few real-world layout sizes, minus any the photo can't fill. */
export function sizePresets(photo: { width: number; height: number; source: PhotoSource }): SizePreset[] {
    const ratio = photo.width / photo.height;
    const max = maxDimensionFor(photo.source);
    const scaled = (w: number) => ({ width: w, height: Math.max(1, Math.round(w / ratio)) });

    const presets: SizePreset[] = [
        { label: "Large", ...scaled(1920) },
        { label: "Medium", ...scaled(1280) },
        { label: "Small", ...scaled(640) },
        { label: "OG image", width: 1200, height: 630 },
        { label: "Square", width: 1080, height: 1080 },
        { label: "Story", width: 1080, height: 1920 }
    ];
    return presets.filter((preset) => preset.width <= max && preset.height <= max);
}

/** Safe filename for a downloaded photo. */
export function downloadName(
    photo: { id: string; alt?: string | null },
    width: number | null,
    height: number | null,
    format: Format = "jpg"
): string {
    const slug = (photo.alt || "photo")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 48);

    const size = width || height ? `-${width ?? "auto"}x${height ?? "auto"}` : "";
    return `imagisum-${slug || "photo"}-${photo.id}${size}.${format}`;
}
