import useSWRLib from "swr";

export const SITE_URL =
  process.env.NEXT_PUBLIC_VERCEL_ENV === "production"
    ? "https://www.discove.xyz"
    : process.env.NEXT_PUBLIC_VERCEL_URL
    ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
    : "http://localhost:3000";

export type ApiError = Error & {
  info: any;
  status: number;
};

export const fetcher = async <T>(arg: string): Promise<T> => {
  const res = await fetch(
    arg.startsWith("https://") || arg.startsWith("http://")
      ? arg
      : `${SITE_URL}${arg}`
  );

  // If the status code is not in the range 200-299,
  // we still try to parse and throw it.
  if (!res.ok) {
    const error: ApiError = new Error(
      "An error occurred while fetching the data."
    ) as ApiError;
    // Attach extra info to the error object.
    error.info = await res.json();
    error.status = res.status;
    throw error;
  }

  return res.json();
};

export function useSWR<T = any, ErrorType = any>(
  path: string | null,
  options?: any
) {
  return useSWRLib<T, ErrorType, string | null>(path, fetcher, options);
}
