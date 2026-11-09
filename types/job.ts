// One row of the Ragic bid calendar: a job currently being estimated.
export type Job = {
  ragicId: number;
  jobId: string; // "26-21428"
  jobName: string;
  company: string;
  estimator: string | null; // null = unassigned
  hours: number | null; // estimating hours; null = not set; 0 is a valid value
  region: string | null; // sales region; null = no region
  estimateDue: string; // "YYYY-MM-DD"
  bidDate: string | null;
  salesRep: string;
  stage: string;
  substage: string;
  scope: string[];
  isCsc: boolean; // CSC Estimating jobs are tracked separately and excluded from totals
  note: string;
  url: string; // link to the Ragic record
};

export type JobFeed = { jobs: Job[]; fetchedAt: string; source: "ragic" | "mock" };
