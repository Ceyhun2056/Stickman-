import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const TMDB_API_KEY = process.env.REACT_APP_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

// Create axios instance for our backend API
const api = axios.create({
  baseURL: API_BASE_URL,
});

// Create axios instance for TMDb API
const tmdbApi = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY,
  },
});

export const movieAPI = {
  // TMDb API calls
  getTrending: () => tmdbApi.get('/trending/movie/day').then(res => res.data),
  getPopular: () => tmdbApi.get('/movie/popular').then(res => res.data),
  getTopRated: () => tmdbApi.get('/movie/top_rated').then(res => res.data),
  getNowPlaying: () => tmdbApi.get('/movie/now_playing').then(res => res.data),
  getUpcoming: () => tmdbApi.get('/movie/upcoming').then(res => res.data),
  
  getMovieDetails: (movieId) => tmdbApi.get(`/movie/${movieId}`).then(res => res.data),
  getMovieVideos: (movieId) => tmdbApi.get(`/movie/${movieId}/videos`).then(res => res.data),
  getMovieCredits: (movieId) => tmdbApi.get(`/movie/${movieId}/credits`).then(res => res.data),
  
  searchMovies: (query, filters = {}) => {
    const params = { query };
    if (filters.genre) params.with_genres = filters.genre;
    if (filters.year) params.year = filters.year;
    if (filters.rating) params['vote_average.gte'] = filters.rating;
    if (filters.page) params.page = filters.page;
    
    return tmdbApi.get('/search/movie', { params }).then(res => res.data);
  },
  
  getGenres: () => tmdbApi.get('/genre/movie/list').then(res => res.data),
  
  // Backend API calls for movie-related features
  getMovies: (params) => api.get('/movies', { params }).then(res => res.data),
  getMovie: (id) => api.get(`/movies/${id}`).then(res => res.data),
};
