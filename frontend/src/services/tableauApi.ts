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
  "dashboard", "sales", "analytics", "marketing", "finance",
  "health", "education", "climate", "population", "sports",
  "covid", "supply chain", "HR", "revenue", "customer",
  "world", "survey", "performance", "KPI", "map",
];

function randomSearchTerm(): string {
  return SEARCH_TERMS[Math.floor(Math.random() * SEARCH_TERMS.length)];
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
  const start = Math.floor(Math.random() * 200);

  const url =
    `/api/tableau/public/apis/bff/v1/search/query-workbooks?` +
    new URLSearchParams({
      count: count.toString(),
      query,
      start: start.toString(),
    });

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Tableau API ${response.status}`);
  }

  const data = await response.json();
  const results: any[] = data.results ?? [];

  const vizzes: TableauViz[] = results
    .filter((r: any) => r.workbook?.defaultViewRepoUrl)
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
  const start = Math.floor(Math.random() * 200);

  const url =
    `/api/tableau/public/apis/bff/v1/search/query-workbooks?` +
    new URLSearchParams({
      count: count.toString(),
      query: category.toLowerCase(),
      start: start.toString(),
    });

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Tableau API ${response.status}`);
  }

  const data = await response.json();
  const results: any[] = data.results ?? [];

  return results
    .filter((r: any) => r.workbook?.defaultViewRepoUrl)
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
