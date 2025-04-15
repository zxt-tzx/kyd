import { customAlphabet } from "nanoid";

export const nanoid = customAlphabet(
  // nolookalikesSafe see https://github.com/CyberAP/nanoid-dictionary?tab=readme-ov-file#nolookalikessafe
  "346789ABCDEFGHJKLMNPQRTUVWXYabcdefghijkmnpqrtwxyz",
  20,
);
