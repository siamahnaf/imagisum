import { customAlphabet } from "nanoid";
import { alphanumeric } from "nanoid-dictionary";

export const nanoid = (
    { size = 35, prefix = "" }: { size?: number; prefix?: string } = {}
) => `${prefix}${customAlphabet(alphanumeric, size)()}`;
