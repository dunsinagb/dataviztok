import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Dashboard } from "../types/Dashboard";
import { Heart } from "lucide-react";
import '../assets/heartAnimation.css';

interface LikedDashboardsContextType {
  likedDashboards: Dashboard[];
  toggleLike: (dashboard: Dashboard) => void;
  isLiked: (id: string) => boolean;
}

const LikedDashboardsContext = createContext<LikedDashboardsContextType | undefined>(undefined);

export function LikedDashboardsProvider({ children }: { children: ReactNode }) {
  const [likedDashboards, setLikedDashboards] = useState<Dashboard[]>(() => {
    const saved = localStorage.getItem("likedDashboards");
    return saved ? JSON.parse(saved) : [];
  });

  const [showHeart, setShowHeart] = useState(false);

  useEffect(() => {
    localStorage.setItem("likedDashboards", JSON.stringify(likedDashboards));
  }, [likedDashboards]);

  const toggleLike = (dashboard: Dashboard) => {
    setLikedDashboards(prev => {
      const alreadyLiked = prev.some(d => d.id === dashboard.id);
      if (alreadyLiked) {
        return prev.filter(d => d.id !== dashboard.id);
      } else {
        setShowHeart(true);
        setTimeout(() => setShowHeart(false), 800);
        return [...prev, dashboard];
      }
    });
  };

  const isLiked = (id: string) => {
    return likedDashboards.some(dashboard => dashboard.id === id);
  };

  return (
    <LikedDashboardsContext.Provider value={{ likedDashboards, toggleLike, isLiked }}>
      {children}
      {showHeart && (
        <div className="heart-animation">
          <Heart size={200} strokeWidth={0} className="fill-white"/>
        </div>
      )}
    </LikedDashboardsContext.Provider>
  );
}

export function useLikedDashboards() {
  const context = useContext(LikedDashboardsContext);
  if (!context) {
    throw new Error("useLikedDashboards must be used within a LikedDashboardsProvider");
  }
  return context;
}
