import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { motion } from 'framer-motion';
import { ChatBubbleLeftIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { commentAPI } from '../../services/commentAPI';
import toast from 'react-hot-toast';

const CommentSection = ({ movieId }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState('');
  const [editingComment, setEditingComment] = useState(null);
  const [editText, setEditText] = useState('');

  const { data: comments, isLoading } = useQuery(
    ['comments', movieId],
    () => commentAPI.getComments(movieId),
    { enabled: !!movieId }
  );

  const addCommentMutation = useMutation(
    (text) => commentAPI.addComment(movieId, text),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', movieId]);
        setNewComment('');
        toast.success('Comment added!');
      },
      onError: () => toast.error('Failed to add comment'),
    }
  );

  const updateCommentMutation = useMutation(
    ({ commentId, text }) => commentAPI.updateComment(commentId, text),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', movieId]);
        setEditingComment(null);
        setEditText('');
        toast.success('Comment updated!');
      },
      onError: () => toast.error('Failed to update comment'),
    }
  );

  const deleteCommentMutation = useMutation(
    (commentId) => commentAPI.deleteComment(commentId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['comments', movieId]);
        toast.success('Comment deleted!');
      },
      onError: () => toast.error('Failed to delete comment'),
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    addCommentMutation.mutate(newComment);
  };

  const handleEdit = (comment) => {
    setEditingComment(comment.id);
    setEditText(comment.text);
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    if (!editText.trim()) return;
    updateCommentMutation.mutate({ commentId: editingComment, text: editText });
  };

  const handleDelete = (commentId) => {
    if (window.confirm('Are you sure you want to delete this comment?')) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  return (
    <section>
      <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <ChatBubbleLeftIcon className="h-6 w-6" />
        Comments ({comments?.length || 0})
      </h2>

      {/* Add Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                className="w-full px-4 py-3 bg-dark-800 border border-dark-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-gray-400 resize-none"
                rows="3"
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || addCommentMutation.isLoading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addCommentMutation.isLoading ? 'Posting...' : 'Post Comment'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-dark-800 rounded-lg text-center">
          <p className="text-gray-400">Please log in to leave a comment</p>
        </div>
      )}

      {/* Comments List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-dark-800 rounded-lg p-4">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-dark-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-dark-700 rounded w-24 mb-2"></div>
                  <div className="h-4 bg-dark-700 rounded w-full mb-1"></div>
                  <div className="h-4 bg-dark-700 rounded w-3/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : comments && comments.length > 0 ? (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <motion.div
              key={comment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-dark-800 rounded-lg p-4"
            >
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-medium">
                    {comment.user?.name?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <h4 className="text-white font-medium">{comment.user?.name || 'Anonymous'}</h4>
                      <p className="text-gray-400 text-sm">
                        {new Date(comment.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {user && user.id === comment.user?.id && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(comment)}
                          className="text-gray-400 hover:text-white"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(comment.id)}
                          className="text-gray-400 hover:text-red-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {editingComment === comment.id ? (
                    <form onSubmit={handleUpdate}>
                      <textarea
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        className="w-full px-3 py-2 bg-dark-700 border border-dark-600 rounded text-white resize-none"
                        rows="2"
                      />
                      <div className="flex gap-2 mt-2">
                        <button
                          type="submit"
                          disabled={!editText.trim()}
                          className="px-4 py-1 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingComment(null)}
                          className="px-4 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  ) : (
                    <p className="text-gray-300">{comment.text}</p>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <ChatBubbleLeftIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-400">No comments yet. Be the first to share your thoughts!</p>
        </div>
      )}
    </section>
  );
};

export default CommentSection;
