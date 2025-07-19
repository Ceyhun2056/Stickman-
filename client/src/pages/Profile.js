import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserIcon, HeartIcon, BookmarkIcon, PencilIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from 'react-query';
import { userAPI } from '../services/userAPI';

const Profile = () => {
  const { user, logout } = useAuth();
  const [isEditing, setIsEditing] = useState(false);

  const { data: userMovies } = useQuery(
    'user-movies',
    userAPI.getUserMovies
  );

  const favorites = userMovies?.favorites || [];
  const watchlist = userMovies?.watchlist || [];

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-dark-800 rounded-xl p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
                <UserIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">{user?.name}</h1>
                <p className="text-gray-400">{user?.email}</p>
                <p className="text-sm text-gray-500">
                  Member since {new Date(user?.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <PencilIcon className="h-4 w-4" />
              Edit Profile
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-dark-700 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <HeartIcon className="h-6 w-6 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">{favorites.length}</div>
              <div className="text-gray-400 text-sm">Favorites</div>
            </div>
            <div className="text-center p-4 bg-dark-700 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <BookmarkIcon className="h-6 w-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">{watchlist.length}</div>
              <div className="text-gray-400 text-sm">Watchlist</div>
            </div>
            <div className="text-center p-4 bg-dark-700 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <UserIcon className="h-6 w-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">0</div>
              <div className="text-gray-400 text-sm">Reviews</div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-dark-800 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold text-white mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {favorites.slice(0, 5).map((movie, index) => (
              <div key={movie.movieId} className="flex items-center gap-4 p-4 bg-dark-700 rounded-lg">
                <img
                  src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="text-white font-medium">{movie.title}</h3>
                  <p className="text-gray-400 text-sm">Added to favorites</p>
                </div>
                <HeartIcon className="h-5 w-5 text-red-400" />
              </div>
            ))}
            {favorites.length === 0 && (
              <p className="text-gray-400 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>

        {/* Account Actions */}
        <div className="bg-dark-800 rounded-xl p-8">
          <h2 className="text-2xl font-bold text-white mb-6">Account Settings</h2>
          <div className="space-y-4">
            <button className="w-full p-4 text-left bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors">
              <div className="text-white font-medium">Change Password</div>
              <div className="text-gray-400 text-sm">Update your account password</div>
            </button>
            <button className="w-full p-4 text-left bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors">
              <div className="text-white font-medium">Notification Settings</div>
              <div className="text-gray-400 text-sm">Manage your notification preferences</div>
            </button>
            <button 
              onClick={handleLogout}
              className="w-full p-4 text-left bg-red-900/20 hover:bg-red-900/30 border border-red-900/50 rounded-lg transition-colors"
            >
              <div className="text-red-400 font-medium">Sign Out</div>
              <div className="text-red-400/70 text-sm">Sign out of your account</div>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;
