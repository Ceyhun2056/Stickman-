import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export const commentAPI = {
  getComments: (movieId) => api.get(`/comments/${movieId}`).then(res => res.data),
  addComment: (movieId, text) => api.post(`/comments/${movieId}`, { text }).then(res => res.data),
  updateComment: (commentId, text) => api.put(`/comments/${commentId}`, { text }).then(res => res.data),
  deleteComment: (commentId) => api.delete(`/comments/${commentId}`).then(res => res.data),
};
