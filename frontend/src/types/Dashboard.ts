export interface Dashboard {
  id: string;
  title: string;
  description: string; // Brief description (2-3 sentences)
  author: {
    name: string;
    profileUrl?: string;
  };
  category: DashboardCategory;
  thumbnailUrl: string; // Screenshot/preview image
  sourceUrl: string; // Original dashboard URL
  platform: DashboardPlatform;
  publishedDate?: string;
  tags?: string[];
  viewCount?: number;
  favoriteCount?: number;
}

export enum DashboardCategory {
  Finance = "Finance",
  Sports = "Sports",
  Health = "Health",
  Marketing = "Marketing",
  Sales = "Sales",
  Operations = "Operations",
  Education = "Education",
  Technology = "Technology",
  Environment = "Environment",
  Social = "Social"
}

export enum DashboardPlatform {
  TableauPublic = "Tableau Public",
  NovyPro = "NovyPro",
  PowerBI = "Power BI"
}
