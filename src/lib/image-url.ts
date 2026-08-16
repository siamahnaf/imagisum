export type Fit = "crop" | "contain";

export interface ImageUrlOptions {
    id: number | string;
    width?: number | null;
    height?: number | null;
    fit?: Fit;
    download?: boolean;
}

export const MIN_DIMENSION = 16;
export const MAX_DIMENSION = 6000;

export function clampDimension(value: number): number {
    return Math.min(MAX_DIMENSION, Math.max(MIN_DIMENSION, Math.round(value)));
}

/** Builds the app's own `/image` URL — the thing users embed in their markup. */
export function buildImageUrl({ id, width, height, fit, download }: ImageUrlOptions): string {
    const params = new URLSearchParams({ id: String(id) });

    if (width != null && Number.isFinite(width)) params.set("width", String(clampDimension(width)));
    if (height != null && Number.isFinite(height)) params.set("height", String(clampDimension(height)));
    if (fit && fit !== "crop") params.set("fit", fit);
    if (download) params.set("download", "1");

    return `/image?${params.toString()}`;
}

export interface SizePreset {
    label: string;
    width: number;
    height: number;
    hint?: string;
}

/** Ratio-preserving presets plus a few real-world layout sizes. */
export function sizePresets(photo: { width: number; height: number }): SizePreset[] {
    const ratio = photo.width / photo.height;
    const scaled = (w: number) => ({ width: w, height: Math.max(1, Math.round(w / ratio)) });

    return [
        { label: "Original", width: photo.width, height: photo.height, hint: "Full resolution" },
        { label: "Large", ...scaled(1920), hint: "Hero / banner" },
        { label: "Medium", ...scaled(1280), hint: "Content width" },
        { label: "Small", ...scaled(640), hint: "Card / thumb" },
        { label: "Thumbnail", ...scaled(320), hint: "Avatar / list" },
        { label: "OG image", width: 1200, height: 630, hint: "Social preview" },
        { label: "Square", width: 1080, height: 1080, hint: "Feed post" },
        { label: "Story", width: 1080, height: 1920, hint: "Vertical" }
    ];
}

export function formatBytes(bytes: number): string {
    if (!Number.isFinite(bytes) || bytes <= 0) return "—";
    const units = ["B", "KB", "MB", "GB"];
    const i = Math.min(units.length - 1, Math.floor(Math.log(bytes) / Math.log(1024)));
    return `${(bytes / 1024 ** i).toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

export function aspectLabel(width: number, height: number): string {
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(width, height) || 1;
    const w = width / divisor;
    const h = height / divisor;

    // Only useful when the ratio is a small, recognisable one.
    if (w <= 32 && h <= 32) return `${w}:${h}`;
    return `${(width / height).toFixed(2)}:1`;
}

export function orientationOf(width: number, height: number): "landscape" | "portrait" | "square" {
    if (Math.abs(width - height) / Math.max(width, height) < 0.02) return "square";
    return width > height ? "landscape" : "portrait";
}
