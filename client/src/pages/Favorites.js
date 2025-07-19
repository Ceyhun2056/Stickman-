import React from 'react';
import { motion } from 'framer-motion';
import { HeartIcon } from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import MovieGrid from '../components/movies/MovieGrid';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { userAPI } from '../services/userAPI';

const Favorites = () => {
  const { data: userMovies, isLoading, error } = useQuery(
    'user-movies',
    userAPI.getUserMovies
  );

  const favorites = userMovies?.favorites || [];

  if (isLoading) return <LoadingSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">My Favorites</h1>
        <p className="text-gray-400">
          {favorites.length > 0 
            ? `You have ${favorites.length} favorite movie${favorites.length !== 1 ? 's' : ''}`
            : 'No favorite movies yet'
          }
        </p>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-400 text-lg">Error loading favorites</p>
        </div>
      ) : favorites.length === 0 ? (
        <div className="text-center py-20">
          <HeartIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">No Favorites Yet</h2>
          <p className="text-gray-400 mb-8">
            Start adding movies to your favorites to see them here
          </p>
        </div>
      ) : (
        <MovieGrid 
          movies={favorites.map(fav => ({
            id: fav.movieId,
            title: fav.title,
            poster_path: fav.poster_path,
            vote_average: fav.vote_average,
            release_date: fav.release_date,
            overview: fav.overview
          }))} 
        />
      )}
    </motion.div>
  );
};

export default Favorites;
