/**
 * NovyPro Dashboard Service
 *
 * NovyPro hosts Power BI and Tableau dashboards with screenshot thumbnails.
 * It's built on Bubble.io with no public JSON API, so we use a curated seed
 * list of popular projects. Each entry's thumbnail comes from the og:image
 * meta tag on its project page (hosted on Bubble.io CDN).
 *
 * Proxy:  /api/novypro/*  →  https://www.novypro.com/*
 */

export interface NovyProDashboard {
  id: string;
  slug: string;
  title: string;
  thumbnailUrl: string;
  sourceUrl: string;
  platform: "PowerBI" | "Tableau" | "Excel";
}

const SEED_DASHBOARDS: NovyProDashboard[] = [
  {
    id: "novypro-data-professional-survey",
    slug: "data-professional-survey",
    title: "Data Professional Survey",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1677045621969x269664931804364900/Perform.png",
    sourceUrl: "https://www.novypro.com/project/data-professional-survey",
    platform: "PowerBI",
  },
  {
    id: "novypro-hr-analytics-dashboard",
    slug: "hr-analytics-dashboard",
    title: "HR Analytics Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1710953219775x552549527480698000/Screenshot%202024-03-20%20221650.png",
    sourceUrl: "https://www.novypro.com/project/hr-analytics-dashboard",
    platform: "Tableau",
  },
  {
    id: "novypro-global-superstore-2",
    slug: "global-superstore-2",
    title: "Global Superstore Visualization",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1674371817236x387752939589581760/Global%20superstore.GIF",
    sourceUrl: "https://www.novypro.com/project/global-superstore-2",
    platform: "PowerBI",
  },
  {
    id: "novypro-ecommerce-sales-dashboard-2",
    slug: "ecommerce-sales-dashboard-2",
    title: "Ecommerce Sales Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1685025932880x810820871735686800/polotno.png",
    sourceUrl: "https://www.novypro.com/project/ecommerce-sales-dashboard-2",
    platform: "PowerBI",
  },
  {
    id: "novypro-pizza-sales-dashboard-2",
    slug: "pizza-sales-dashboard-2",
    title: "Pizza Sales Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1685979130284x828327571288114200/cover%20photo.png",
    sourceUrl: "https://www.novypro.com/project/pizza-sales-dashboard-2",
    platform: "PowerBI",
  },
  {
    id: "novypro-amazon-prime-video-analysis",
    slug: "amazon-prime-video-analysis",
    title: "Amazon Prime Video Analysis",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1687749441988x195301728857604000/Screenshot_20230626-084254~2.png",
    sourceUrl: "https://www.novypro.com/project/amazon-prime-video-analysis",
    platform: "PowerBI",
  },
  {
    id: "novypro-spotify-dashboard-3",
    slug: "spotify-dashboard-3",
    title: "Spotify Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1696765071164x660703553075241900/Spotify%20Dashboard.jpg",
    sourceUrl: "https://www.novypro.com/project/spotify-dashboard-3",
    platform: "Tableau",
  },
  {
    id: "novypro-financial-dashboard-14",
    slug: "financial-dashboard-14",
    title: "Financial Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1696615919262x993075957420202400/Screenshot%202023-10-06%20130623.png",
    sourceUrl: "https://www.novypro.com/project/financial-dashboard-14",
    platform: "PowerBI",
  },
  {
    id: "novypro-supply-chain-dashboard",
    slug: "supply-chain-dashboard",
    title: "Supply Chain Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1683401988384x652005874943743900/Supply%20chain.jpg",
    sourceUrl: "https://www.novypro.com/project/supply-chain-dashboard",
    platform: "PowerBI",
  },
  {
    id: "novypro-customer-churn-analysis-2",
    slug: "customer-churn-analysis-2",
    title: "Customer Churn Analysis",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1659192159052x553826728428714640/Picture3.png",
    sourceUrl: "https://www.novypro.com/project/customer-churn-analysis-2",
    platform: "PowerBI",
  },
  {
    id: "novypro-covid-19-dashboard-6",
    slug: "covid-19-dashboard-6",
    title: "Covid-19 Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1690632876787x724465899254234100/Covid%20Report%20ScreenShot.png",
    sourceUrl: "https://www.novypro.com/project/covid-19-dashboard-6",
    platform: "PowerBI",
  },
  {
    id: "novypro-world-population-dashboard",
    slug: "world-population-dashboard",
    title: "World Population Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1690732163351x215313412397817100/Screenshot%202023-07-30%20210241.png",
    sourceUrl: "https://www.novypro.com/project/world-population-dashboard",
    platform: "PowerBI",
  },
  {
    id: "novypro-hotel-revenue-dashboard",
    slug: "hotel-revenue-dashboard",
    title: "Hotel Revenue Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1656265073068x465176394307248000/cover.PNG",
    sourceUrl: "https://www.novypro.com/project/hotel-revenue-dashboard",
    platform: "PowerBI",
  },
  {
    id: "novypro-road-accident-dashboard",
    slug: "road-accident-dashboard",
    title: "Road Accident Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1680600375735x265127500650479840/Road%20Accident%20Dashboard.jpg",
    sourceUrl: "https://www.novypro.com/project/road-accident-dashboard",
    platform: "PowerBI",
  },
  {
    id: "novypro-netflix-dashboard-4",
    slug: "netflix-dashboard-4",
    title: "Netflix Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1683356107931x317784645789961150/Screenshot%20%2818%29.png",
    sourceUrl: "https://www.novypro.com/project/netflix-dashboard-4",
    platform: "PowerBI",
  },
  {
    id: "novypro-space-missions-dashboard",
    slug: "space-missions-dashboard",
    title: "Space Missions Dashboard",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1680173890814x383744626518736800/Space%20Challenge%203.png",
    sourceUrl: "https://www.novypro.com/project/space-missions-dashboard",
    platform: "PowerBI",
  },
  {
    id: "novypro-adventure-works-report",
    slug: "adventure-works-report",
    title: "Adventure Works Report",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1655127628085x305080668323486140/AdventureWorks_Logo.png",
    sourceUrl: "https://www.novypro.com/project/adventure-works-report",
    platform: "PowerBI",
  },
  {
    id: "novypro-bank-loan-report",
    slug: "bank-loan-report",
    title: "Bank Loan Report",
    thumbnailUrl:
      "https://f2fa1cdd9340fae53fcb49f577292458.cdn.bubble.io/cdn-cgi/image/w=,h=,f=auto,dpr=1,fit=contain/f1701696478220x412249915990586400/Bank%20loan%20img.png",
    sourceUrl: "https://www.novypro.com/project/bank-loan-report",
    platform: "PowerBI",
  },
];

