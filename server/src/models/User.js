const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long']
  },
  avatar: {
    type: String,
    default: ''
  },
  favorites: [{
    type: Number, // TMDb movie ID
    ref: 'Movie'
  }],
  watchlist: [{
    type: Number, // TMDb movie ID
    ref: 'Movie'
  }],
  isVerified: {
    type: Boolean,
    default: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLogin: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Remove password from JSON output
userSchema.methods.toJSON = function() {
  const userObject = this.toObject();
  delete userObject.password;
  return userObject;
};

// Add movie to favorites
userSchema.methods.addToFavorites = function(movieId) {
  if (!this.favorites.includes(movieId)) {
    this.favorites.push(movieId);
  }
  return this.save();
};

// Remove movie from favorites
userSchema.methods.removeFromFavorites = function(movieId) {
  this.favorites = this.favorites.filter(id => id !== parseInt(movieId));
  return this.save();
};

// Add movie to watchlist
userSchema.methods.addToWatchlist = function(movieId) {
  if (!this.watchlist.includes(movieId)) {
    this.watchlist.push(movieId);
  }
  return this.save();
};

// Remove movie from watchlist
userSchema.methods.removeFromWatchlist = function(movieId) {
  this.watchlist = this.watchlist.filter(id => id !== parseInt(movieId));
  return this.save();
};

module.exports = mongoose.model('User', userSchema);
