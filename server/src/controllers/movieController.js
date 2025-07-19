const axios = require('axios');

const TMDB_API_KEY = process.env.TMDB_API_KEY;
const TMDB_BASE_URL = process.env.TMDB_BASE_URL;

// Create axios instance for TMDb API
const tmdbAPI = axios.create({
  baseURL: TMDB_BASE_URL,
  params: {
    api_key: TMDB_API_KEY
  }
});

// @desc    Get trending movies
// @route   GET /api/movies/trending
// @access  Public
const getTrending = async (req, res) => {
  try {
    const { page = 1, time_window = 'day' } = req.query;
    
    const response = await tmdbAPI.get(`/trending/movie/${time_window}`, {
      params: { page }
    });

    res.status(200).json({
      success: true,
      data: {
        movies: response.data.results,
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results
      }
    });
  } catch (error) {
    console.error('Get trending movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching trending movies'
    });
  }
};

// @desc    Get popular movies
// @route   GET /api/movies/popular
// @access  Public
const getPopular = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    
    const response = await tmdbAPI.get('/movie/popular', {
      params: { page }
    });

    res.status(200).json({
      success: true,
      data: {
        movies: response.data.results,
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results
      }
    });
  } catch (error) {
    console.error('Get popular movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching popular movies'
    });
  }
};

// @desc    Get top rated movies
// @route   GET /api/movies/top-rated
// @access  Public
const getTopRated = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    
    const response = await tmdbAPI.get('/movie/top_rated', {
      params: { page }
    });

    res.status(200).json({
      success: true,
      data: {
        movies: response.data.results,
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results
      }
    });
  } catch (error) {
    console.error('Get top rated movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching top rated movies'
    });
  }
};

// @desc    Get now playing movies
// @route   GET /api/movies/now-playing
// @access  Public
const getNowPlaying = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    
    const response = await tmdbAPI.get('/movie/now_playing', {
      params: { page }
    });

    res.status(200).json({
      success: true,
      data: {
        movies: response.data.results,
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results
      }
    });
  } catch (error) {
    console.error('Get now playing movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching now playing movies'
    });
  }
};

// @desc    Get upcoming movies
// @route   GET /api/movies/upcoming
// @access  Public
const getUpcoming = async (req, res) => {
  try {
    const { page = 1 } = req.query;
    
    const response = await tmdbAPI.get('/movie/upcoming', {
      params: { page }
    });

    res.status(200).json({
      success: true,
      data: {
        movies: response.data.results,
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results
      }
    });
  } catch (error) {
    console.error('Get upcoming movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching upcoming movies'
    });
  }
};

// @desc    Search movies
// @route   GET /api/movies/search
// @access  Public
const searchMovies = async (req, res) => {
  try {
    const { query, page = 1, year, genre } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const params = { query, page };
    if (year) params.year = year;

    const response = await tmdbAPI.get('/search/movie', { params });

    let movies = response.data.results;

    // Filter by genre if specified
    if (genre) {
      movies = movies.filter(movie => 
        movie.genre_ids && movie.genre_ids.includes(parseInt(genre))
      );
    }

    res.status(200).json({
      success: true,
      data: {
        movies,
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: genre ? movies.length : response.data.total_results,
        searchQuery: query
      }
    });
  } catch (error) {
    console.error('Search movies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error searching movies'
    });
  }
};

// @desc    Get movie details
// @route   GET /api/movies/:id
// @access  Public
const getMovieDetails = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Get basic movie details
    const movieResponse = await tmdbAPI.get(`/movie/${id}`, {
      params: {
        append_to_response: 'videos,credits,reviews,similar'
      }
    });

    const movie = movieResponse.data;

    // Get additional data in parallel
    const [imagesResponse, watchProvidersResponse] = await Promise.allSettled([
      tmdbAPI.get(`/movie/${id}/images`),
      tmdbAPI.get(`/movie/${id}/watch/providers`)
    ]);

    // Add additional data if available
    if (imagesResponse.status === 'fulfilled') {
      movie.images = imagesResponse.value.data;
    }

    if (watchProvidersResponse.status === 'fulfilled') {
      movie.watchProviders = watchProvidersResponse.value.data.results;
    }

    res.status(200).json({
      success: true,
      data: { movie }
    });
  } catch (error) {
    console.error('Get movie details error:', error);
    
    if (error.response && error.response.status === 404) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error fetching movie details'
    });
  }
};

// @desc    Get movie genres
// @route   GET /api/movies/genres
// @access  Public
const getGenres = async (req, res) => {
  try {
    const response = await tmdbAPI.get('/genre/movie/list');

    res.status(200).json({
      success: true,
      data: {
        genres: response.data.genres
      }
    });
  } catch (error) {
    console.error('Get genres error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movie genres'
    });
  }
};

// @desc    Get movies by genre
// @route   GET /api/movies/genre/:genreId
// @access  Public
const getMoviesByGenre = async (req, res) => {
  try {
    const { genreId } = req.params;
    const { page = 1, sort_by = 'popularity.desc' } = req.query;
    
    const response = await tmdbAPI.get('/discover/movie', {
      params: {
        with_genres: genreId,
        page,
        sort_by
      }
    });

    res.status(200).json({
      success: true,
      data: {
        movies: response.data.results,
        page: response.data.page,
        totalPages: response.data.total_pages,
        totalResults: response.data.total_results
      }
    });
  } catch (error) {
    console.error('Get movies by genre error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movies by genre'
    });
  }
};

module.exports = {
  getTrending,
  getPopular,
  getTopRated,
  getNowPlaying,
  getUpcoming,
  searchMovies,
  getMovieDetails,
  getGenres,
  getMoviesByGenre
};
