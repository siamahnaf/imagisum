import localFont from "next/font/local";
import { Inter } from "next/font/google";

export const clashGroteskSemibold = localFont({
    src: [
        {
            path: "./file/ClashGroteskSemibold.woff",
            weight: "700",
            style: "normal"
        }
    ],
    display: "swap"
});