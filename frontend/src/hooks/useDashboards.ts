import { useState, useCallback, useEffect } from "react";
import { Dashboard, DashboardCategory, DashboardPlatform } from "../types/Dashboard";
import { DASHBOARD_LIBRARY } from "../data/dashboardLibrary";
import { shuffleArray } from "../utils/shuffleArray";
import { fetchTableauDashboards, searchTableauByCategory, TableauViz } from "../services/tableauApi";
import { fetchPowerBIDashboards, PowerBIDashboard } from "../services/powerbiApi";
import { fetchNovyProDashboards, NovyProDashboard } from "../services/novyproApi";

const DASHBOARDS_PER_LOAD = 20;

interface UseDashboardsOptions {
  category?: string | null;
}

function inferCategoryFromText(text: string): DashboardCategory {
  const t = text.toLowerCase();

  if (/financ|stock|economy|gdp|salary|revenue|profit|budget/.test(t))
    return DashboardCategory.Finance;
  if (/sport|nba|soccer|football|cricket|olympics|curling/.test(t))
    return DashboardCategory.Sports;
  if (/health|medical|covid|hospital|patient/.test(t))
    return DashboardCategory.Health;
  if (/educat|university|school|student|tuition/.test(t))
    return DashboardCategory.Education;
  if (/hr|employee|headcount|workforce|hiring/.test(t))
    return DashboardCategory.Operations;
  if (/histor|monarch|genealog|royal|politic|election/.test(t))
    return DashboardCategory.Social;
  if (/marketing|campaign|brand|advertis/.test(t))
    return DashboardCategory.Marketing;
  if (/sales|crm|pipeline|deal|quota/.test(t))
    return DashboardCategory.Sales;
  if (/climate|environment|emission|carbon|weather/.test(t))
    return DashboardCategory.Environment;

  return DashboardCategory.Technology;
}

function transformTableauViz(viz: TableauViz): Dashboard {
  return {
    id: viz.id,
    title: viz.title,
    description: viz.description || "Explore this interactive data visualization on Tableau Public.",
    author: {
      name: viz.author.displayName,
      profileUrl: viz.author.profileUrl,
    },
    thumbnailUrl: viz.thumbnail,
    sourceUrl: viz.sourceUrl,
    platform: DashboardPlatform.TableauPublic,
    category: inferCategoryFromText(`${viz.title} ${viz.description}`),
    viewCount: viz.viewCount,
    favoriteCount: viz.favoriteCount,
  };
}

function transformPowerBIDashboard(pbi: PowerBIDashboard): Dashboard {
  return {
    id: pbi.id,
    title: pbi.title,
    description: pbi.description,
    author: {
      name: pbi.author,
      profileUrl: pbi.postUrl,
    },
    thumbnailUrl: "",
    sourceUrl: pbi.embedUrl,
    platform: DashboardPlatform.PowerBI,
    category: inferCategoryFromText(`${pbi.title} ${pbi.description}`),
    publishedDate: pbi.publishedDate,
  };
}

function transformNovyProDashboard(np: NovyProDashboard): Dashboard {
  return {
    id: np.id,
    title: np.title,
    description: `${np.title} — an interactive ${np.platform} dashboard hosted on NovyPro.`,
    author: { name: "NovyPro Community" },
    thumbnailUrl: np.thumbnailUrl,
    sourceUrl: np.sourceUrl,
    platform: np.platform === "Tableau"
      ? DashboardPlatform.TableauPublic
      : DashboardPlatform.PowerBI,
    category: inferCategoryFromText(np.title),
  };
}

const GENERIC_DESCRIPTIONS = [
  "Explore this interactive data visualization on Tableau Public.",
];

function hasQualityContent(d: Dashboard): boolean {
  if (!d.thumbnailUrl) return false;
  if (!d.description) return false;
  if (GENERIC_DESCRIPTIONS.includes(d.description)) return false;
  if (d.description.startsWith("Explore this") && d.description.endsWith("on NovyPro."))
    return false;
  return true;
}

