"use client";
import { useEffect, useMemo, useState } from "react";
import { IconCheck, IconCopy, IconDownload, IconLink, IconLock, IconLockOpen } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

import Button from "../ui/Button";
import { PexelsPhoto } from "@/_types";
import { buildImageUrl, clampDimension, Fit, sizePresets } from "@/lib/image-url";

interface Props {
    photo: PexelsPhoto;
    className?: string;
    /** Compact spacing for the dialog; roomier on the detail page. */
    dense?: boolean;
}

type SnippetKind = "html" | "markdown" | "css" | "jsx";

const snippetTabs: { key: SnippetKind; label: string }[] = [
    { key: "html", label: "HTML" },
    { key: "markdown", label: "Markdown" },
    { key: "css", label: "CSS" },
    { key: "jsx", label: "JSX" }
];

const CustomizePanel = ({ photo, className, dense }: Props) => {
    const ratio = photo.width / photo.height;

    const [width, setWidth] = useState<number | null>(1280);
    const [height, setHeight] = useState<number | null>(Math.round(1280 / ratio));
    // Free by default — most people come here to force an exact box.
    const [locked, setLocked] = useState(false);
    const [fit, setFit] = useState<Fit>("crop");
    const [snippet, setSnippet] = useState<SnippetKind>("html");
    const [copied, setCopied] = useState<"url" | "snippet" | null>(null);
    const [origin, setOrigin] = useState("");

    // window is only available client-side; keeps SSR markup stable.
    useEffect(() => setOrigin(window.location.origin), []);

    const path = useMemo(
        () => buildImageUrl({ id: photo.id, width, height, fit }),
        [photo.id, width, height, fit]
    );

    const fullUrl = `${origin}${path}`;
    const alt = photo.alt || `Photo by ${photo.photographer}`;
    // Pexels alt text can contain quotes, which would break the copied markup.
    const safeAlt = alt.replace(/"/g, "&quot;");
    const w = width ?? photo.width;
    const h = height ?? photo.height;

    const snippets: Record<SnippetKind, string> = {
        html: `<img src="${fullUrl}" width="${w}" height="${h}" alt="${safeAlt}" />`,
        markdown: `![${alt.replace(/[[\]]/g, "")}](${fullUrl})`,
        css: `background-image: url("${fullUrl}");`,
        jsx: `<Image src="${fullUrl}" width={${w}} height={${h}} alt="${safeAlt}" />`
    };

    const copy = async (value: string, kind: "url" | "snippet") => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(kind);
            setTimeout(() => setCopied(null), 1800);
        } catch {
            /* clipboard blocked — the field is selectable as a fallback */
        }
    };

    const applyPreset = (w: number, h: number) => {
        setWidth(w);
        setHeight(h);
    };

    const onWidthChange = (raw: string) => {
        if (raw === "") return setWidth(null);
        const next = clampDimension(Number(raw));
        setWidth(next);
        if (locked) setHeight(Math.max(1, Math.round(next / ratio)));
    };

    const onHeightChange = (raw: string) => {
        if (raw === "") return setHeight(null);
        const next = clampDimension(Number(raw));
        setHeight(next);
        if (locked) setWidth(Math.max(1, Math.round(next * ratio)));
    };

    const presets = sizePresets(photo);
    const activePreset = presets.find((preset) => preset.width === width && preset.height === height);

    const downloadHref = buildImageUrl({ id: photo.id, width, height, fit, download: true });

    return (
        <div className={twMerge("space-y-6", dense && "space-y-5", className)}>
            <section>
                <h4 className="text-sm font-semibold tracking-tight">Presets</h4>
                <div className="mt-2.5 flex flex-wrap gap-2">
                    {presets.map((preset) => {
                        const active = activePreset?.label === preset.label;
                        return (
                            <button
                                key={preset.label}
                                type="button"
                                onClick={() => applyPreset(preset.width, preset.height)}
                                title={preset.hint}
                                className={twMerge(
                                    "rounded-xl border px-3 py-2 text-left text-xs transition-colors",
                                    active
                                        ? "border-brand bg-brand-soft text-brand"
                                        : "border-border text-fg-muted hover:border-border-strong hover:text-fg"
                                )}
                            >
                                <span className="block font-semibold">{preset.label}</span>
                                <span className="mt-0.5 block font-mono text-[11px] opacity-70">
                                    {preset.width}×{preset.height}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </section>

            <section>
                <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold tracking-tight">Dimensions</h4>
                    <button
                        type="button"
                        onClick={() => setLocked((prev) => !prev)}
                        aria-pressed={locked}
                        className={twMerge(
                            "inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
                            locked ? "bg-brand-soft text-brand" : "text-fg-subtle hover:text-fg"
                        )}
                    >
                        {locked ? <IconLock size={14} /> : <IconLockOpen size={14} />}
                        {locked ? "Ratio locked" : "Ratio free"}
                    </button>
                </div>

                <div className="mt-2.5 grid grid-cols-2 gap-3">
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-fg-muted">Width (px)</span>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={width ?? ""}
                            onChange={(event) => onWidthChange(event.target.value)}
                            min={16}
                            max={6000}
                            placeholder="auto"
                            className="h-11 w-full rounded-xl border border-border bg-bg px-3 font-mono text-sm outline-none transition-colors focus:border-brand"
                        />
                    </label>
                    <label className="block">
                        <span className="mb-1.5 block text-xs font-medium text-fg-muted">Height (px)</span>
                        <input
                            type="number"
                            inputMode="numeric"
                            value={height ?? ""}
                            onChange={(event) => onHeightChange(event.target.value)}
                            min={16}
                            max={6000}
                            placeholder="auto"
                            className="h-11 w-full rounded-xl border border-border bg-bg px-3 font-mono text-sm outline-none transition-colors focus:border-brand"
                        />
                    </label>
                </div>

                <div className="mt-3 flex items-center gap-2">
                    <span className="text-xs font-medium text-fg-muted">Fit</span>
                    <div className="inline-flex rounded-lg border border-border p-0.5">
                        {(["crop", "contain"] as Fit[]).map((mode) => (
                            <button
                                key={mode}
                                type="button"
                                onClick={() => setFit(mode)}
                                className={twMerge(
                                    "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
                                    fit === mode ? "bg-fg text-bg" : "text-fg-muted hover:text-fg"
                                )}
                            >
                                {mode}
                            </button>
                        ))}
                    </div>
                    <span className="ml-auto text-xs text-fg-subtle">
                        {fit === "crop" ? "Fills the box, trims overflow" : "Fits inside the box"}
                    </span>
                </div>
            </section>

            <section>
                <h4 className="text-sm font-semibold tracking-tight">Image URL</h4>
                <div className="mt-2.5 flex gap-2">
                    <div className="flex h-11 min-w-0 flex-1 items-center gap-2 rounded-xl border border-border bg-bg-subtle px-3">
                        <IconLink size={15} className="shrink-0 text-fg-subtle" />
                        <input
                            readOnly
                            value={fullUrl}
                            onFocus={(event) => event.currentTarget.select()}
                            className="min-w-0 flex-1 bg-transparent font-mono text-xs text-fg-muted outline-none"
                        />
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => copy(fullUrl, "url")}
                        className="shrink-0 px-3"
                        aria-label="Copy image URL"
                    >
                        {copied === "url" ? (
                            <IconCheck size={16} className="text-emerald-500" />
                        ) : (
                            <IconCopy size={16} />
                        )}
                    </Button>
                </div>
            </section>

            <section>
                <div className="flex items-center gap-1 border-b border-border">
                    {snippetTabs.map((tab) => (
                        <button
                            key={tab.key}
                            type="button"
                            onClick={() => setSnippet(tab.key)}
                            className={twMerge(
                                "-mb-px border-b-2 px-3 py-2 text-xs font-semibold transition-colors",
                                snippet === tab.key
                                    ? "border-brand text-fg"
                                    : "border-transparent text-fg-subtle hover:text-fg"
                            )}
                        >
                            {tab.label}
                        </button>
                    ))}
                    <button
                        type="button"
                        onClick={() => copy(snippets[snippet], "snippet")}
                        className="ml-auto inline-flex items-center gap-1.5 px-2 py-2 text-xs font-medium text-fg-subtle transition-colors hover:text-fg"
                    >
                        {copied === "snippet" ? <IconCheck size={14} className="text-emerald-500" /> : <IconCopy size={14} />}
                        {copied === "snippet" ? "Copied" : "Copy"}
                    </button>
                </div>
                <pre className="mt-2.5 overflow-x-auto rounded-xl bg-bg-inset p-3.5 font-mono text-xs leading-relaxed text-fg-muted">
                    <code>{snippets[snippet]}</code>
                </pre>
            </section>

            <a href={downloadHref} download className="block">
                <Button type="button" size="lg" className="w-full">
                    <IconDownload size={18} />
                    Download {width ?? photo.width}×{height ?? photo.height}
                </Button>
            </a>
        </div>
    );
};

export default CustomizePanel;
