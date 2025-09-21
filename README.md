# ASSISTANT

A full-stack web application that provides personalized AI assistant services with user authentication and customization features.

## Overview

This project consists of a React frontend and Node.js/Express backend that allows users to:
- Sign up and authenticate securely
- Customize their AI assistant with personalized names and avatars
- Interact with AI-powered features through a modern web interface

## Tech Stack

### Frontend
- **React 19** - Modern UI framework
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** with **Mongoose** - Database and ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Cloudinary** - Image upload and management

## Project Structure

```
ASSISTANT/
├── Frontend/           # React application
│   ├── src/
│   │   ├── components/ # Reusable UI components
│   │   ├── pages/      # Page components
│   │   ├── context/    # React context providers
│   │   └── assets/     # Static assets
│   └── package.json
├── Backend/            # Express API server
│   ├── controllers/    # Route handlers
│   ├── models/         # Database models
│   ├── routes/         # API routes
│   ├── middlewares/    # Custom middleware
│   ├── config/         # Configuration files
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd ASSISTANT
   ```

2. **Backend Setup:**
   ```bash
   cd Backend
   npm install
   ```

   Create a `.env` file in the Backend directory:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

3. **Frontend Setup:**
   ```bash
   cd ../Frontend
   npm install
   ```

### Running the Application

1. **Start the Backend server:**
   ```bash
   cd Backend
   npm run dev
   ```
   Server will run on `http://localhost:5000`

2. **Start the Frontend development server:**
   ```bash
   cd Frontend
   npm run dev
   ```
   Application will run on `http://localhost:5173`

## Features

- **User Authentication**: Secure signup/signin with JWT tokens
- **Assistant Customization**: Personalize assistant name and avatar
- **Responsive Design**: Mobile-friendly interface with Tailwind CSS
- **Image Upload**: Profile and assistant image management via Cloudinary
- **Protected Routes**: Authenticated user access control

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/signin` - User login
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/update` - Update user information

## Development

### Frontend Commands
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend Commands
```bash
npm run dev      # Start development server with nodemon
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/assistant
JWT_SECRET=your-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Author

Created by Rohit

