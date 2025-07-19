import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useQuery } from 'react-query';
import Hero from '../components/home/Hero';
import MovieSection from '../components/movies/MovieSection';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { movieAPI } from '../services/movieAPI';

const Home = () => {
  const [selectedCategory, setSelectedCategory] = useState('trending');

  const { data: trending, isLoading: trendingLoading } = useQuery(
    'trending-movies',
    () => movieAPI.getTrending(),
    { staleTime: 1000 * 60 * 5 }
  );

  const { data: popular, isLoading: popularLoading } = useQuery(
    'popular-movies',
    () => movieAPI.getPopular(),
    { staleTime: 1000 * 60 * 5 }
  );

  const { data: topRated, isLoading: topRatedLoading } = useQuery(
    'top-rated-movies',
    () => movieAPI.getTopRated(),
    { staleTime: 1000 * 60 * 5 }
  );

  const { data: nowPlaying, isLoading: nowPlayingLoading } = useQuery(
    'now-playing-movies',
    () => movieAPI.getNowPlaying(),
    { staleTime: 1000 * 60 * 5 }
  );

  const { data: upcoming, isLoading: upcomingLoading } = useQuery(
    'upcoming-movies',
    () => movieAPI.getUpcoming(),
    { staleTime: 1000 * 60 * 5 }
  );

  const categories = [
    { id: 'trending', label: 'Trending', data: trending, loading: trendingLoading },
    { id: 'popular', label: 'Popular', data: popular, loading: popularLoading },
    { id: 'top_rated', label: 'Top Rated', data: topRated, loading: topRatedLoading },
    { id: 'now_playing', label: 'Now Playing', data: nowPlaying, loading: nowPlayingLoading },
    { id: 'upcoming', label: 'Upcoming', data: upcoming, loading: upcomingLoading },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <Hero movies={trending?.results?.slice(0, 5) || []} />

      {/* Navigation Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-8 justify-center md:justify-start">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === category.id
                  ? 'bg-primary-600 text-white shadow-lg'
                  : 'bg-dark-800 text-gray-300 hover:bg-dark-700 hover:text-white'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>

        {/* Movie Sections */}
        <div className="space-y-12">
          {categories.map((category) => (
            <div
              key={category.id}
              className={selectedCategory === category.id ? 'block' : 'hidden'}
            >
              {category.loading ? (
                <LoadingSkeleton />
              ) : (
                <MovieSection
                  title={category.label}
                  movies={category.data?.results || []}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Home;
