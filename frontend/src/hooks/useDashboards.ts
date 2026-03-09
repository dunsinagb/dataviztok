import { useState, useCallback, useEffect } from "react";
import { Dashboard, DashboardCategory, DashboardPlatform } from "../types/Dashboard";
import { DASHBOARD_LIBRARY } from "../data/dashboardLibrary";
import { shuffleArray, weightedShuffle } from "../utils/shuffleArray";
import { fetchTableauDashboards, searchTableauByCategory, TableauViz } from "../services/tableauApi";
import { fetchPowerBIDashboards, PowerBIDashboard } from "../services/powerbiApi";
import { fetchNovyProDashboards, NovyProDashboard } from "../services/novyproApi";

const DASHBOARDS_PER_LOAD = 45;

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
    author: { name: np.author, profileUrl: np.sourceUrl },
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

function meetsMinimumQuality(d: Dashboard): boolean {
  // Hard requirements
  if (!d.thumbnailUrl) return false;
  if (!d.description) return false;
  if (GENERIC_DESCRIPTIONS.includes(d.description)) return false;
  if (d.title.length < 5 || d.title === "Untitled") return false;

  // Detect Tableau placeholder URL patterns (secondary filter)
  if (d.platform === DashboardPlatform.TableauPublic) {
    const urlPath = d.thumbnailUrl.toLowerCase();
    if (/\/sheet\d*$/i.test(urlPath) ||
        /\/view\d*$/i.test(urlPath) ||
        /\/dashboard\d*$/i.test(urlPath)) {
      return false;
    }
  }

  return true;
}

function calculateQualityScore(d: Dashboard): number {
  let score = 10; // Base score

  // Tableau engagement metrics
  if (d.viewCount !== undefined && d.favoriteCount !== undefined) {
    // View count (logarithmic scale)
    if (d.viewCount >= 10000) score += 30;
    else if (d.viewCount >= 5000) score += 25;
    else if (d.viewCount >= 1000) score += 20;
    else if (d.viewCount >= 500) score += 10;
    else if (d.viewCount >= 100) score += 5;

    // Favorite count
    if (d.favoriteCount >= 100) score += 25;
    else if (d.favoriteCount >= 50) score += 20;
    else if (d.favoriteCount >= 20) score += 15;
    else if (d.favoriteCount >= 10) score += 10;
    else if (d.favoriteCount >= 5) score += 5;

    // Engagement ratio bonus
    const engagementRatio = d.favoriteCount / Math.max(d.viewCount, 1);
    if (engagementRatio > 0.01) score += 15;
    else if (engagementRatio > 0.005) score += 10;
    else if (engagementRatio > 0.001) score += 5;
  } else {
    // PowerBI and NovyPro are curated
    if (d.platform === DashboardPlatform.PowerBI) score += 40;
    if (d.platform === DashboardPlatform.TableauPublic && d.sourceUrl.includes("novypro")) {
      score += 35;
    }
  }

  // Description quality
  if (d.description.length > 100) score += 5;
  if (d.description.length > 200) score += 5;

  // Professional title
  if (!/^[A-Z\s]+$/.test(d.title) && d.title.length > 10) score += 5;

  return score;
}

function getCategoryBoost(d: Dashboard, selectedCategory: string | null): number {
  // Only boost when viewing "all categories"
  if (selectedCategory !== null) return 0;

  const PRIORITY_CATEGORIES: Record<string, number> = {
    [DashboardCategory.Health]: 25,
    [DashboardCategory.Sports]: 25,
    [DashboardCategory.Marketing]: 25,
  };

  const SECONDARY_BOOST: Record<string, number> = {
    [DashboardCategory.Finance]: 10,
    [DashboardCategory.Environment]: 10,
    [DashboardCategory.Social]: 5,
  };

  return PRIORITY_CATEGORIES[d.category] || SECONDARY_BOOST[d.category] || 0;
}

