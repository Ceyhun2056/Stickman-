import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { StarIcon, CalendarIcon } from '@heroicons/react/24/outline';

const MovieGrid = ({ movies }) => {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400">No movies found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {movies.map((movie, index) => (
        <motion.div
          key={movie.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="group"
        >
          <Link to={`/movie/${movie.id}`}>
            <div className="movie-card-hover rounded-lg overflow-hidden bg-dark-800">
              <div className="aspect-[2/3] relative overflow-hidden">
                <img
                  src={
                    movie.poster_path
                      ? `https://image.tmdb.org/t/p/w500${movie.poster_path}`
                      : '/placeholder-movie.jpg'
                  }
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Rating Badge */}
                {movie.vote_average && (
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <StarIcon className="h-3 w-3 text-yellow-400" />
                    {movie.vote_average.toFixed(1)}
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="font-semibold text-white mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
                  {movie.title}
                </h3>
                
                {movie.release_date && (
                  <div className="flex items-center gap-1 text-gray-400 text-sm">
                    <CalendarIcon className="h-4 w-4" />
                    {new Date(movie.release_date).getFullYear()}
                  </div>
                )}
              </div>
            </div>
          </Link>
        </motion.div>
      ))}
    </div>
  );
};

export default MovieGrid;
