"use client";
import { parseAsString, useQueryStates } from "nuqs";
import { IconAdjustmentsHorizontal, IconCheck, IconX } from "@tabler/icons-react";
import { useState } from "react";
import { twMerge } from "tailwind-merge";

const orientations = [
    { value: "landscape", label: "Landscape" },
    { value: "portrait", label: "Portrait" },
    { value: "square", label: "Square" }
];

const sizes = [
    { value: "large", label: "Large", hint: "24MP+" },
    { value: "medium", label: "Medium", hint: "12MP+" },
    { value: "small", label: "Small", hint: "4MP+" }
];

const colors = [
    { value: "red", swatch: "#ef4444" },
    { value: "orange", swatch: "#f97316" },
    { value: "yellow", swatch: "#eab308" },
    { value: "green", swatch: "#22c55e" },
    { value: "turquoise", swatch: "#14b8a6" },
    { value: "blue", swatch: "#3b82f6" },
    { value: "violet", swatch: "#8b5cf6" },
    { value: "pink", swatch: "#ec4899" },
    { value: "brown", swatch: "#92400e" },
    { value: "black", swatch: "#111111" },
    { value: "gray", swatch: "#9ca3af" },
    { value: "white", swatch: "#ffffff" }
];

const parser = parseAsString.withDefault("").withOptions({ shallow: false, clearOnDefault: true });

/**
 * Writes filters to the URL so the server component re-fetches. `shallow: false`
 * is what makes nuqs round-trip through the RSC render.
 */
const FilterBar = ({ className }: { className?: string }) => {
    const [filters, setFilters] = useQueryStates(
        { orientation: parser, size: parser, color: parser },
        { history: "replace" }
    );

    const [expanded, setExpanded] = useState(false);
    const activeCount = Object.values(filters).filter(Boolean).length;

    const toggle = (key: "orientation" | "size" | "color", value: string) => {
        setFilters({ [key]: filters[key] === value ? "" : value });
    };

    return (
        <div className={twMerge("", className)}>
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => setExpanded((prev) => !prev)}
                    aria-expanded={expanded}
                    className={twMerge(
                        "inline-flex h-10 items-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors",
                        activeCount || expanded
                            ? "border-fg bg-fg text-bg"
                            : "border-border text-fg-muted hover:border-border-strong hover:text-fg"
                    )}
                >
                    <IconAdjustmentsHorizontal size={17} />
                    Filters
                    {activeCount > 0 && (
                        <span className="rounded-full bg-bg/25 px-1.5 text-xs font-bold">{activeCount}</span>
                    )}
                </button>

                {/* Active filters stay visible even when the panel is collapsed. */}
                {(["orientation", "size", "color"] as const).map((key) =>
                    filters[key] ? (
                        <button
                            key={key}
                            type="button"
                            onClick={() => setFilters({ [key]: "" })}
                            className="inline-flex h-10 items-center gap-1.5 rounded-full border border-brand bg-brand-soft px-3.5 text-sm font-medium capitalize text-brand transition-opacity hover:opacity-80"
                        >
                            {filters[key]}
                            <IconX size={14} />
                        </button>
                    ) : null
                )}

                {activeCount > 1 && (
                    <button
                        type="button"
                        onClick={() => setFilters({ orientation: "", size: "", color: "" })}
                        className="text-sm font-medium text-fg-subtle transition-colors hover:text-fg"
                    >
                        Clear all
                    </button>
                )}
            </div>

            {expanded && (
                <div className="mt-4 grid gap-6 rounded-2xl border border-border bg-bg-subtle p-5 animate-fade-in sm:grid-cols-2 lg:grid-cols-3">
                    <fieldset>
                        <legend className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
                            Orientation
                        </legend>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {orientations.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => toggle("orientation", option.value)}
                                    className={twMerge(
                                        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                                        filters.orientation === option.value
                                            ? "border-brand bg-brand-soft text-brand"
                                            : "border-border text-fg-muted hover:text-fg"
                                    )}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
                            Minimum size
                        </legend>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {sizes.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => toggle("size", option.value)}
                                    className={twMerge(
                                        "rounded-lg border px-3 py-1.5 text-sm transition-colors",
                                        filters.size === option.value
                                            ? "border-brand bg-brand-soft text-brand"
                                            : "border-border text-fg-muted hover:text-fg"
                                    )}
                                >
                                    {option.label}
                                    <span className="ml-1.5 text-xs opacity-60">{option.hint}</span>
                                </button>
                            ))}
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend className="text-xs font-semibold uppercase tracking-wider text-fg-subtle">
                            Colour
                        </legend>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {colors.map((option) => (
                                <button
                                    key={option.value}
                                    type="button"
                                    title={option.value}
                                    aria-label={option.value}
                                    aria-pressed={filters.color === option.value}
                                    onClick={() => toggle("color", option.value)}
                                    className={twMerge(
                                        "flex size-8 items-center justify-center rounded-lg border transition-transform hover:scale-110",
                                        filters.color === option.value
                                            ? "border-brand ring-2 ring-brand"
                                            : "border-border-strong"
                                    )}
                                    style={{ backgroundColor: option.swatch }}
                                >
                                    {filters.color === option.value && (
                                        <IconCheck
                                            size={15}
                                            className={option.value === "white" || option.value === "yellow" ? "text-black" : "text-white"}
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </fieldset>
                </div>
            )}
        </div>
    );
};

export default FilterBar;
