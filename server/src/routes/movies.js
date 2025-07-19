const express = require('express');
const router = express.Router();
const { optionalAuth } = require('../middleware/auth');
const {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getUpcoming,
  searchMovies,
  getMovieDetails,
  getGenres,
  getMoviesByGenre
} = require('../controllers/movieController');

// Public routes (with optional authentication)
router.get('/trending', optionalAuth, getTrending);
router.get('/popular', optionalAuth, getPopular);
router.get('/top-rated', optionalAuth, getTopRated);
router.get('/now-playing', optionalAuth, getNowPlaying);
router.get('/upcoming', optionalAuth, getUpcoming);
router.get('/search', optionalAuth, searchMovies);
router.get('/genres', optionalAuth, getGenres);
router.get('/genre/:genreId', optionalAuth, getMoviesByGenre);
router.get('/:id', optionalAuth, getMovieDetails);

module.exports = router;
