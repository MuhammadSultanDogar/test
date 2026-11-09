import type { Job, JobFeed } from "@/types/job";
import { addDays, getWindow, isWeekend, parseISODate, toISODate } from "@/lib/dates";

const ESTIMATORS = [
  "Bill",
  "Zel",
  "Josh",
  "Jhon",
  "Enrique",
  "Ron",
  "Trey",
  "Andrew",
  "Wilmer",
  "Jarret",
  "Morris",
  "Abraham",
  "Pam",
  "Colby",
  "Colby & Pam",
  "Josh & Pam",
];

// Heavier weights for the senior estimators so the tables have a realistic spread.
const ESTIMATOR_WEIGHTS = [9, 7, 8, 6, 7, 5, 6, 5, 4, 4, 3, 3, 5, 4, 2, 2];

const REGIONS = ["Midwest", "Northeast", "Pacific Northwest", "South Central", "Southeast", "West"];

const SALES_REPS = [
  "Dana Whitfield",
  "Marcus Lee",
  "Carla Jimenez",
  "Tom Brennan",
  "Priya Natarajan",
  "Greg Halvorsen",
  "Lauren Mbeki",
  "Steve Kowalski",
];

const COMPANIES = [
  "Turner Construction",
  "McCarthy Building Cos.",
  "Hensel Phelps",
  "Skanska USA",
  "Gilbane Building Co.",
  "Mortenson",
  "Clayco",
  "Brasfield & Gorrie",
  "DPR Construction",
  "Whiting-Turner",
  "Barton Malow",
  "Hoar Construction",
  "Layton Construction",
  "JE Dunn",
  "Robins & Morton",
  "Alberici",
  "Pepper Construction",
  "Ryan Companies",
  "Messer Construction",
  "Sundt Construction",
  "Kiewit Building Group",
  "Pankow Builders",
  "Linbeck Group",
  "Choate Construction",
];

const PLACES = [
  "Riverside",
  "Cedar Ridge",
  "Oak Hollow",
  "Lakeshore",
  "Northgate",
  "Pine Valley",
  "Harbor Point",
  "Westfield",
  "Stone Creek",
  "Maple Grove",
  "Eagle Crossing",
  "Summit Park",
  "Bayview",
  "Ironwood",
  "Canyon Springs",
  "Willow Bend",
  "Fox Run",
  "Granite Falls",
  "Mill Creek",
  "Prairie View",
  "Copper Hill",
  "Sandy Ridge",
];

const BUILDINGS = [
  "Distribution Center",
  "Medical Office Building",
  "Elementary School Addition",
  "High School Gymnasium",
  "Fire Station No. 4",
  "Parking Structure",
  "Data Center Phase 2",
  "Cold Storage Warehouse",
  "Community Recreation Center",
  "Manufacturing Expansion",
  "Retail Center",
  "Senior Living Facility",
  "Corporate Headquarters",
  "Logistics Hub",
  "Public Library",
  "Hospital Tower Expansion",
  "Middle School",
  "Church Fellowship Hall",
  "Aquatic Center",
  "Industrial Flex Building",
  "University Science Hall",
  "Hotel & Conference Center",
];

const SCOPES = ["Metal Deck", "Bar Joist", "Joist Girders", "Composite Deck", "Roof Deck", "Accessories"];

const SUBSTAGES = ["Takeoff", "Pricing", "In Review", "Awaiting Addenda", "Ready to Quote"];

const NOTES = [
  "",
  "",
  "",
  "Addendum 2 received, revise deck gauge.",
  "GC requested alternate for acoustical deck.",
  "Waiting on structural drawings from EOR.",
  "Budget number only, no erection.",
  "Customer wants joist and deck as separate line items.",
  "Confirm galvanized vs. painted finish.",
  "Long-span joists, check freight.",
  "Rebid of last year's project, use prior takeoff.",
  "Phased delivery, three releases.",
];

/** Small, fast, seedable PRNG so the demo data is identical on every load. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const JOB_COUNT = 220;
const SEED = 21428;

export function generateMockJobs(today: Date = new Date()): Job[] {
  const rand = mulberry32(SEED);
  const pick = <T,>(list: readonly T[]): T => list[Math.floor(rand() * list.length)];
  const chance = (p: number) => rand() < p;
  const weighted = <T,>(list: readonly T[], weights: number[]): T => {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = rand() * total;
    for (let i = 0; i < list.length; i++) {
      r -= weights[i];
      if (r <= 0) return list[i];
    }
    return list[list.length - 1];
  };

  const window = getWindow(today);
  const weekdays = window.dates.filter((d) => !isWeekend(d));
  const weekends = window.dates.filter((d) => isWeekend(d));
  const yearPrefix = String(today.getFullYear()).slice(-2);

  const jobs: Job[] = [];
  for (let i = 0; i < JOB_COUNT; i++) {
    const ragicId = 4100 + i * 3 + Math.floor(rand() * 3);
    const estimateDue = chance(0.1) ? pick(weekends) : pick(weekdays);
    const isCsc = chance(0.1);

    let estimator: string | null = isCsc ? "CSC Estimating" : weighted(ESTIMATORS, ESTIMATOR_WEIGHTS);
    if (!isCsc && chance(0.12)) estimator = null;

    let hours: number | null = Math.round((0.5 + rand() * 11.5) * 2) / 2;
    const hoursRoll = rand();
    if (hoursRoll < 0.15) hours = null;
    else if (hoursRoll < 0.2) hours = 0;

    const region = chance(0.08) ? null : pick(REGIONS);
    const scopeCount = 1 + Math.floor(rand() * 3);
    const scope = [...new Set(Array.from({ length: scopeCount }, () => pick(SCOPES)))];
    const bidDate = chance(0.85)
      ? toISODate(addDays(parseISODate(estimateDue), 2 + Math.floor(rand() * 8)))
      : null;

    jobs.push({
      ragicId,
      jobId: `${yearPrefix}-${21000 + i * 7 + Math.floor(rand() * 7)}`,
      jobName: `${pick(PLACES)} ${pick(BUILDINGS)}`,
      company: pick(COMPANIES),
      estimator,
      hours,
      region,
      estimateDue,
      bidDate,
      salesRep: pick(SALES_REPS),
      stage: "Estimating",
      substage: pick(SUBSTAGES),
      scope,
      isCsc,
      note: pick(NOTES),
      url: `https://www.ragic.com/omd/bid-calendar/1/${ragicId}`,
    });
  }

  return jobs.sort((a, b) => a.estimateDue.localeCompare(b.estimateDue) || a.jobId.localeCompare(b.jobId));
}

export function generateMockFeed(now: Date = new Date()): JobFeed {
  // About three days old so the stale-data banner is visible in the demo.
  const fetchedAt = new Date(now.getTime() - (3 * 24 + 2) * 3_600_000).toISOString();
  return { jobs: generateMockJobs(now), fetchedAt, source: "mock" };
}
