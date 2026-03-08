import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useCategoryFilter } from '../hooks/useCategoryFilter';

export function CategoryFilter() {
  const [showDropdown, setShowDropdown] = useState(false);
  const { currentCategory, setCategory, categories } = useCategoryFilter();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    if (showDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDropdown]);

  const handleCategorySelect = (category: string | null) => {
    setCategory(category);
    setShowDropdown(false);
  };

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors px-3 py-2 rounded-md hover:bg-white/10"
        aria-label="Filter by category"
      >
        <span>{currentCategory || "All Categories"}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {showDropdown && (
        <div className="absolute right-0 top-full mt-1 bg-gray-900 rounded-md shadow-lg py-2 w-48 z-50 border border-white/10">
          <button
            onClick={() => handleCategorySelect(null)}
            className={`w-full px-4 py-2 text-left hover:bg-gray-800 text-sm transition-colors ${
              !currentCategory ? 'text-white bg-gray-800' : 'text-white/70'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => handleCategorySelect(category)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-800 text-sm transition-colors ${
                currentCategory === category ? 'text-white bg-gray-800' : 'text-white/70'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
