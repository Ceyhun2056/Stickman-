import React from 'react';
import { Link } from 'react-router-dom';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { StarIcon, CalendarIcon } from '@heroicons/react/24/solid';
import { HeartIcon, BookmarkIcon } from '@heroicons/react/24/outline';
import { getPosterUrl } from '../services/movieService';
import { motion } from 'framer-motion';

const MovieCard = ({ 
  movie, 
  onToggleFavorite, 
  onToggleWatchlist, 
  isFavorite = false, 
  isInWatchlist = false,
  showActions = true 
}) => {
  const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
  const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="group relative bg-dark-800 rounded-xl overflow-hidden movie-card-hover border border-dark-700"
    >
      <Link to={`/movie/${movie.id}`} className="block">
        <div className="aspect-[2/3] relative overflow-hidden">
          <LazyLoadImage
            src={getPosterUrl(movie.poster_path)}
            alt={movie.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            effect="blur"
            placeholderSrc="/placeholder-movie.jpg"
          />
          
          {/* Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Rating */}
          <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center space-x-1">
            <StarIcon className="h-3 w-3 text-yellow-500" />
            <span className="text-xs font-medium text-white">{rating}</span>
          </div>
          
          {/* Action Buttons */}
          {showActions && (
            <div className="absolute top-2 right-2 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleFavorite?.(movie);
                }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isFavorite 
                    ? 'bg-red-500/80 text-white' 
                    : 'bg-black/70 text-white hover:bg-red-500/80'
                }`}
              >
                <HeartIcon className="h-4 w-4" />
              </button>
              
              <button
                onClick={(e) => {
                  e.preventDefault();
                  onToggleWatchlist?.(movie);
                }}
                className={`p-2 rounded-full backdrop-blur-sm transition-colors ${
                  isInWatchlist 
                    ? 'bg-blue-500/80 text-white' 
                    : 'bg-black/70 text-white hover:bg-blue-500/80'
                }`}
              >
                <BookmarkIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </Link>
      
      {/* Movie Info */}
      <div className="p-4">
        <Link to={`/movie/${movie.id}`}>
          <h3 className="font-semibold text-white text-sm mb-2 line-clamp-2 group-hover:text-primary-400 transition-colors">
            {movie.title}
          </h3>
        </Link>
        
        <div className="flex items-center justify-between text-xs text-dark-400">
          <div className="flex items-center space-x-1">
            <CalendarIcon className="h-3 w-3" />
            <span>{releaseYear}</span>
          </div>
          
          {movie.genre_ids && (
            <div className="flex flex-wrap gap-1">
              {movie.genre_ids.slice(0, 2).map((genreId) => (
                <span
                  key={genreId}
                  className="px-2 py-1 bg-dark-700 rounded-full text-xs"
                >
                  {getGenreName(genreId)}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Helper function to get genre name by ID
const getGenreName = (genreId) => {
  const genres = {
    28: 'Action',
    12: 'Adventure',
    16: 'Animation',
    35: 'Comedy',
    80: 'Crime',
    99: 'Documentary',
    18: 'Drama',
    10751: 'Family',
    14: 'Fantasy',
    36: 'History',
    27: 'Horror',
    10402: 'Music',
    9648: 'Mystery',
    10749: 'Romance',
    878: 'Sci-Fi',
    10770: 'TV Movie',
    53: 'Thriller',
    10752: 'War',
    37: 'Western',
  };
  return genres[genreId] || 'Unknown';
};

export default MovieCard;
