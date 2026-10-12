export type PhotoSource = "pixabay" | "picsum";

/** One photo, whichever provider it came from. */
export interface Photo {
    /** Prefixed with its source — `x-<pixabay id>` or `p-<picsum id>`. */
    id: string;
    source: PhotoSource;
    /** Where the photo is hosted, for the "Photo by … on …" credit. */
    siteName: string;
    width: number;
    height: number;
    color: string | null;
    alt: string;
    photographer: string;
    photographerUrl: string;
    /** The photo's own page on its site. */
    pageUrl: string;
    /** ~640px wide, for grid cards. */
    thumb: string;
    /** ~1280px wide or more, for the dialog and the hero. */
    preview: string;
}

/** Normalised payload every gallery endpoint in this app returns. */
export interface PhotoPage {
    photos: Photo[];
    page: number;
    totalResults: number | null;
    nextPage: number | null;
    /** Set when Pixabay was unavailable and these are Picsum photos instead. */
    fallback?: boolean;
}
