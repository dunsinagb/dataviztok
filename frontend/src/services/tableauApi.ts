/**
 * Tableau Public API Service
 *
 * Fetches dashboards via the BFF search API, proxied through Vite
 * to bypass CORS (Tableau sends no Access-Control-Allow-Origin header).
 *
 * Vite proxy:  /api/tableau/*  →  https://public.tableau.com/*
 * Thumbnail:   /api/tableau/thumb/views/{workbook}/{view}
 */

export interface TableauViz {
  id: string;
  title: string;
  description: string;
  author: {
    displayName: string;
    profileName: string;
    profileUrl: string;
  };
  thumbnail: string;
  sourceUrl: string;
  viewCount: number;
  favoriteCount: number;
}

const FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string, ms = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

const SEARCH_TERMS = [
  // Health category focus (priority)
  "health analytics", "healthcare dashboard", "medical data", "hospital metrics",
  "patient care", "public health", "wellness tracking", "disease analysis",
  "mental health", "vaccination data", "health outcomes", "clinical dashboard",

  // Sports category focus (priority)
  "sports analytics", "NBA statistics", "football data", "soccer dashboard",
  "olympic games", "athlete performance", "sports betting", "game analysis",
  "basketball stats", "tennis rankings", "cricket analytics", "FIFA world cup",

  // Marketing category focus (priority)
  "marketing analytics", "campaign dashboard", "brand performance", "advertising metrics",
  "social media analytics", "customer engagement", "conversion funnel", "email marketing",
  "content marketing", "SEO analytics", "digital marketing", "marketing ROI",

  // Original high-quality terms
  "dashboard", "sales", "analytics", "finance", "revenue",
  "customer", "supply chain", "HR", "performance", "KPI",
  "business", "data visualization", "metrics", "trends", "insights",
  "report", "analysis", "statistics", "growth", "profit",
  "budget", "forecast", "inventory", "logistics", "productivity",
  "efficiency", "quality", "risk", "compliance", "retail",
  "ecommerce", "manufacturing", "energy", "education", "climate",
  "population", "covid", "world", "survey", "map",
];

function randomSearchTerm(): string {
  return SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
}

/**
 * Check if a Tableau view has a placeholder/generic thumbnail.
 * Generic view names like "Sheet1", "View1", "Dashboard" typically have placeholder images.
 */
function isPlaceholderThumbnail(defaultViewRepoUrl: string): boolean {
  const viewName = defaultViewRepoUrl.split('/').pop()?.toLowerCase() || '';
  const placeholderPatterns = [
    /^sheet\d*$/,        // Sheet, Sheet1, Sheet2...
    /^view\d*$/,         // View, View1, View2...
    /^dashboard\d*$/,    // Dashboard, Dashboard1...
    /^untitled/,         // Untitled workbooks
  ];
  return placeholderPatterns.some(pattern => pattern.test(viewName));
}

/**
 * Build a thumbnail URL from the defaultViewRepoUrl returned by the API.
 * API returns e.g. "SalesDashboard/sheets/Overview"
 * Thumbnail lives at /thumb/views/SalesDashboard/Overview  (strip "/sheets/")
 */
function buildThumbnailUrl(defaultViewRepoUrl: string): string {
  const cleaned = defaultViewRepoUrl.replace("/sheets/", "/");
  return `/api/tableau/thumb/views/${cleaned}`;
}

export async function fetchTableauDashboards(count = 20): Promise<TableauViz[]> {
  const query = randomSearchTerm();
  const start = Math.floor(Math.random() * 500); // Increased from 200 to 500 for more variety

  const url =
    `/api/tableau/public/apis/bff/v1/search/query-workbooks?` +
    new URLSearchParams({
      count: count.toString(),
      query,
      start: start.toString(),
      _t: Date.now().toString(), // Cache buster to ensure fresh results
    });

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Tableau API ${response.status}`);
  }

  const data = await response.json();
  const results: any[] = data.results ?? [];

  const vizzes: TableauViz[] = results
    .filter((r: any) => r.workbook?.defaultViewRepoUrl)
    .filter((r: any) => !isPlaceholderThumbnail(r.workbook.defaultViewRepoUrl))
    .map((r: any) => {
      const wb = r.workbook;
      return {
        id: wb.workbookRepoUrl ?? wb.defaultViewRepoUrl,
        title: wb.title ?? "Untitled",
        description: wb.description ?? "",
        author: {
          displayName: wb.authorDisplayName ?? "Unknown",
          profileName: wb.authorProfileName ?? "",
          profileUrl: `https://public.tableau.com/app/profile/${wb.authorProfileName}`,
        },
        thumbnail: buildThumbnailUrl(wb.defaultViewRepoUrl),
        sourceUrl: `https://public.tableau.com/app/profile/${wb.authorProfileName}/viz/${wb.defaultViewRepoUrl.replace("/sheets/", "/")}`,
        viewCount: wb.viewCount ?? 0,
        favoriteCount: wb.numberOfFavorites ?? 0,
      };
    });

  return vizzes;
}

export async function searchTableauByCategory(
  category: string,
  count = 20,
): Promise<TableauViz[]> {
  const start = Math.floor(Math.random() * 500); // Increased from 200 to 500

  const url =
    `/api/tableau/public/apis/bff/v1/search/query-workbooks?` +
    new URLSearchParams({
      count: count.toString(),
      query: category.toLowerCase(),
      start: start.toString(),
      _t: Date.now().toString(), // Cache buster
    });

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Tableau API ${response.status}`);
  }

  const data = await response.json();
  const results: any[] = data.results ?? [];

  return results
    .filter((r: any) => r.workbook?.defaultViewRepoUrl)
    .filter((r: any) => !isPlaceholderThumbnail(r.workbook.defaultViewRepoUrl))
    .map((r: any) => {
      const wb = r.workbook;
      return {
        id: wb.workbookRepoUrl ?? wb.defaultViewRepoUrl,
        title: wb.title ?? "Untitled",
        description: wb.description ?? "",
        author: {
          displayName: wb.authorDisplayName ?? "Unknown",
          profileName: wb.authorProfileName ?? "",
          profileUrl: `https://public.tableau.com/app/profile/${wb.authorProfileName}`,
        },
        thumbnail: buildThumbnailUrl(wb.defaultViewRepoUrl),
        sourceUrl: `https://public.tableau.com/app/profile/${wb.authorProfileName}/viz/${wb.defaultViewRepoUrl.replace("/sheets/", "/")}`,
        viewCount: wb.viewCount ?? 0,
        favoriteCount: wb.numberOfFavorites ?? 0,
      };
    });
}
