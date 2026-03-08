/**
 * Power BI Data Stories Gallery Service
 *
 * Fetches dashboards from Microsoft Fabric Community's Data Stories Gallery
 * via RSS feed, proxied through Vite / Vercel to bypass CORS.
 *
 * RSS: /api/powerbi/oxcrx34285/rss/board?board.id=DataStoriesGallery
 * Embed URL: https://app.powerbi.com/view?r={reportId}
 */

export interface PowerBIDashboard {
  id: string;
  title: string;
  description: string;
  author: string;
  postUrl: string;
  embedUrl: string;
  publishedDate: string;
}

const FETCH_TIMEOUT_MS = 8000;

function fetchWithTimeout(url: string, ms = FETCH_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(timer));
}

function stripHtml(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  return doc.body.textContent?.trim() ?? "";
}

function extractReportId(descriptionHtml: string): string | null {
  const match = descriptionHtml.match(/reportid[^>]*>([\w+/=%]+)<\/SPAN>/i);
  if (!match) return null;
  return decodeURIComponent(match[1]);
}

function parseRssItems(xml: string): PowerBIDashboard[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, "text/xml");

  const parseError = doc.querySelector("parsererror");
  if (parseError) {
    throw new Error("Failed to parse Power BI RSS feed");
  }

  const items = doc.querySelectorAll("item");
  const dashboards: PowerBIDashboard[] = [];

  items.forEach((item) => {
    const title = item.querySelector("title")?.textContent?.trim() ?? "";
    const link = item.querySelector("link")?.textContent?.trim() ?? "";
    const descRaw = item.querySelector("description")?.textContent ?? "";
    const author =
      item.getElementsByTagNameNS("http://purl.org/dc/elements/1.1/", "creator")[0]
        ?.textContent?.trim() ?? "Unknown";
    const pubDate =
      item.querySelector("pubDate")?.textContent?.trim() ?? "";

    const reportId = extractReportId(descRaw);
    if (!reportId || !title) return;

    const plainDesc = stripHtml(descRaw);
    const description =
      plainDesc.length > 300 ? plainDesc.slice(0, 297) + "..." : plainDesc;

    dashboards.push({
      id: `pbi-${reportId.slice(0, 20)}`,
      title,
      description: description || "Explore this Power BI data story.",
      author,
      postUrl: link,
      embedUrl: `https://app.powerbi.com/view?r=${reportId}`,
      publishedDate: pubDate,
    });
  });

  return dashboards;
}

export async function fetchPowerBIDashboards(): Promise<PowerBIDashboard[]> {
  const url =
    "/api/powerbi/oxcrx34285/rss/board?board.id=DataStoriesGallery";

  const response = await fetchWithTimeout(url);

  if (!response.ok) {
    throw new Error(`Power BI RSS feed ${response.status}`);
  }

  const xml = await response.text();
  return parseRssItems(xml);
}
