const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');

// @desc    Get user favorites
// @route   GET /api/users/favorites
// @access  Private
router.get('/favorites', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        favorites: user.favorites
      }
    });
  } catch (error) {
    console.error('Get favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching favorites'
    });
  }
});

// @desc    Add movie to favorites
// @route   POST /api/users/favorites/:movieId
// @access  Private
router.post('/favorites/:movieId', protect, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);
    
    await user.addToFavorites(parseInt(movieId));
    
    res.status(200).json({
      success: true,
      message: 'Movie added to favorites',
      data: {
        favorites: user.favorites
      }
    });
  } catch (error) {
    console.error('Add to favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding movie to favorites'
    });
  }
});

// @desc    Remove movie from favorites
// @route   DELETE /api/users/favorites/:movieId
// @access  Private
router.delete('/favorites/:movieId', protect, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);
    
    await user.removeFromFavorites(parseInt(movieId));
    
    res.status(200).json({
      success: true,
      message: 'Movie removed from favorites',
      data: {
        favorites: user.favorites
      }
    });
  } catch (error) {
    console.error('Remove from favorites error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing movie from favorites'
    });
  }
});

// @desc    Get user watchlist
// @route   GET /api/users/watchlist
// @access  Private
router.get('/watchlist', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    res.status(200).json({
      success: true,
      data: {
        watchlist: user.watchlist
      }
    });
  } catch (error) {
    console.error('Get watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching watchlist'
    });
  }
});

// @desc    Add movie to watchlist
// @route   POST /api/users/watchlist/:movieId
// @access  Private
router.post('/watchlist/:movieId', protect, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);
    
    await user.addToWatchlist(parseInt(movieId));
    
    res.status(200).json({
      success: true,
      message: 'Movie added to watchlist',
      data: {
        watchlist: user.watchlist
      }
    });
  } catch (error) {
    console.error('Add to watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding movie to watchlist'
    });
  }
});

// @desc    Remove movie from watchlist
// @route   DELETE /api/users/watchlist/:movieId
// @access  Private
router.delete('/watchlist/:movieId', protect, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);
    
    await user.removeFromWatchlist(parseInt(movieId));
    
    res.status(200).json({
      success: true,
      message: 'Movie removed from watchlist',
      data: {
        watchlist: user.watchlist
      }
    });
  } catch (error) {
    console.error('Remove from watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing movie from watchlist'
    });
  }
});

// @desc    Check if movie is in favorites
// @route   GET /api/users/favorites/:movieId/check
// @access  Private
router.get('/favorites/:movieId/check', protect, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);
    
    const isFavorite = user.favorites.includes(parseInt(movieId));
    
    res.status(200).json({
      success: true,
      data: {
        isFavorite
      }
    });
  } catch (error) {
    console.error('Check favorite error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking favorite status'
    });
  }
});

// @desc    Check if movie is in watchlist
// @route   GET /api/users/watchlist/:movieId/check
// @access  Private
router.get('/watchlist/:movieId/check', protect, async (req, res) => {
  try {
    const { movieId } = req.params;
    const user = await User.findById(req.user.id);
    
    const isInWatchlist = user.watchlist.includes(parseInt(movieId));
    
    res.status(200).json({
      success: true,
      data: {
        isInWatchlist
      }
    });
  } catch (error) {
    console.error('Check watchlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking watchlist status'
    });
  }
});

module.exports = router;