let cachedPowerBI: Dashboard[] | null = null;
let cachedNovyPro: Dashboard[] | null = null;

export function useDashboards(options: UseDashboardsOptions = {}) {
  const { category } = options;
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [shownIds, setShownIds] = useState<Set<string>>(new Set());
  const [useStaticFallback, setUseStaticFallback] = useState(false);

  const fetchDashboards = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      if (!useStaticFallback) {
        try {
          // NovyPro is a synchronous curated list — cache once
          if (!cachedNovyPro) {
            cachedNovyPro = fetchNovyProDashboards().map(transformNovyProDashboard);
          }

          // Fetch Tableau and Power BI in parallel
          const [tableauResult, powerbiResult] = await Promise.allSettled([
            category
              ? searchTableauByCategory(category, DASHBOARDS_PER_LOAD)
              : fetchTableauDashboards(DASHBOARDS_PER_LOAD),
            cachedPowerBI
              ? Promise.resolve(cachedPowerBI)
              : fetchPowerBIDashboards().then((items) => {
                  const transformed = items.map(transformPowerBIDashboard);
                  cachedPowerBI = transformed;
                  return transformed;
                }),
          ]);

          let newDashboards: Dashboard[] = [];

          // Add Tableau results
          if (tableauResult.status === "fulfilled" && tableauResult.value.length > 0) {
            newDashboards.push(...tableauResult.value.map(transformTableauViz));
          }

          // Add Power BI results (apply strict category filter since it's a cached finite set)
          if (powerbiResult.status === "fulfilled" && powerbiResult.value.length > 0) {
            const pbiItems = category
              ? powerbiResult.value.filter((d) => d.category === category)
              : powerbiResult.value;
            newDashboards.push(...pbiItems);
          }

          // Add NovyPro results (curated finite set, apply category filter)
          const novyItems = category
            ? cachedNovyPro.filter((d) => d.category === category)
            : cachedNovyPro;
          newDashboards.push(...novyItems);

          // Only keep dashboards with a real thumbnail and description
          newDashboards = newDashboards.filter(hasQualityContent);

          if (newDashboards.length === 0) {
            throw new Error("No dashboards from any API");
          }

          // Filter out already shown
          newDashboards = newDashboards.filter((d) => !shownIds.has(d.id));

          if (newDashboards.length === 0) {
            throw new Error("No new dashboards after filtering");
          }

          // Shuffle so all sources are interleaved
          newDashboards = shuffleArray(newDashboards);

          setDashboards((prev) => [...prev, ...newDashboards]);
          setShownIds((prev) => new Set([...prev, ...newDashboards.map((d) => d.id)]));
          setLoading(false);
          return;
        } catch (apiError) {
          console.warn("APIs unavailable, using static library:", apiError);
          setUseStaticFallback(true);
        }
      }

      // Static fallback
      let available = (category
        ? DASHBOARD_LIBRARY.filter((d) => d.category === category)
        : DASHBOARD_LIBRARY
      ).filter(hasQualityContent);

      available = available.filter((d) => !shownIds.has(d.id));

      if (available.length === 0) {
        setShownIds(new Set());
        available = (category
          ? DASHBOARD_LIBRARY.filter((d) => d.category === category)
          : DASHBOARD_LIBRARY
        ).filter(hasQualityContent);
      }

      const nextBatch = shuffleArray(available).slice(0, DASHBOARDS_PER_LOAD);

      setDashboards((prev) => [...prev, ...nextBatch]);
      setShownIds((prev) => new Set([...prev, ...nextBatch.map((d) => d.id)]));
    } catch (error) {
      console.error("Error fetching dashboards:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, shownIds, category, useStaticFallback]);

  const resetDashboards = useCallback(() => {
    setDashboards([]);
    setShownIds(new Set());
    setUseStaticFallback(false);
  }, []);

  useEffect(() => {
    resetDashboards();
  }, [category, resetDashboards]);

  return { dashboards, loading, fetchDashboards, resetDashboards };
}
