# Fullstack Movie Web Application

A modern fullstack movie web application built with React, Node.js, Express, and MongoDB.

## 🎬 Features

### User Features
- **Browse Movies**: Discover trending, popular, and top-rated movies from TMDb API
- **Search & Filter**: Search movies by title, filter by genre, rating, and year
- **Movie Details**: View comprehensive movie information with trailers, cast, and descriptions
- **User Authentication**: Secure signup/login with JWT authentication
- **Favorites & Watchlist**: Save movies to personal favorites and watchlist
- **Comments System**: Post, edit, and delete comments on movies
- **Responsive Design**: Mobile-first design with Tailwind CSS

### Technical Features
- **Frontend**: React 18 with TypeScript, Redux Toolkit for state management
- **Backend**: Node.js with Express.js, RESTful API design
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Integration**: TMDb API for movie data
- **Error Handling**: Comprehensive error handling with loading states
- **Security**: CORS, helmet.js, rate limiting, input validation

## 🚀 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Redux Toolkit** for state management
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Axios** for API calls
- **React Hook Form** for form handling
- **Framer Motion** for animations

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Joi** for validation
- **Helmet** for security
- **CORS** for cross-origin requests
- **Rate limiting** for API protection

## 📁 Project Structure

```
fullstack-movie-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Redux store
│   │   ├── services/      # API services
│   │   ├── hooks/         # Custom hooks
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Custom middleware
│   │   ├── utils/         # Utility functions
│   │   └── config/        # Configuration files
│   ├── package.json
│   └── .env
├── README.md
└── docker-compose.yml     # For easy MongoDB setup
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or MongoDB Atlas)
- TMDb API key

### Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fullstack-movie-app
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   cd server
   npm install
   
   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. **Environment Variables**
   Create `.env` files in both client and server directories:
   
   **server/.env**
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/movieapp
   JWT_SECRET=your_jwt_secret_here
   TMDB_API_KEY=your_tmdb_api_key_here
   TMDB_BASE_URL=https://api.themoviedb.org/3
   ```
   
   **client/.env**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_TMDB_IMAGE_BASE_URL=https://image.tmdb.org/t/p
   ```

4. **Start the application**
   ```bash
   # Start backend (from server directory)
   npm run dev
   
   # Start frontend (from client directory, in new terminal)
   npm start
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Movies
- `GET /api/movies/trending` - Get trending movies
- `GET /api/movies/popular` - Get popular movies
- `GET /api/movies/search` - Search movies
- `GET /api/movies/:id` - Get movie details

### User Features
- `GET /api/users/favorites` - Get user favorites
- `POST /api/users/favorites/:movieId` - Add to favorites
- `DELETE /api/users/favorites/:movieId` - Remove from favorites
- `GET /api/users/watchlist` - Get user watchlist
- `POST /api/users/watchlist/:movieId` - Add to watchlist

### Comments
- `GET /api/comments/:movieId` - Get movie comments
- `POST /api/comments/:movieId` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## 🎨 Key Features

### Frontend Features
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Loading States**: Skeleton loaders and loading indicators
- **Error Handling**: User-friendly error messages
- **Search**: Real-time search with debouncing
- **Filtering**: Filter by genre, rating, and year
- **Pagination**: Infinite scroll for movie lists
- **Responsive**: Mobile-first responsive design

### Backend Features
- **RESTful API**: Clean API design following REST principles
- **Authentication**: JWT-based auth with refresh tokens
- **Validation**: Input validation with Joi
- **Security**: Rate limiting, CORS, helmet.js
- **Error Handling**: Centralized error handling
- **Database**: MongoDB with Mongoose ODM

## 🚀 Deployment

### Using Docker
```bash
# Build and run with Docker Compose
docker-compose up --build
```

### Manual Deployment
1. **Frontend**: Build and deploy to Netlify/Vercel
2. **Backend**: Deploy to Heroku/Railway/DigitalOcean
3. **Database**: Use MongoDB Atlas for cloud database

## 🧪 Testing

```bash
# Run backend tests
cd server
npm test

# Run frontend tests
cd client
npm test
```

## 📱 Screenshots

[Add screenshots of your application here]

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [TMDb API](https://www.themoviedb.org/documentation/api) for movie data
- [React](https://reactjs.org/) for the frontend framework
- [Express.js](https://expressjs.com/) for the backend framework
- [MongoDB](https://www.mongodb.com/) for the database
