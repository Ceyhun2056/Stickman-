import React from 'react';
import { motion } from 'framer-motion';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { useQuery } from 'react-query';
import MovieGrid from '../components/movies/MovieGrid';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import { userAPI } from '../services/userAPI';

const Watchlist = () => {
  const { data: userMovies, isLoading, error } = useQuery(
    'user-movies',
    userAPI.getUserMovies
  );

  const watchlist = userMovies?.watchlist || [];

  if (isLoading) return <LoadingSkeleton />;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold gradient-text mb-4">My Watchlist</h1>
        <p className="text-gray-400">
          {watchlist.length > 0 
            ? `You have ${watchlist.length} movie${watchlist.length !== 1 ? 's' : ''} in your watchlist`
            : 'No movies in watchlist yet'
          }
        </p>
      </div>

      {error ? (
        <div className="text-center py-12">
          <p className="text-red-400 text-lg">Error loading watchlist</p>
        </div>
      ) : watchlist.length === 0 ? (
        <div className="text-center py-20">
          <BookmarkIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-gray-300 mb-2">No Movies in Watchlist</h2>
          <p className="text-gray-400 mb-8">
            Add movies to your watchlist to keep track of what you want to watch
          </p>
        </div>
      ) : (
        <MovieGrid 
          movies={watchlist.map(item => ({
            id: item.movieId,
            title: item.title,
            poster_path: item.poster_path,
            vote_average: item.vote_average,
            release_date: item.release_date,
            overview: item.overview
          }))} 
        />
      )}
    </motion.div>
  );
};

export default Watchlist;
