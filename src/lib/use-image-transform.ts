"use client";
import { useCallback, useEffect, useMemo, useState } from "react";

import { buildImageUrl, clampDimension, maxDimensionFor, type ImageTransform } from "./image-url";
import { Photo } from "@/_types";

/**
 * Owns every setting in the download dialog, so the crop preview and the
 * controls — which sit in different columns — never drift apart.
 */
export function useImageTransform(photo: Photo) {
    const ratio = photo.width / photo.height;
    const max = maxDimensionFor(photo.source);
    // 1280 wide where the photo allows it, shrunk so neither side passes the cap.
    const startWidth = Math.max(1, Math.min(1280, max, Math.floor(max * ratio)));

    // Held as raw strings while typing. Clamping mid-keystroke would rewrite "1"
    // into "16" before the user can finish typing "1280", and make the field
    // impossible to clear. Bounds are enforced on blur instead.
    const [widthInput, setWidthInput] = useState(String(startWidth));
    const [heightInput, setHeightInput] = useState(String(Math.round(startWidth / ratio)));
    const [locked, setLocked] = useState(false);
    const [focalX, setFocalX] = useState(0.5);
    const [focalY, setFocalY] = useState(0.5);
    const [origin, setOrigin] = useState("");

    // A new photo starts from scratch: the last one's box and anchor mean
    // nothing for a picture of a different shape.
    useEffect(() => {
        setWidthInput(String(startWidth));
        setHeightInput(String(Math.round(startWidth / ratio)));
        setFocalX(0.5);
        setFocalY(0.5);
    }, [photo.id, ratio, startWidth]);

    // window is only available client-side; keeps SSR markup stable.
    useEffect(() => setOrigin(window.location.origin), []);

    // An empty field means "auto" — that dimension is left off the URL.
    const width = widthInput === "" ? null : Number(widthInput);
    const height = heightInput === "" ? null : Number(heightInput);

    const transform: ImageTransform = useMemo(
        () => ({ width, height, focalX, focalY }),
        [width, height, focalX, focalY]
    );

    const path = useMemo(() => buildImageUrl({ id: photo.id, ...transform }), [photo.id, transform]);

    /** Digits only, so `type=number` quirks like "e" and "-" can't get in. */
    const digitsOnly = (raw: string) => raw.replace(/\D/g, "").slice(0, 5);

    const onWidthChange = useCallback(
        (raw: string) => {
            const next = digitsOnly(raw);
            setWidthInput(next);
            if (locked && next) setHeightInput(String(Math.max(1, Math.round(Number(next) / ratio))));
        },
        [locked, ratio]
    );

    const onHeightChange = useCallback(
        (raw: string) => {
            const next = digitsOnly(raw);
            setHeightInput(next);
            if (locked && next) setWidthInput(String(Math.max(1, Math.round(Number(next) * ratio))));
        },
        [locked, ratio]
    );

    /** Snap into the supported range once the user is done with the field. */
    const commitWidth = useCallback(() => {
        if (!widthInput) return;
        const clamped = clampDimension(Number(widthInput), max);
        setWidthInput(String(clamped));
        if (locked) setHeightInput(String(Math.max(1, Math.round(clamped / ratio))));
    }, [widthInput, locked, ratio, max]);

    const commitHeight = useCallback(() => {
        if (!heightInput) return;
        const clamped = clampDimension(Number(heightInput), max);
        setHeightInput(String(clamped));
        if (locked) setWidthInput(String(Math.max(1, Math.round(clamped * ratio))));
    }, [heightInput, locked, ratio, max]);

    const applyPreset = useCallback((w: number, h: number) => {
        setWidthInput(String(w));
        setHeightInput(String(h));
    }, []);

    const setFocal = useCallback((x: number, y: number) => {
        setFocalX(x);
        setFocalY(y);
    }, []);

    return {
        max,
        widthInput,
        heightInput,
        width,
        height,
        locked,
        setLocked,
        focalX,
        focalY,
        setFocal,
        onWidthChange,
        onHeightChange,
        commitWidth,
        commitHeight,
        applyPreset,
        transform,
        path,
        fullUrl: `${origin}${path}`
    };
}
