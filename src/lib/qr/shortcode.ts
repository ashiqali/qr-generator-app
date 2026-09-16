import { customAlphabet } from "nanoid";

// Excludes visually ambiguous characters (0/O, 1/I/l) since short codes may be printed.
const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

export const generateShortCode = customAlphabet(ALPHABET, 7);
