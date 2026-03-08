import { Dashboard, DashboardCategory, DashboardPlatform } from '../types/Dashboard';

/**
 * Semi-automated scraper utility for collecting dashboard metadata
 * from Tableau Public, NovyPro, and Power BI.
 *
 * Usage: Run these functions in browser console while on the respective platforms
 * or use in a Node.js script with fetch/axios.
 */

/**
 * Scrape Tableau Public dashboard metadata
 * Navigate to a Tableau Public viz page and run this in the console
 */
export async function scrapeTableauPublic(url: string): Promise<Partial<Dashboard>> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract metadata from meta tags
    const getMetaContent = (property: string): string | null => {
      const meta = doc.querySelector(`meta[property="${property}"]`) ||
                    doc.querySelector(`meta[name="${property}"]`);
      return meta?.getAttribute('content') || null;
    };

    const title = getMetaContent('og:title') || doc.querySelector('title')?.textContent || '';
    const description = getMetaContent('og:description') || '';
    const thumbnailUrl = getMetaContent('og:image') || '';
    const author = getMetaContent('author') || 'Unknown';

    return {
      id: `tableau-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description.trim(),
      author: {
        name: author.trim(),
      },
      platform: DashboardPlatform.TableauPublic,
      thumbnailUrl,
      sourceUrl: url,
      category: DashboardCategory.Technology, // Default, update manually
    };
  } catch (error) {
    console.error('Error scraping Tableau Public:', error);
    return {};
  }
}

/**
 * Scrape NovyPro dashboard metadata
 * Navigate to a NovyPro project page and run this in the console
 */
export async function scrapeNovyPro(url: string): Promise<Partial<Dashboard>> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const getMetaContent = (property: string): string | null => {
      const meta = doc.querySelector(`meta[property="${property}"]`) ||
                    doc.querySelector(`meta[name="${property}"]`);
      return meta?.getAttribute('content') || null;
    };

    const title = getMetaContent('og:title') || doc.querySelector('h1')?.textContent || '';
    const description = getMetaContent('og:description') || '';
    const thumbnailUrl = getMetaContent('og:image') || '';

    // Try to extract author from page
    const authorElement = doc.querySelector('.author-name') || doc.querySelector('[data-author]');
    const author = authorElement?.textContent?.trim() || 'Unknown';

    return {
      id: `novypro-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description.trim(),
      author: {
        name: author,
      },
      platform: DashboardPlatform.NovyPro,
      thumbnailUrl,
      sourceUrl: url,
      category: DashboardCategory.Technology, // Default, update manually
    };
  } catch (error) {
    console.error('Error scraping NovyPro:', error);
    return {};
  }
}

/**
 * Scrape Power BI dashboard metadata
 * Navigate to a Power BI report and run this in the console
 */
export async function scrapePowerBI(url: string): Promise<Partial<Dashboard>> {
  try {
    const response = await fetch(url);
    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    const getMetaContent = (property: string): string | null => {
      const meta = doc.querySelector(`meta[property="${property}"]`) ||
                    doc.querySelector(`meta[name="${property}"]`);
      return meta?.getAttribute('content') || null;
    };

    const title = getMetaContent('og:title') || doc.querySelector('title')?.textContent || '';
    const description = getMetaContent('og:description') || getMetaContent('description') || '';
    const thumbnailUrl = getMetaContent('og:image') || '';

    return {
      id: `powerbi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: title.trim(),
      description: description.trim(),
      author: {
        name: 'Unknown', // Power BI often doesn't expose author publicly
      },
      platform: DashboardPlatform.PowerBI,
      thumbnailUrl,
      sourceUrl: url,
      category: DashboardCategory.Technology, // Default, update manually
    };
  } catch (error) {
    console.error('Error scraping Power BI:', error);
    return {};
  }
}

/**
 * Batch scrape multiple URLs
 * @param urls Array of dashboard URLs
 * @param platform Platform type
 * @param delayMs Delay between requests in milliseconds (for rate limiting)
 */
export async function batchScrape(
  urls: string[],
  platform: DashboardPlatform,
  delayMs: number = 1000
): Promise<Partial<Dashboard>[]> {
  const results: Partial<Dashboard>[] = [];

  for (const url of urls) {
    let scraper;
    switch (platform) {
      case DashboardPlatform.TableauPublic:
        scraper = scrapeTableauPublic;
        break;
      case DashboardPlatform.NovyPro:
        scraper = scrapeNovyPro;
        break;
      case DashboardPlatform.PowerBI:
        scraper = scrapePowerBI;
        break;
      default:
        continue;
    }

    const result = await scraper(url);
    if (result.title) {
      results.push(result);
    }

    // Rate limiting
    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Helper function to format scraped data for dashboardLibrary.ts
 */
export function formatForLibrary(dashboards: Partial<Dashboard>[]): string {
  return JSON.stringify(dashboards, null, 2);
}