/**
 * Return the curated list of NovyPro dashboards.
 * Optionally tries to discover new projects at runtime by scraping
 * a project page via the proxy and extracting the og:image meta tag.
 */
export function fetchNovyProDashboards(): NovyProDashboard[] {
  return [...SEED_DASHBOARDS];
}

/**
 * Try to fetch a NovyPro project page and extract og:image.
 * Useful for expanding the curated list over time.
 */
export async function scrapeNovyProProject(
  slug: string,
): Promise<NovyProDashboard | null> {
  try {
    const response = await fetch(`/api/novypro/project/${slug}`, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) return null;

    const html = await response.text();

    const imgMatch = html.match(
      /<meta[^>]*property=["']og:image["'][^>]*content=["']([^"' ]+)["']/,
    );
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);

    const thumbnailUrl = imgMatch?.[1] ?? "";
    if (!thumbnailUrl || thumbnailUrl.includes("SEO%20Image")) return null;

    const titleParts = (titleMatch?.[1] ?? slug).split("|").map((s) => s.trim());
    const platform = titleParts[0] as "PowerBI" | "Tableau" | "Excel";
    const title = titleParts[2] ?? titleParts[0] ?? slug;

    return {
      id: `novypro-${slug}`,
      slug,
      title,
      thumbnailUrl,
      sourceUrl: `https://www.novypro.com/project/${slug}`,
      platform: ["PowerBI", "Tableau", "Excel"].includes(platform)
        ? platform
        : "PowerBI",
    };
  } catch {
    return null;
  }
}
