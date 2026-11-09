import type { Job } from "@/types/job";

export type DashboardMode = "estimator" | "manager";

export type JobSelection = {
  title: string;
  description: string;
  jobs: Job[];
};
