import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  HeartIcon, 
  BookmarkIcon, 
  StarIcon, 
  CalendarIcon,
  ClockIcon,
  PlayIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import toast from 'react-hot-toast';
import { movieAPI } from '../services/movieAPI';
import { userAPI } from '../services/userAPI';
import { useAuth } from '../contexts/AuthContext';
import LoadingSkeleton from '../components/ui/LoadingSkeleton';
import CommentSection from '../components/comments/CommentSection';
import CastSection from '../components/movies/CastSection';
import TrailerModal from '../components/movies/TrailerModal';

const MovieDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showTrailer, setShowTrailer] = useState(false);

  const { data: movie, isLoading, error } = useQuery(
    ['movie', id],
    () => movieAPI.getMovieDetails(id),
    { enabled: !!id }
  );

  const { data: videos } = useQuery(
    ['movie-videos', id],
    () => movieAPI.getMovieVideos(id),
    { enabled: !!id }
  );

  const { data: credits } = useQuery(
    ['movie-credits', id],
    () => movieAPI.getMovieCredits(id),
    { enabled: !!id }
  );

  const { data: userMovies } = useQuery(
    'user-movies',
    userAPI.getUserMovies,
    { enabled: !!user }
  );

  const addToFavoritesMutation = useMutation(
    (movieId) => userAPI.addToFavorites(movieId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-movies');
        toast.success('Added to favorites!');
      },
      onError: () => toast.error('Failed to add to favorites'),
    }
  );

  const removeFromFavoritesMutation = useMutation(
    (movieId) => userAPI.removeFromFavorites(movieId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-movies');
        toast.success('Removed from favorites');
      },
      onError: () => toast.error('Failed to remove from favorites'),
    }
  );

  const addToWatchlistMutation = useMutation(
    (movieId) => userAPI.addToWatchlist(movieId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-movies');
        toast.success('Added to watchlist!');
      },
      onError: () => toast.error('Failed to add to watchlist'),
    }
  );

  const removeFromWatchlistMutation = useMutation(
    (movieId) => userAPI.removeFromWatchlist(movieId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('user-movies');
        toast.success('Removed from watchlist');
      },
      onError: () => toast.error('Failed to remove from watchlist'),
    }
  );

  const isFavorite = userMovies?.favorites?.some(fav => fav.movieId === parseInt(id));
  const isInWatchlist = userMovies?.watchlist?.some(item => item.movieId === parseInt(id));

  const trailer = videos?.results?.find(video => 
    video.type === 'Trailer' && video.site === 'YouTube'
  );

  const handleFavoriteToggle = () => {
    if (!user) {
      toast.error('Please login to add to favorites');
      return;
    }

    if (isFavorite) {
      removeFromFavoritesMutation.mutate(id);
    } else {
      addToFavoritesMutation.mutate(id);
    }
  };

  const handleWatchlistToggle = () => {
    if (!user) {
      toast.error('Please login to add to watchlist');
      return;
    }

    if (isInWatchlist) {
      removeFromWatchlistMutation.mutate(id);
    } else {
      addToWatchlistMutation.mutate(id);
    }
  };

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <div className="text-center py-12 text-red-400">Error loading movie details</div>;
  if (!movie) return <div className="text-center py-12">Movie not found</div>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen"
    >
      {/* Hero Section */}
      <div className="relative min-h-screen">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/80 to-dark-900/40"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex items-end">
          <div className="pb-16">
            {/* Back Button */}
            <button
              onClick={() => navigate(-1)}
              className="mb-6 flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeftIcon className="h-5 w-5" />
              Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-end">
              {/* Poster */}
              <div className="lg:col-span-1">
                <motion.img
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                  alt={movie.title}
                  className="w-full max-w-sm mx-auto lg:mx-0 rounded-xl shadow-2xl"
                />
              </div>

              {/* Movie Info */}
              <div className="lg:col-span-2 space-y-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <h1 className="text-4xl md:text-6xl font-bold mb-4">{movie.title}</h1>
                  
                  {/* Meta Info */}
                  <div className="flex flex-wrap items-center gap-6 text-gray-300 mb-6">
                    <div className="flex items-center gap-2">
                      <StarIcon className="h-5 w-5 text-yellow-400" />
                      <span>{movie.vote_average?.toFixed(1)}/10</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-5 w-5" />
                      <span>{new Date(movie.release_date).getFullYear()}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-5 w-5" />
                      <span>{movie.runtime} min</span>
                    </div>
                  </div>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {movie.genres?.map((genre) => (
                      <span
                        key={genre.id}
                        className="px-3 py-1 bg-dark-800/80 rounded-full text-sm"
                      >
                        {genre.name}
                      </span>
                    ))}
                  </div>

                  {/* Overview */}
                  <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-3xl">
                    {movie.overview}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-4">
                    {trailer && (
                      <button
                        onClick={() => setShowTrailer(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <PlayIcon className="h-5 w-5" />
                        Watch Trailer
                      </button>
                    )}

                    {user && (
                      <>
                        <button
                          onClick={handleFavoriteToggle}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                            isFavorite
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-dark-800 text-gray-300 hover:bg-dark-700 hover:text-white'
                          }`}
                        >
                          {isFavorite ? (
                            <HeartSolidIcon className="h-5 w-5" />
                          ) : (
                            <HeartIcon className="h-5 w-5" />
                          )}
                          {isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
                        </button>

                        <button
                          onClick={handleWatchlistToggle}
                          className={`flex items-center gap-2 px-6 py-3 rounded-lg transition-colors ${
                            isInWatchlist
                              ? 'bg-blue-600 text-white hover:bg-blue-700'
                              : 'bg-dark-800 text-gray-300 hover:bg-dark-700 hover:text-white'
                          }`}
                        >
                          {isInWatchlist ? (
                            <BookmarkSolidIcon className="h-5 w-5" />
                          ) : (
                            <BookmarkIcon className="h-5 w-5" />
                          )}
                          {isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
                        </button>
                      </>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cast Section */}
      {credits?.cast && credits.cast.length > 0 && (
        <div className="container mx-auto px-4 py-12">
          <CastSection cast={credits.cast} />
        </div>
      )}

      {/* Comments Section */}
      <div className="container mx-auto px-4 py-12">
        <CommentSection movieId={id} />
      </div>

      {/* Trailer Modal */}
      {trailer && (
        <TrailerModal
          isOpen={showTrailer}
          onClose={() => setShowTrailer(false)}
          videoKey={trailer.key}
          title={movie.title}
        />
      )}
    </motion.div>
  );
};

export default MovieDetails;
