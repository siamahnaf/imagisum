"use client"
import { ReactNode } from "react";
import { m, AnimatePresence, domAnimation, LazyMotion } from "framer-motion";
import { createPortal } from "react-dom";

//Interface
interface Props {
    open: boolean;
    onClose: () => void;
    children?: ReactNode;
    backdropClassName?: string;
    className?: string;
}

const Dialog = ({ open, onClose, children, backdropClassName, className }: Props) => {
    const animation = {
        unmount: {
            opacity: 0,
            y: -8,
            transition: {
                duration: 0.15,
            },
        },
        mount: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.15,
            },
        },
    };
    const backdropAnimation = {
        unmount: {
            opacity: 0,
            transition: {
                delay: 0.1,
            },
        },
        mount: {
            opacity: 1,
        },
    };

    if (typeof window === "undefined") return null;

    return createPortal(
        <LazyMotion features={domAnimation}>
            <AnimatePresence>
                {open &&
                    <>
                        <m.div
                            className={`bg-black/55 fixed top-0 left-0 w-full h-full flex justify-center items-center z-[99999999] ${backdropClassName}`}
                            initial="unmount"
                            exit="unmount"
                            animate={open ? "mount" : "unmount"}
                            variants={backdropAnimation}
                            transition={{ duration: 0.2 }}
                            onClick={onClose}
                        />
                        <m.div
                            className={`fixed top-1/2 left-1/2 -translate-1/2 z-[999999999] overflow-auto ${className}`}
                            initial="unmount"
                            exit="unmount"
                            animate={open ? "mount" : "unmount"}
                            variants={animation}
                        >
                            {children}
                        </m.div>
                    </>
                }
            </AnimatePresence>
        </LazyMotion>,
        document.body
    );
};

export default Dialog;