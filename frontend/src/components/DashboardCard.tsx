import { useState } from 'react';
import { Heart, Share2, ExternalLink, BarChart3 } from 'lucide-react';
import { Dashboard, DashboardPlatform } from '../types/Dashboard';
import { useLikedDashboards } from '../contexts/LikedDashboardsContext';

interface DashboardCardProps {
  dashboard: Dashboard;
}

function PowerBIPlaceholder({ dashboard }: { dashboard: Dashboard }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-yellow-900/80 via-gray-900 to-gray-950 p-8">
      <BarChart3 className="w-16 h-16 text-yellow-400 mb-4" />
      <p className="text-yellow-400 text-xs font-semibold uppercase tracking-widest mb-3">
        Power BI
      </p>
      <h3 className="text-white text-2xl font-bold text-center leading-tight mb-4 max-w-lg">
        {dashboard.title}
      </h3>
      <p className="text-white/60 text-sm text-center max-w-md line-clamp-3">
        {dashboard.description}
      </p>
    </div>
  );
}

export function DashboardCard({ dashboard }: DashboardCardProps) {
  const { toggleLike, isLiked } = useLikedDashboards();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const hasThumbnail = Boolean(dashboard.thumbnailUrl);

  const handleShare = async () => {
    const shareData = {
      title: dashboard.title,
      text: `${dashboard.title} by ${dashboard.author.name} - View on DataVizTok`,
      url: dashboard.sourceUrl,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(dashboard.sourceUrl);
        alert('Link copied to clipboard!');
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleViewMore = () => {
    window.open(dashboard.sourceUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDoubleClick = () => {
    toggleLike(dashboard);
  };

  const platformColor =
    dashboard.platform === DashboardPlatform.PowerBI
      ? "bg-yellow-500/20 text-yellow-300"
      : dashboard.platform === DashboardPlatform.TableauPublic
        ? "bg-blue-500/20 text-blue-300"
        : "bg-white/10 text-white/60";

  return (
    <div
      className="h-dvh w-full snap-start relative bg-gray-900"
      onDoubleClick={handleDoubleClick}
    >
      {/* Thumbnail background or placeholder */}
      {!hasThumbnail ? (
        <PowerBIPlaceholder dashboard={dashboard} />
      ) : (
        <>
          {!imageError && (
            <img
              src={dashboard.thumbnailUrl}
              alt={dashboard.title}
              className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => {
                setImageError(true);
                setImageLoaded(true);
              }}
            />
          )}

          {/* Loading skeleton */}
          {!imageLoaded && (
            <div className="absolute inset-0 bg-gray-800 animate-pulse" />
          )}
        </>
      )}

      {/* Gradient overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/60" />

      {/* Bottom metadata overlay */}
      <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 backdrop-blur-md bg-black/40 rounded-lg p-3 sm:p-4 border border-white/10 z-10">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h2 className="text-lg sm:text-xl font-bold text-white mb-1 drop-shadow-lg line-clamp-2">
              {dashboard.title}
            </h2>

            {/* Author */}
            <p className="text-sm text-white/70 mb-2">
              by{' '}
              {dashboard.author.profileUrl ? (
                <a
                  href={dashboard.author.profileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-white hover:underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  {dashboard.author.name}
                </a>
              ) : (
                <span className="text-white">{dashboard.author.name}</span>
              )}
            </p>

            {/* Description */}
            <p className="text-sm text-gray-200 mb-3 drop-shadow-md line-clamp-2">
              {dashboard.description}
            </p>

            {/* View More button */}
            <button
              onClick={handleViewMore}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-lg text-white text-sm font-medium transition-colors border border-white/20"
            >
              View Dashboard
              <ExternalLink className="w-4 h-4" />
            </button>

            {/* Platform badge */}
            <div className="mt-2">
              <span className={`inline-block px-2 py-1 text-xs rounded ${platformColor}`}>
                {dashboard.platform}
              </span>
            </div>
          </div>

          {/* Like and Share icons */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => toggleLike(dashboard)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
              aria-label={isLiked(dashboard.id) ? 'Unlike' : 'Like'}
            >
              <Heart
                className={`w-6 h-6 ${
                  isLiked(dashboard.id)
                    ? 'fill-red-500 text-red-500'
                    : 'text-white'
                }`}
              />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
              aria-label="Share"
            >
              <Share2 className="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
