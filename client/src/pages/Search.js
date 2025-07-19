import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import MovieGrid from '../components/movies/MovieGrid';
import FilterModal from '../components/movies/FilterModal';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { movieAPI } from '../services/movieAPI';
import { useDebounce } from '../hooks/useDebounce';

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [filters, setFilters] = useState({
    genre: searchParams.get('genre') || '',
    year: searchParams.get('year') || '',
    rating: searchParams.get('rating') || '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const { data: searchResults, isLoading, error } = useQuery(
    ['search-movies', debouncedSearchTerm, filters, page],
    () => movieAPI.searchMovies(debouncedSearchTerm, { ...filters, page }),
    {
      enabled: debouncedSearchTerm.length > 0,
      keepPreviousData: true,
    }
  );

  const { data: genres } = useQuery('movie-genres', movieAPI.getGenres);

  useEffect(() => {
    const params = {};
    if (debouncedSearchTerm) params.q = debouncedSearchTerm;
    if (filters.genre) params.genre = filters.genre;
    if (filters.year) params.year = filters.year;
    if (filters.rating) params.rating = filters.rating;
    
    setSearchParams(params);
  }, [debouncedSearchTerm, filters, setSearchParams]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const loadMore = () => {
    if (searchResults && page < searchResults.total_pages) {
      setPage(prev => prev + 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 gradient-text">
          Discover Movies
        </h1>

        {/* Search Bar */}
        <div className="relative mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for movies..."
                value={searchTerm}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-4 bg-dark-800 border border-dark-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 text-lg"
              />
            </div>
            <button
              onClick={() => setShowFilters(true)}
              className="px-6 py-4 bg-dark-800 border border-dark-700 rounded-xl hover:bg-dark-700 transition-colors flex items-center gap-2"
            >
              <FunnelIcon className="h-5 w-5" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>
        </div>

        {/* Active Filters */}
        {(filters.genre || filters.year || filters.rating) && (
          <div className="mb-6 flex flex-wrap gap-2">
            {filters.genre && (
              <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm">
                Genre: {genres?.genres?.find(g => g.id.toString() === filters.genre)?.name}
              </span>
            )}
            {filters.year && (
              <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm">
                Year: {filters.year}
              </span>
            )}
            {filters.rating && (
              <span className="px-3 py-1 bg-primary-600 text-white rounded-full text-sm">
                Rating: {filters.rating}+
              </span>
            )}
          </div>
        )}

        {/* Search Results */}
        <div className="min-h-[400px]">
          {isLoading && page === 1 ? (
            <LoadingSkeleton />
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400 text-lg">Error loading search results</p>
            </div>
          ) : !debouncedSearchTerm ? (
            <div className="text-center py-12">
              <MagnifyingGlassIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">Start typing to search for movies...</p>
            </div>
          ) : searchResults?.results?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">No movies found for "{debouncedSearchTerm}"</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-gray-400">
                  Found {searchResults?.total_results || 0} results for "{debouncedSearchTerm}"
                </p>
              </div>
              <MovieGrid movies={searchResults?.results || []} />
              
              {/* Load More Button */}
              {searchResults && page < searchResults.total_pages && (
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={isLoading}
                    className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? 'Loading...' : 'Load More'}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        filters={filters}
        onFilterChange={handleFilterChange}
        genres={genres?.genres || []}
      />
    </motion.div>
  );
};

export default Search;
