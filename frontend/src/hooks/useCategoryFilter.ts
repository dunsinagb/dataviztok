import { useState, useEffect } from "react";
import { DashboardCategory } from "../types/Dashboard";

export function useCategoryFilter() {
  const [currentCategory, setCurrentCategory] = useState<string | null>(() => {
    const saved = localStorage.getItem("dashboardCategory");
    return saved || null;
  });

  useEffect(() => {
    if (currentCategory) {
      localStorage.setItem("dashboardCategory", currentCategory);
    } else {
      localStorage.removeItem("dashboardCategory");
    }
  }, [currentCategory]);

  const setCategory = (category: string | null) => {
    setCurrentCategory(category);
  };

  const categories = Object.values(DashboardCategory);

  return {
    currentCategory,
    setCategory,
    categories
  };
}
