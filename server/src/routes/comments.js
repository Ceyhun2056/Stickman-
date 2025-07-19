const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/auth');
const { validate, commentValidation } = require('../middleware/validation');
const Comment = require('../models/Comment');

// @desc    Get comments for a movie
// @route   GET /api/comments/:movieId
// @access  Public
router.get('/:movieId', optionalAuth, async (req, res) => {
  try {
    const { movieId } = req.params;
    const { page = 1, limit = 10, sort = 'newest' } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Determine sort order
    let sortQuery = {};
    switch (sort) {
      case 'oldest':
        sortQuery = { createdAt: 1 };
        break;
      case 'rating_high':
        sortQuery = { rating: -1, createdAt: -1 };
        break;
      case 'rating_low':
        sortQuery = { rating: 1, createdAt: -1 };
        break;
      case 'most_liked':
        // We'll sort by likes count after fetching
        sortQuery = { createdAt: -1 };
        break;
      default: // newest
        sortQuery = { createdAt: -1 };
    }
    
    const comments = await Comment.find({ movieId: parseInt(movieId) })
      .populate('user', 'username avatar')
      .populate('replies.user', 'username avatar')
      .sort(sortQuery)
      .skip(skip)
      .limit(limitNum);
    
    // Sort by likes count if requested
    if (sort === 'most_liked') {
      comments.sort((a, b) => b.likes.length - a.likes.length);
    }
    
    const totalComments = await Comment.countDocuments({ movieId: parseInt(movieId) });
    
    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalComments,
          pages: Math.ceil(totalComments / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching comments'
    });
  }
});

// @desc    Add a comment to a movie
// @route   POST /api/comments/:movieId
// @access  Private
router.post('/:movieId', protect, validate(commentValidation), async (req, res) => {
  try {
    const { movieId } = req.params;
    const { content, rating, movieTitle } = req.body;
    
    const comment = await Comment.create({
      user: req.user.id,
      movieId: parseInt(movieId),
      movieTitle: movieTitle || 'Unknown Movie',
      content,
      rating: rating || null
    });
    
    // Populate user details
    await comment.populate('user', 'username avatar');
    
    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment }
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding comment'
    });
  }
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
router.put('/:id', protect, validate(commentValidation), async (req, res) => {
  try {
    const { id } = req.params;
    const { content, rating } = req.body;
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user owns the comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only edit your own comments.'
      });
    }
    
    // Update comment
    comment.content = content;
    if (rating !== undefined) comment.rating = rating;
    comment.isEdited = true;
    comment.editedAt = new Date();
    
    await comment.save();
    await comment.populate('user', 'username avatar');
    
    res.status(200).json({
      success: true,
      message: 'Comment updated successfully',
      data: { comment }
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating comment'
    });
  }
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    // Check if user owns the comment or is admin
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own comments.'
      });
    }
    
    await Comment.findByIdAndDelete(id);
    
    res.status(200).json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting comment'
    });
  }
});

// @desc    Like/Unlike a comment
// @route   POST /api/comments/:id/like
// @access  Private
router.post('/:id/like', protect, async (req, res) => {
  try {
    const { id } = req.params;
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    const userId = req.user.id;
    const isLiked = comment.likes.includes(userId);
    
    if (isLiked) {
      // Unlike the comment
      await comment.removeLike(userId);
      res.status(200).json({
        success: true,
        message: 'Comment unliked',
        data: {
          liked: false,
          likeCount: comment.likes.length
        }
      });
    } else {
      // Like the comment
      await comment.addLike(userId);
      res.status(200).json({
        success: true,
        message: 'Comment liked',
        data: {
          liked: true,
          likeCount: comment.likes.length
        }
      });
    }
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Error liking comment'
    });
  }
});

// @desc    Add a reply to a comment
// @route   POST /api/comments/:id/reply
// @access  Private
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Reply content is required'
      });
    }
    
    const comment = await Comment.findById(id);
    
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }
    
    await comment.addReply(req.user.id, content);
    await comment.populate('replies.user', 'username avatar');
    
    const newReply = comment.replies[comment.replies.length - 1];
    
    res.status(201).json({
      success: true,
      message: 'Reply added successfully',
      data: { reply: newReply }
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding reply'
    });
  }
});

// @desc    Get user's comments
// @route   GET /api/comments/user/me
// @access  Private
router.get('/user/me', protect, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    const comments = await Comment.find({ user: req.user.id })
      .populate('user', 'username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);
    
    const totalComments = await Comment.countDocuments({ user: req.user.id });
    
    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalComments,
          pages: Math.ceil(totalComments / limitNum)
        }
      }
    });
  } catch (error) {
    console.error('Get user comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user comments'
    });
  }
});

module.exports = router;
