#!/bin/bash

echo "🎬 Setting up Fullstack Movie Application..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js v18 or higher."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d 'v' -f 2 | cut -d '.' -f 1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18 or higher is required. Current version is $(node -v)"
    exit 1
fi

print_status "Node.js version $(node -v) detected ✓"

# Setup Backend
print_status "Setting up backend..."
cd server

if [ ! -f package.json ]; then
    print_error "Backend package.json not found!"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install backend dependencies"
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    print_warning "Created .env file from .env.example. Please edit it with your configuration."
fi

print_status "Backend setup complete ✓"

# Setup Frontend
print_status "Setting up frontend..."
cd ../client

if [ ! -f package.json ]; then
    print_error "Frontend package.json not found!"
    exit 1
fi

npm install
if [ $? -ne 0 ]; then
    print_error "Failed to install frontend dependencies"
    exit 1
fi

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    cp .env.example .env
    print_warning "Created .env file from .env.example. Please edit it with your configuration."
fi

print_status "Frontend setup complete ✓"

cd ..

echo ""
print_status "🎉 Setup completed successfully!"
echo ""
print_status "Next steps:"
echo "1. Get your TMDb API key from https://www.themoviedb.org/settings/api"
echo "2. Edit server/.env and client/.env with your configuration"
echo "3. Start MongoDB (locally or use MongoDB Atlas)"
echo "4. Run the application:"
echo ""
echo "   Backend:  cd server && npm run dev"
echo "   Frontend: cd client && npm start"
echo ""
echo "   Or use Docker: docker-compose up --build"
echo ""
print_status "Happy coding! 🚀"
