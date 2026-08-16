export interface PexelsPhotoSrc {
    original: string;
    large2x: string;
    large: string;
    medium: string;
    small: string;
    portrait: string;
    landscape: string;
    tiny: string;
}

export interface PexelsPhoto {
    id: number;
    width: number;
    height: number;
    url: string;
    photographer: string;
    photographer_url: string;
    photographer_id?: number;
    avg_color?: string | null;
    alt?: string | null;
    src: PexelsPhotoSrc;
}

export interface PexelsCollection {
    id: string;
    title: string;
    description: string | null;
    private: boolean;
    media_count: number;
    photos_count: number;
    videos_count: number;
}

/** Normalised payload every gallery endpoint in this app returns. */
export interface PhotoPage {
    photos: PexelsPhoto[];
    page: number;
    perPage: number;
    totalResults: number | null;
    nextPage: number | null;
}

export type Orientation = "landscape" | "portrait" | "square";
export type PhotoSize = "large" | "medium" | "small";

export interface PhotoFilters {
    orientation?: Orientation;
    size?: PhotoSize;
    color?: string;
}
