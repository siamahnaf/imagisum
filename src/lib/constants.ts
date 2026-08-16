/**
 * Shared constants — kept out of "use client" modules so server components can
 * import them without crossing the client boundary.
 */

export const HEADER_HEIGHT = 72;

export const THEME_STORAGE_KEY = "imagisum:theme";

/**
 * "system" is stored as the absence of a value, so anything that isn't an
 * explicit "light"/"dark" falls back to the OS preference.
 */
export type ThemeMode = "light" | "dark" | "system";

/** Runs before paint in <head> so the first frame is already the right theme. */
export const themeScript = `(function(){try{var s=localStorage.getItem("${THEME_STORAGE_KEY}");var d=s==="dark"||(s!=="light"&&window.matchMedia("(prefers-color-scheme: dark)").matches);var e=document.documentElement;e.classList.toggle("dark",d);e.style.colorScheme=d?"dark":"light";}catch(e){}})();`;

export const SITE_NAME = "Imagisum";
export const SITE_DESCRIPTION =
    "Search millions of free stock photos and download them at any size — or hotlink them straight into your markup.";
export const GITHUB_URL = "https://github.com/siamahnaf/imagisum";
