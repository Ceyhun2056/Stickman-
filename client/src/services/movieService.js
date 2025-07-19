import axios from 'axios';

// TMDB API configuration
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY || 'your_tmdb_api_key_here';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// Create axios instance for TMDB
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

// Create axios instance for our backend
const backendApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000/api',
});

// Add token to requests
backendApi.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const movieService = {
  // TMDB API calls
  getPopularMovies: (page = 1) => tmdbApi.get(`/movie/popular?page=${page}`),
  getTopRatedMovies: (page = 1) => tmdbApi.get(`/movie/top_rated?page=${page}`),
  getNowPlayingMovies: (page = 1) => tmdbApi.get(`/movie/now_playing?page=${page}`),
  getUpcomingMovies: (page = 1) => tmdbApi.get(`/movie/upcoming?page=${page}`),
  getTrendingMovies: (timeWindow = 'day', page = 1) => 
    tmdbApi.get(`/trending/movie/${timeWindow}?page=${page}`),
  
  searchMovies: (query, page = 1) => 
    tmdbApi.get(`/search/movie?query=${encodeURIComponent(query)}&page=${page}`),
  
  getMovieDetails: (movieId) => 
    tmdbApi.get(`/movie/${movieId}?append_to_response=videos,credits,similar,reviews`),
  
  getMovieGenres: () => tmdbApi.get('/genre/movie/list'),
  
  discoverMovies: (params) => tmdbApi.get('/discover/movie', { params }),

  // Backend API calls
  getUserFavorites: () => backendApi.get('/movies/favorites'),
  addToFavorites: (movieData) => backendApi.post('/movies/favorites', movieData),
  removeFromFavorites: (movieId) => backendApi.delete(`/movies/favorites/${movieId}`),
  
  getUserWatchlist: () => backendApi.get('/movies/watchlist'),
  addToWatchlist: (movieData) => backendApi.post('/movies/watchlist', movieData),
  removeFromWatchlist: (movieId) => backendApi.delete(`/movies/watchlist/${movieId}`),
  
  getMovieComments: (movieId) => backendApi.get(`/comments/${movieId}`),
  addComment: (movieId, comment) => backendApi.post('/comments', { movieId, comment }),
  deleteComment: (commentId) => backendApi.delete(`/comments/${commentId}`),
};

// Helper functions for image URLs
export const getImageUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-movie.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getBackdropUrl = (path, size = 'w1280') => {
  if (!path) return '/placeholder-backdrop.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export const getPosterUrl = (path, size = 'w500') => {
  if (!path) return '/placeholder-movie.jpg';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

export default movieService;
