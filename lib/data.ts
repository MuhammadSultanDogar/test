import type { JobFeed } from "@/types/job";
import { getWindow } from "@/lib/dates";
import { generateMockFeed } from "@/mocks/generateJobs";

const isLive = () => process.env.NEXT_PUBLIC_DATA_MODE === "live";

// API paths are origin-relative and intentionally NOT prefixed with the /capacity basePath:
// the portal proxies /api/* to the backend.
const JOBS_ENDPOINT = "/api/capacity/jobs";
const REFRESH_ENDPOINT = "/api/capacity/refresh";
const LOGIN_REDIRECT = "/login?next=/capacity";

export class UnauthorizedError extends Error {
  constructor() {
    super("Your session has expired. Redirecting to sign in.");
    this.name = "UnauthorizedError";
  }
}

function redirectToLogin(): never {
  if (typeof window !== "undefined") window.location.href = LOGIN_REDIRECT;
  throw new UnauthorizedError();
}

export async function getJobFeed(): Promise<JobFeed> {
  if (!isLive()) {
    // Small delay so loading states are visible in the demo.
    await new Promise((resolve) => setTimeout(resolve, 350));
    return generateMockFeed();
  }

  const { from, to } = getWindow();
  const res = await fetch(`${JOBS_ENDPOINT}?from=${from}&to=${to}`, {
    credentials: "include",
    cache: "no-store",
  });
  if (res.status === 401) redirectToLogin();
  if (!res.ok) throw new Error(`Could not load jobs from the bid calendar (HTTP ${res.status}).`);
  return (await res.json()) as JobFeed;
}

export async function refreshFeed(): Promise<JobFeed> {
  if (isLive()) {
    const res = await fetch(REFRESH_ENDPOINT, { method: "POST", credentials: "include" });
    if (res.status === 401) redirectToLogin();
    if (!res.ok) throw new Error(`Refresh from Ragic failed (HTTP ${res.status}).`);
  }
  return getJobFeed();
}
