import { Dashboard, DashboardCategory, DashboardPlatform } from '../types/Dashboard';
import { shuffleArray } from '../utils/shuffleArray';

/**
 * Curated library of data visualization dashboards
 * Featuring real Tableau Public visualizations
 */
export const DASHBOARD_LIBRARY: Dashboard[] = [
  {
    id: "tableau-radar-microscope",
    title: "Radar Chart with built-in Microscope",
    description: "Naive, Modular, and Interactive — No Table Calcs or Extensions. Hover on dimension to zoom in. The main Radar Chart consists of 5 layers with custom interactive features.",
    author: {
      name: "antichaos",
      profileUrl: "https://public.tableau.com/app/profile/antichaos"
    },
    category: DashboardCategory.Technology,
    thumbnailUrl: "/thumbnails/radar-chart.png",
    sourceUrl: "https://public.tableau.com/app/profile/antichaos/viz/RadarChartwithbuilt-inMicroscope/RadarChart",
    platform: DashboardPlatform.TableauPublic,
    publishedDate: "2024-03-06",
    tags: ["radar chart", "interactive", "innovation", "custom viz"]
  },
  {
    id: "tableau-monaco-monarchy",
    title: "Monarchy of Monaco - House of Grimaldi",
    description: "Monaco has been ruled by the Grimaldi dynasty since 1297, making it one of Europe's longest-ruling families. Tree of succession showing the monarchy from 1297 to now.",
    author: {
      name: "Iaroslava",
      profileUrl: "https://public.tableau.com/app/profile/iaroslava"
    },
    category: DashboardCategory.Social,
    thumbnailUrl: "/thumbnails/monaco-monarchy.png",
    sourceUrl: "https://public.tableau.com/app/profile/iaroslava/viz/MonarchyofMonacoHouseofGrimaldi/Monaco",
    platform: DashboardPlatform.TableauPublic,
    publishedDate: "2024-03-05",
    tags: ["history", "monarchy", "genealogy", "Monaco", "royal family"]
  },
  {
    id: "tableau-employment-hero",
    title: "Employment Hero - Headcount Performance",
    description: "HR analytics dashboard showing headcount summary, salary distribution, satisfaction ratings, and performance scores. Includes employee growth trends and department breakdowns by roles.",
    author: {
      name: "Alice Rooney",
      profileUrl: "https://public.tableau.com/app/profile/alice.rooney"
    },
    category: DashboardCategory.Operations,
    thumbnailUrl: "/thumbnails/employment-hero.png",
    sourceUrl: "https://public.tableau.com/app/profile/alice.rooney/viz/EmploymentHero-HeadcountPerformance/Summary",
    platform: DashboardPlatform.TableauPublic,
    publishedDate: "2024-01-15",
    tags: ["HR", "analytics", "headcount", "performance", "salary"]
  },
  {
    id: "tableau-gdp-per-capita",
    title: "GDP per capita - Global Prosperity",
    description: "GDP per capita in constant international dollars from World Bank data. Visualizes global economic prosperity and development across countries over time.",
    author: {
      name: "Oluwadunsin Agbolabori",
      profileUrl: "https://public.tableau.com/app/profile/oluwadunsin.agbolabori"
    },
    category: DashboardCategory.Finance,
    thumbnailUrl: "/thumbnails/Global-Prosperity.png",
    sourceUrl: "https://public.tableau.com/app/profile/oluwadunsin.agbolabori/viz/GDPpercapitaInconstantinternational-WorldBank/Dashboard1",
    platform: DashboardPlatform.TableauPublic,
    publishedDate: "2024-03-08",
    tags: ["GDP", "economics", "world bank", "prosperity", "global"]
  },
  {
    id: "tableau-bi-analyst-salaries",
    title: "Average Salaries for Business Intelligence Analysts across U.S.",
    description: "May 2024 average salary data for Business Intelligence Analysts across the United States. Compare compensation by state and region.",
    author: {
      name: "Oluwadunsin Agbolabori",
      profileUrl: "https://public.tableau.com/app/profile/oluwadunsin.agbolabori"
    },
    category: DashboardCategory.Finance,
    thumbnailUrl: "/thumbnails/average-salary.png",
    sourceUrl: "https://public.tableau.com/app/profile/oluwadunsin.agbolabori/viz/May2024Avg_SalariesforBusinessIntelligenceAnalystsacrossU_S_/Dashboard",
    platform: DashboardPlatform.TableauPublic,
    publishedDate: "2024-05-01",
    tags: ["salary", "BI analyst", "USA", "compensation", "jobs"]
  },
  {
    id: "tableau-europe-study-costs",
    title: "Top 10 Most Expensive Countries to Study in Europe",
    description: "MakeoverMonday Week 5: Visualizes the most expensive European countries for international students. Compare tuition costs and living expenses across Europe.",
    author: {
      name: "Oluwadunsin Agbolabori",
      profileUrl: "https://public.tableau.com/app/profile/oluwadunsin.agbolabori"
    },
    category: DashboardCategory.Education,
    thumbnailUrl: "/thumbnails/most-expensive.png",
    sourceUrl: "https://public.tableau.com/app/profile/oluwadunsin.agbolabori/viz/Top10MostExpensiveCountriestostudyinEuropeMakeoverMondayWeek5/Top10MostExpensiveCountriestostudyinEurope",
    platform: DashboardPlatform.TableauPublic,
    publishedDate: "2024-02-01",
    tags: ["education", "Europe", "tuition", "MakeoverMonday", "students"]
  }
];

/**
 * Get random dashboards from the library
 * @param count Number of dashboards to return
 * @param excludeIds Dashboard IDs to exclude from selection
 * @returns Array of random dashboards
 */
export function getRandomDashboards(count: number, excludeIds: string[] = []): Dashboard[] {
  const available = DASHBOARD_LIBRARY.filter(d => !excludeIds.includes(d.id));
  return shuffleArray(available).slice(0, count);
}

/**
 * Get dashboards filtered by category
 * @param category Category to filter by, or null for all categories
 * @returns Array of dashboards in the specified category
 */
export function getDashboardsByCategory(category: DashboardCategory | null): Dashboard[] {
  if (!category) return DASHBOARD_LIBRARY;
  return DASHBOARD_LIBRARY.filter(d => d.category === category);
}

/**
 * Get dashboard by ID
 * @param id Dashboard ID
 * @returns Dashboard or undefined if not found
 */
export function getDashboardById(id: string): Dashboard | undefined {
  return DASHBOARD_LIBRARY.find(d => d.id === id);
}