function getFinalScore(d: Dashboard, selectedCategory: string | null): number {
  return calculateQualityScore(d) + getCategoryBoost(d, selectedCategory);
}

function ensureSourceDiversity(dashboards: Dashboard[]): Dashboard[] {
  if (dashboards.length <= 10) return dashboards;

  // Group by platform
  const platformGroups = new Map<DashboardPlatform, Dashboard[]>();

  dashboards.forEach(d => {
    if (!platformGroups.has(d.platform)) {
      platformGroups.set(d.platform, []);
    }
    platformGroups.get(d.platform)!.push(d);
  });

  // Round-robin selection from each platform
  const balanced: Dashboard[] = [];
  const platformIterators = new Map<DashboardPlatform, number>();
  platformGroups.forEach((_, platform) => platformIterators.set(platform, 0));

  while (balanced.length < dashboards.length) {
    let addedThisRound = false;

    platformGroups.forEach((group, platform) => {
      const idx = platformIterators.get(platform)!;
      if (idx < group.length && balanced.length < dashboards.length) {
        balanced.push(group[idx]);
        platformIterators.set(platform, idx + 1);
        addedThisRound = true;
      }
    });

    if (!addedThisRound) break;
  }

  return balanced;
}

// Remove cachedPowerBI - fetch fresh each time for variety
let cachedNovyPro: Dashboard[] | null = null;

export function useDashboards(options: UseDashboardsOptions = {}) {
  const { category } = options;
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(false);
  const [shownIds, setShownIds] = useState<Set<string>>(() => {
    // Load from localStorage on init to persist across sessions
    const saved = localStorage.getItem('shownDashboardIds');
    if (saved) {
      try {
        const ids = JSON.parse(saved);
        return new Set(ids);
      } catch {
        return new Set();
      }
    }
    return new Set();
  });
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

          // Fetch Tableau and Power BI in parallel (fresh each time for variety)
          const [tableauResult, powerbiResult] = await Promise.allSettled([
            category
              ? searchTableauByCategory(category, DASHBOARDS_PER_LOAD)
              : fetchTableauDashboards(DASHBOARDS_PER_LOAD),
            fetchPowerBIDashboards().then((items) => items.map(transformPowerBIDashboard)),
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

          // Only keep dashboards meeting minimum quality
          newDashboards = newDashboards.filter(meetsMinimumQuality);

          if (newDashboards.length === 0) {
            throw new Error("No dashboards from any API");
          }

          // Filter out already shown
          newDashboards = newDashboards.filter((d) => !shownIds.has(d.id));

          if (newDashboards.length === 0) {
            throw new Error("No new dashboards after filtering");
          }

          // Apply weighted shuffle based on quality + category boost
          newDashboards = weightedShuffle(newDashboards, (d) => getFinalScore(d, category ?? null));

          // Ensure source diversity (no single platform dominates)
          newDashboards = ensureSourceDiversity(newDashboards);

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
      ).filter(meetsMinimumQuality);

      available = available.filter((d) => !shownIds.has(d.id));

      if (available.length === 0) {
        setShownIds(new Set());
        available = (category
          ? DASHBOARD_LIBRARY.filter((d) => d.category === category)
          : DASHBOARD_LIBRARY
        ).filter(meetsMinimumQuality);
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

  // Persist shownIds to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('shownDashboardIds', JSON.stringify(Array.from(shownIds)));
  }, [shownIds]);

  // Cleanup: keep only the last 100 IDs when exceeding 200
  useEffect(() => {
    if (shownIds.size > 200) {
      const idsArray = Array.from(shownIds);
      const recentIds = idsArray.slice(-100);
      setShownIds(new Set(recentIds));
    }
  }, [shownIds]);

  useEffect(() => {
    resetDashboards();
  }, [category, resetDashboards]);

  return { dashboards, loading, fetchDashboards, resetDashboards };
}
