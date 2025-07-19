import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const userAPI = {
  // User preferences
  getUserMovies: () => api.get('/users/movies').then(res => res.data),
  
  // Favorites
  addToFavorites: (movieId) => api.post(`/users/favorites/${movieId}`).then(res => res.data),
  removeFromFavorites: (movieId) => api.delete(`/users/favorites/${movieId}`).then(res => res.data),
  
  // Watchlist
  addToWatchlist: (movieId) => api.post(`/users/watchlist/${movieId}`).then(res => res.data),
  removeFromWatchlist: (movieId) => api.delete(`/users/watchlist/${movieId}`).then(res => res.data),
  
  // User profile
  getProfile: () => api.get('/users/profile').then(res => res.data),
  updateProfile: (data) => api.put('/users/profile', data).then(res => res.data),
};
