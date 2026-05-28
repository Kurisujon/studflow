const DEFAULT_API_BASE_URL = "http://127.0.0.1:8000";
const BROWSER_API_BASE_URL = "";

export const API_BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL
    : BROWSER_API_BASE_URL;
