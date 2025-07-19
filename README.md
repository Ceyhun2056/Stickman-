# Fullstack Movie Web Application

A modern fullstack movie web application built with React, Node.js, Express, and MongoDB that fetches data from The Movie Database (TMDb) API.

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
- **Frontend**: React 18 with modern hooks and context API
- **Backend**: Node.js with Express.js, RESTful API design
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT-based authentication with bcrypt password hashing
- **API Integration**: TMDb API for movie data
- **Error Handling**: Comprehensive error handling with loading states
- **Security**: CORS, input validation, and secure authentication

## Architecture

This app follows modern fullstack architecture principles:

- **Frontend**: React with functional components and hooks
- **State Management**: React Query for server state, Context API for global state
- **Backend**: RESTful API with Express.js and MongoDB
- **Authentication**: JWT tokens with secure password hashing
- **Real-time Features**: Comment system with CRUD operations

## Tech Stack

### Frontend
- **React 18**: Modern UI library with hooks
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **React Query**: Server state management
- **Framer Motion**: Animation library
- **React Hook Form**: Form handling
- **Axios**: HTTP client for API calls

### Backend
- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **MongoDB**: NoSQL database
- **Mongoose**: MongoDB object modeling
- **JWT**: JSON Web Tokens for authentication
- **Bcrypt**: Password hashing
- **Joi**: Data validation
- **CORS**: Cross-origin resource sharing

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local installation or MongoDB Atlas)
- TMDb API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/InternIntelligence_movieapplication.git
   cd InternIntelligence_movieapplication
   ```

2. **Get TMDb API Key**
   - Visit [The Movie Database (TMDb)](https://www.themoviedb.org/settings/api)
   - Create an account and request an API key
   - Copy your API key

3. **Backend Setup**
   ```bash
   cd server
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```

4. **Frontend Setup**
   ```bash
   cd client
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm start
   ```

5. **Using Docker (Alternative)**
   ```bash
   # Copy and edit environment files
   cp server/.env.example server/.env
   cp client/.env.example client/.env
   
   # Start all services
   docker-compose up --build
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api

## API Configuration

The app uses The Movie Database (TMDb) API v3 for movie data and a custom backend API for user features:

### TMDb API Endpoints
- `/trending/movie/day` - Trending movies
- `/movie/popular` - Popular movies
- `/movie/top_rated` - Top rated movies
- `/movie/now_playing` - Now playing movies
- `/movie/upcoming` - Upcoming movies
- `/search/movie` - Search movies
- `/movie/{id}` - Movie details
- `/movie/{id}/videos` - Movie trailers
- `/movie/{id}/credits` - Movie cast and crew
- `/genre/movie/list` - Movie genres

### Backend API Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `GET /api/users/movies` - Get user's favorites and watchlist
- `POST /api/users/favorites/:movieId` - Add to favorites
- `DELETE /api/users/favorites/:movieId` - Remove from favorites
- `POST /api/users/watchlist/:movieId` - Add to watchlist
- `DELETE /api/users/watchlist/:movieId` - Remove from watchlist
- `GET /api/comments/:movieId` - Get movie comments
- `POST /api/comments/:movieId` - Add comment
- `PUT /api/comments/:id` - Update comment
- `DELETE /api/comments/:id` - Delete comment

## App Structure

```
fullstack-movie-app/
├── client/                 # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/     # Reusable components
│   │   │   ├── comments/   # Comment components
│   │   │   ├── home/       # Home page components
│   │   │   ├── layout/     # Layout components
│   │   │   ├── movies/     # Movie components
│   │   │   └── ui/         # UI components
│   │   ├── contexts/       # React contexts
│   │   ├── hooks/          # Custom hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.js         # Main app component
│   ├── package.json
│   └── tailwind.config.js
├── server/                # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── middleware/    # Custom middleware
│   │   ├── models/        # Mongoose models
│   │   ├── routes/        # API routes
│   │   └── server.js      # Server entry point
│   └── package.json
├── docker-compose.yml     # Docker setup
└── README.md
```

## Key Features Implementation

### Frontend Features
- **Home Page**: Hero carousel with trending movies and categorized movie sections
- **Search & Filter**: Real-time search with genre, year, and rating filters
- **Movie Details**: Comprehensive movie information with trailers, cast, and user actions
- **Authentication**: Login/register forms with form validation
- **User Dashboard**: Favorites and watchlist management
- **Comments**: CRUD operations for movie comments
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### Backend Features
- **RESTful API**: Clean API design following REST principles
- **Authentication**: JWT-based authentication with secure password hashing
- **Database**: MongoDB with Mongoose for data modeling
- **Validation**: Input validation using Joi middleware
- **Error Handling**: Centralized error handling with proper HTTP status codes
- **CORS**: Cross-origin resource sharing configuration

## Performance Optimizations

### Frontend
- **React Query**: Efficient server state management with caching
- **Lazy Loading**: Code splitting for better initial load times
- **Image Optimization**: Proper image loading with placeholder states
- **Debounced Search**: Optimized search with 500ms delay
- **Responsive Images**: TMDb API image optimization

### Backend  
- **MongoDB Indexing**: Proper database indexing for queries
- **JWT Optimization**: Efficient token generation and verification
- **Middleware**: Custom middleware for authentication and validation
- **Error Handling**: Graceful error responses

## Error Handling

### Frontend
- **Loading States**: Comprehensive loading indicators
- **Error Boundaries**: React error boundaries for graceful failures
- **Toast Notifications**: User-friendly success/error messages
- **Form Validation**: Real-time form validation with error display

### Backend
- **Centralized Error Handling**: Consistent error response format
- **Validation Middleware**: Input validation with meaningful error messages
- **Authentication Errors**: Proper handling of auth-related errors
- **Database Errors**: MongoDB error handling and user feedback

## Testing

### Frontend Testing
```bash
cd client
npm test                    # Run unit tests
npm run test:coverage      # Run tests with coverage
```

### Backend Testing
```bash
cd server
npm test                   # Run unit tests
npm run test:integration   # Run integration tests
```

## Deployment

### Production Setup

1. **Environment Variables**
   - Set production environment variables in `.env` files
   - Use strong JWT secrets and secure database credentials

2. **Frontend Deployment** (Netlify/Vercel)
   ```bash
   cd client
   npm run build
   # Deploy the build folder
   ```

3. **Backend Deployment** (Heroku/Railway/DigitalOcean)
   ```bash
   cd server
   # Set environment variables in your hosting platform
   npm run start
   ```

4. **Database**
   - Use MongoDB Atlas for production database
   - Configure proper database indexes and security

### Docker Deployment
```bash
# Production deployment with Docker
docker-compose -f docker-compose.prod.yml up -d
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the print("Hello world")
branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments
- [The Movie Database (TMDb)](https://www.themoviedb.org/) for providing the movie data API
- [Android Jetpprint("Hello world")ack](https://developer.android.com/jetpack) for the modern Android development toolkit
- [Material Design 3](https://m3.material.io/) for the design system

## Screenshots

[Add screenshots of your app here]

## Future Enhancements

- [ ] Movie recommendations based on user preferences
- [ ] Social shprintaring features for movies
- [ ] User reviuttews and ratings system
- [ ] Movie watchlist with notification reminders
- [ ] Advanced search filters (cast, director, keywords)
- [ ] User profiles with activity history
- [ ] Real-time notifications for new comments
- [ ] Movie lists and collections
- [ ] Integration with streaming platforms
- [ ] Progressive Web App (PWA) features
- [ ] Dark/lighprint
