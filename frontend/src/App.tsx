import { useEffect, useRef, useCallback, useState } from "react";
import { DashboardCard } from "./components/DashboardCard";
import { Loader2, Search, X, Download } from "lucide-react";
import { Analytics } from "@vercel/analytics/react";
import { CategoryFilter } from "./components/CategoryFilter";
import { useLikedDashboards } from "./contexts/LikedDashboardsContext";
import { useDashboards } from "./hooks/useDashboards";
import { useCategoryFilter } from "./hooks/useCategoryFilter";

function App() {
  const [showAbout, setShowAbout] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const { currentCategory, setCategory } = useCategoryFilter();
  const { dashboards, loading, fetchDashboards } = useDashboards({ category: currentCategory });
  const { likedDashboards, toggleLike } = useLikedDashboards();
  const observerTarget = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");

  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && !loading) {
        fetchDashboards();
      }
    },
    [loading, fetchDashboards]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.1,
      rootMargin: "100px",
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => observer.disconnect();
  }, [handleObserver]);

  useEffect(() => {
    fetchDashboards();
  }, []);

  const filteredLikedDashboards = likedDashboards.filter(
    (dashboard) =>
      dashboard.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dashboard.author.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    const simplifiedDashboards = likedDashboards.map((dashboard) => ({
      title: dashboard.title,
      description: dashboard.description,
      author: dashboard.author.name,
      sourceUrl: dashboard.sourceUrl,
      thumbnailUrl: dashboard.thumbnailUrl,
      platform: dashboard.platform,
      category: dashboard.category,
    }));

    const dataStr = JSON.stringify(simplifiedDashboards, null, 2);
    const dataUri =
      "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

    const exportFileDefaultName = `dataviztok-favorites-${new Date().toISOString().split("T")[0]
      }.json`;

    const linkElement = document.createElement("a");
    linkElement.setAttribute("href", dataUri);
    linkElement.setAttribute("download", exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="h-screen w-full bg-black text-white overflow-y-scroll snap-y snap-mandatory hide-scroll">
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => window.location.reload()}
          className="text-2xl font-bold text-white drop-shadow-lg hover:opacity-80 transition-opacity"
        >
          DataVizTok
        </button>
      </div>

      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        <button
          onClick={() => setShowAbout(!showAbout)}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          About
        </button>
        <button
          onClick={() => setShowLikes(!showLikes)}
          className="text-sm text-white/70 hover:text-white transition-colors"
        >
          Likes
        </button>
        <CategoryFilter currentCategory={currentCategory} onCategoryChange={setCategory} />
      </div>

      {showAbout && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 z-[41] p-6 rounded-lg max-w-md relative">
            <button
              onClick={() => setShowAbout(false)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-xl font-bold mb-4">About DataVizTok</h2>
            <p className="mb-4">
              A TikTok-style interface for exploring random Data Visualizations.
            </p>
            <p className="text-white/70 mb-2">
              Made with ❤️ by{" "}
              <a
                href="https://github.com/dunsinagb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                @Dunsinagb
              </a>
            </p>
            <p className="text-white/70 mb-2">
              Check out the code on{" "}
              <a
                href="https://github.com/dunsinagb/dataviztok"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                GitHub
              </a>
            </p>
            <p className="text-white/70 mb-2">
              Inspired by WikiTok, originally created by{" "}
              <a
                href="https://x.com/Aizkmusic"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                @Aizkmusic
              </a>
            </p>
            <p className="text-white/70">
              If you enjoy this project, you can{" "}
              <a
                href="https://buymeacoffee.com/dunsinagb"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white hover:underline"
              >
                buy me a coffee! ☕
              </a>
            </p>
          </div>
          <div
            className={`w-full h-full z-[40] top-1 left-1  bg-[rgb(28 25 23 / 43%)] fixed  ${showAbout ? "block" : "hidden"
              }`}
            onClick={() => setShowAbout(false)}
          ></div>
        </div>
      )}

      {showLikes && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 z-[41] p-6 rounded-lg w-full max-w-2xl h-[80vh] flex flex-col relative">
            <button
              onClick={() => setShowLikes(false)}
              className="absolute top-2 right-2 text-white/70 hover:text-white"
            >
              ✕
            </button>

            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Liked Dashboards</h2>
              {likedDashboards.length > 0 && (
                <button
                  onClick={handleExport}
                  className="flex items-center gap-2 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  title="Export liked dashboards"
                >
                  <Download className="w-4 h-4" />
                  Export
                </button>
              )}
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search liked dashboards..."
                className="w-full bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <Search className="w-5 h-5 text-white/50 absolute left-3 top-1/2 transform -translate-y-1/2" />
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
              {filteredLikedDashboards.length === 0 ? (
                <p className="text-white/70">
                  {searchQuery ? "No matches found." : "No liked dashboards yet."}
                </p>
              ) : (
                <div className="space-y-4">
                  {filteredLikedDashboards.map((dashboard) => (
                    <div
                      key={`${dashboard.id}-${Date.now()}`}
                      className="flex gap-4 items-start group"
                    >
                      <img
                        src={dashboard.thumbnailUrl}
                        alt={dashboard.title}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <a
                            href={dashboard.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold hover:text-gray-200"
                          >
                            {dashboard.title}
                          </a>
                          <button
                            onClick={() => toggleLike(dashboard)}
                            className="text-white/50 hover:text-white/90 p-1 rounded-full md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                            aria-label="Remove from likes"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="text-xs text-white/50 mb-1">
                          by {dashboard.author.name} • {dashboard.platform}
                        </p>
                        <p className="text-sm text-white/70 line-clamp-2">
                          {dashboard.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div
            className={`w-full h-full z-[40] top-1 left-1  bg-[rgb(28 25 23 / 43%)] fixed  ${showLikes ? "block" : "hidden"
              }`}
            onClick={() => setShowLikes(false)}
          ></div>
        </div>
      )}

      {dashboards.map((dashboard) => (
        <DashboardCard key={dashboard.id} dashboard={dashboard} />
      ))}
      <div ref={observerTarget} className="h-10 -mt-1" />
      {loading && (
        <div className="h-screen w-full flex items-center justify-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      )}
      <Analytics />
    </div>
  );
}

export default App;
