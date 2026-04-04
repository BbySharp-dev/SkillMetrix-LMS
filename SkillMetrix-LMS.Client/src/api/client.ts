import createClient from "openapi-fetch";
import type { paths } from "./types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "";

export const apiClient = createClient<paths>({
  baseUrl: apiBaseUrl,
});
