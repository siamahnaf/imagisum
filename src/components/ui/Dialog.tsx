"use client";
import { ReactNode, useEffect, useRef } from "react";
import { m, AnimatePresence, domAnimation, LazyMotion } from "framer-motion";
import { createPortal } from "react-dom";
import { IconX } from "@tabler/icons-react";
import { twMerge } from "tailwind-merge";

// Interfaces
interface Props {
    open: boolean;
    onClose: () => void;
    children?: ReactNode;
    backdropClassName?: string;
    className?: string;
    padRightIds?: string[];
}

const Dialog = ({
    open,
    onClose,
    children,
    backdropClassName,
    className,
    padRightIds = [],
}: Props) => {
    const animation = {
        unmount: { opacity: 0, y: -8, transition: { duration: 0.15 } },
        mount: { opacity: 1, y: 0, transition: { duration: 0.15 } },
    };
    const backdropAnimation = {
        unmount: { opacity: 0, transition: { delay: 0.1 } },
        mount: { opacity: 1 },
    };

    const lockAppliedRef = useRef(false);
    const originalBodyOverflowRef = useRef<string | null>(null);
    const originalBodyPaddingRef = useRef<string | null>(null);
    const originalTargetsPaddingRef = useRef<Record<string, string | null>>({});

    const lockAndPad = () => {
        if (typeof window === "undefined") return;
        if (lockAppliedRef.current) return;

        // Measure BEFORE locking overflow so we capture the current scrollbar width
        const scrollbarWidth =
            window.innerWidth - document.documentElement.clientWidth;

        const body = document.body;

        // Save originals once
        if (originalBodyOverflowRef.current === null)
            originalBodyOverflowRef.current = body.style.overflow || "";
        if (originalBodyPaddingRef.current === null)
            originalBodyPaddingRef.current = body.style.paddingRight || "";

        body.style.overflow = "hidden";

        const bodyComputed = window.getComputedStyle(body);
        const bodyCurrent = parseFloat(bodyComputed.paddingRight || "0") || 0;
        if (scrollbarWidth > 0) {
            body.style.paddingRight = `${bodyCurrent + scrollbarWidth}px`;
        }

        const originals: Record<string, string | null> = {};
        padRightIds.forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            originals[id] = el.style.paddingRight || "";
            const computed = window.getComputedStyle(el);
            const current = parseFloat(computed.paddingRight || "0") || 0;
            if (scrollbarWidth > 0) {
                el.style.paddingRight = `${current + scrollbarWidth}px`;
            }
        });
        originalTargetsPaddingRef.current = originals;

        lockAppliedRef.current = true;
    };

    const restoreAll = () => {
        if (typeof window === "undefined") return;
        if (!lockAppliedRef.current) return;

        const body = document.body;

        if (originalBodyOverflowRef.current !== null) {
            body.style.overflow = originalBodyOverflowRef.current;
            originalBodyOverflowRef.current = null;
        }
        if (originalBodyPaddingRef.current !== null) {
            body.style.paddingRight = originalBodyPaddingRef.current;
            originalBodyPaddingRef.current = null;
        }
        const originals = originalTargetsPaddingRef.current || {};
        Object.keys(originals).forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            const prev = originals[id];
            el.style.paddingRight = prev ?? "";
        });
        originalTargetsPaddingRef.current = {};

        lockAppliedRef.current = false;
    };

    useEffect(() => {
        return () => restoreAll();
    }, []);

    if (typeof window === "undefined") return null;

    return createPortal(
        <LazyMotion features={domAnimation}>
            <AnimatePresence onExitComplete={restoreAll}>
                {open && (
                    <>
                        <m.div
                            className={twMerge(
                                "bg-black/55 fixed top-0 left-0 w-full h-full flex justify-center items-center z-[999]",
                                backdropClassName
                            )}
                            initial="unmount"
                            exit="unmount"
                            animate="mount"
                            variants={backdropAnimation}
                            transition={{ duration: 0.2 }}
                            onAnimationStart={() => {
                                if (open && !lockAppliedRef.current) lockAndPad();
                            }}
                            onClick={onClose}
                        />
                        <m.div
                            className={twMerge(
                                "fixed inset-0 h-max m-auto z-[9999] overflow-auto bg-white rounded-2xl",
                                className
                            )}
                            initial="unmount"
                            exit="unmount"
                            animate="mount"
                            variants={animation}
                            onAnimationStart={() => {
                                if (open && !lockAppliedRef.current) lockAndPad();
                            }}
                            onClick={(e) => e.stopPropagation()}
                        >
                            {children}
                        </m.div>
                    </>
                )}
            </AnimatePresence>
        </LazyMotion>,
        document.body
    );
};

// Header
interface HeaderProps {
    title?: string;
    onClose?: () => void;
    className?: string;
    titleClassName?: string;
    buttonClassName?: string;
}

const Header = ({
    title,
    className,
    titleClassName,
    buttonClassName,
    onClose,
}: HeaderProps) => {
    return (
        <div className={twMerge("flex items-center gap-4", className)}>
            <h4 className={twMerge("text-xl flex-1 font-semibold text-strong", titleClassName)}>
                {title}
            </h4>
            {onClose && (
                <button
                    className={twMerge(
                        "hover:bg-white/10 p-1 text-strong rounded-md transition-all",
                        buttonClassName
                    )}
                    onClick={onClose}
                >
                    <IconX size={20} />
                </button>
            )}
        </div>
    );
};

// Body
interface BodyProps {
    className?: string;
    children: ReactNode;
    id?: string;
}

const Body = ({ className, children, id }: BodyProps) => {
    return (
        <div
            className={twMerge(
                "max-h-[80vh] min-h-[100px] overflow-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-gray-200 [&::-webkit-scrollbar-thumb]:rounded-full",
                className
            )}
            id={id}
        >
            {children}
        </div>
    );
};

Dialog.Header = Header;
Dialog.Body = Body;

export default Dialog;
